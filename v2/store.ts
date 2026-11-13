// Sasha's store knowledge, on the agent side: fast search over the enriched catalog and a quick
// three-outfit builder. Everything here runs in the agent process; the page only displays results.
//   search()       Gemini embeddings of every product (catalog/embeddings.json) vs the shopper's words.
//   buildOutfits() narrows each outfit slot to the best matches, then Gemini Flash Lite picks 3 looks.
import { GoogleGenAI, Type } from '@google/genai';
import { existsSync, readFileSync } from 'node:fs';

export const EMBED_MODEL = 'gemini-embedding-001';
export const EMBED_DIMS = 768;
const OUTFIT_MODEL = process.env.OUTFIT_MODEL ?? 'gemini-3.5-flash-lite';
const FORMALITY = ['', 'gym or lounge', 'casual', 'smart casual', 'business or cocktail', 'black tie'];

/** The text each product is embedded from: what it is, how it looks, and when to wear it. */
export function embedText(p: any, e: any = {}) {
  return [
    `${p.gender}'s ${p.category} / ${p.subcategory}: ${p.title} by ${p.brand}.`,
    e.visual_description,
    e.slot && `Outfit slot: ${e.slot}. Style: ${p.style}. Formality: ${FORMALITY[e.formality] ?? ''}.`,
    e.photo_color && `Color: ${e.photo_color} (${e.color_family}), ${e.pattern}. Fabric: ${e.fabric}. Fit: ${e.fit}.`,
    e.occasions?.length && `Good for: ${e.occasions.join(', ')}.`,
    e.seasons?.length && `Seasons: ${e.seasons.join(', ')}.`,
    e.pairs_with?.length && `Pairs with: ${e.pairs_with.join(', ')}.`,
  ].filter(Boolean).join(' ');
}

const root = (p: string) => new URL(p, import.meta.url);
const products: any[] = JSON.parse(readFileSync(root('../data/catalog/products.json'), 'utf8'));
const enriched: Record<string, any> = JSON.parse(readFileSync(root('./catalog/enriched.json'), 'utf8'));
const EMB_FILE = root('./catalog/embeddings.json');
const vectors: Record<string, number[]> = existsSync(EMB_FILE) ? JSON.parse(readFileSync(EMB_FILE, 'utf8')) : {};
export const byId: Record<string, any> = Object.fromEntries(products.map((p) => [p.id, p]));
export const storeReady = Object.keys(vectors).length > 0;

let client: GoogleGenAI | null = null; // made on first use, after the caller loads .env.local
const ai = () => (client ??= new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY }));

const norm = (v: number[]) => Math.sqrt(v.reduce((a, x) => a + x * x, 0));
const norms: Record<string, number> = Object.fromEntries(Object.entries(vectors).map(([id, v]) => [id, norm(v)]));
const cosine = (q: number[], qn: number, id: string) => {
  const v = vectors[id];
  let dot = 0;
  for (let i = 0; i < v.length; i++) dot += q[i] * v[i];
  return dot / (qn * norms[id]);
};

async function embedQuery(text: string) {
  const res = await ai().models.embedContent({
    model: EMBED_MODEL,
    contents: [text],
    config: { taskType: 'RETRIEVAL_QUERY', outputDimensionality: EMBED_DIMS },
  });
  return res.embeddings![0].values!;
}

const inStock = (p: any) => Object.values(p.simulated.inventory ?? {}).some((n: any) => n > 0);
const usable = (p: any) => inStock(p) && enriched[p.id]?.photo_matches_title !== false;

export interface SearchFilters {
  query: string;
  gender?: 'men' | 'women';
  max_price?: number;
  just_in?: boolean;
  on_sale?: boolean;
  /** Outfit slots to keep, e.g. ["shoes"]. */
  slots?: string[];
  limit?: number;
}

/** The products closest to the shopper's words, best first. */
export async function search(f: SearchFilters) {
  const q = await embedQuery(f.query);
  const qn = norm(q);
  return products
    .filter((p) => usable(p) && vectors[p.id]
      && (!f.gender || p.gender === f.gender)
      && (!f.max_price || p.simulated.price <= f.max_price)
      && (!f.just_in || p.simulated.just_in)
      && (!f.on_sale || p.simulated.on_sale)
      && (!f.slots?.length || f.slots.includes(enriched[p.id]?.slot)))
    .map((p) => ({ p, score: cosine(q, qn, p.id) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, f.limit ?? 6)
    .map(({ p }) => p);
}

/** Everything worth saying about one piece in an outfit, plus the sizes he can actually get. */
export function details(p: any) {
  const e = enriched[p.id] ?? {};
  return {
    ...brief(p),
    pattern: e.pattern !== 'solid' ? e.pattern : undefined,
    looks_like: e.visual_description,
    pairs_with: e.pairs_with,
    sizes_in_stock: p.size_type === 'one' ? undefined : p.sizes.filter((s: string) => p.simulated.inventory[s] > 0),
  };
}

/** Short facts Sasha can talk about, small enough for a tool result. */
export function brief(p: any) {
  const e = enriched[p.id] ?? {};
  return {
    product_id: p.id,
    title: p.title.replace(/\s*\|.*$/, ''),
    brand: p.brand,
    price: p.simulated.price,
    color: e.photo_color,
    fabric: e.fabric !== 'unknown' ? e.fabric : undefined,
    fit: e.fit !== 'n/a' ? e.fit : undefined,
    just_in: p.simulated.just_in || undefined,
    on_sale: p.simulated.on_sale || undefined,
    sasha_note: e.sasha_line,
  };
}

// ---- Outfits ----

export interface OutfitBrief {
  occasion: string;
  budget_usd: number;
  gender: 'men' | 'women';
  /** His style, likes, dislikes and what you can see him wearing. */
  notes?: string;
}

export interface Outfit {
  outfit_name: string;
  /** One line on how this look differs from the other two. */
  difference: string;
  /** Two or three sentences on how the pieces work together. */
  why_it_works: string;
  items: { product_id: string; slot: string; why: string }[];
  total_usd: number;
}

// Which catalog slots fill each outfit role. Suits and one-pieces replace top + bottom.
const ROLES: Record<string, string[]> = { top: ['top'], layer: ['layer'], bottom: ['bottom'], suit: ['suit', 'one-piece'], shoes: ['shoes'] };
const PER_ROLE = 14;

const outfitSchema = {
  type: Type.OBJECT,
  properties: {
    outfits: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          outfit_name: { type: Type.STRING, description: 'Short, fun name, 2 to 4 words.' },
          difference: { type: Type.STRING, description: 'One spoken sentence, outfit name first, on its feel and where it shines compared with the others, e.g. "The Clove Blue Sharp is the one for a board meeting." or "The Olive Cordura Edge reads higher-end but still a little dressed down."' },
          why_it_works: { type: Type.STRING, description: 'Three spoken sentences on what makes the pairing interesting: how specific pieces play off each other in color, fabric, texture and how dressed-up each is, naming the pieces. Plain words, a little attitude, no prices.' },
          items: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                product_id: { type: Type.STRING },
                slot: { type: Type.STRING, description: 'Top, Layer, Bottom, Suit, Dress or Shoes.' },
                why: { type: Type.STRING, description: 'Under 12 words on why this piece is in the look.' },
              },
              required: ['product_id', 'slot', 'why'],
            },
          },
        },
        required: ['outfit_name', 'difference', 'why_it_works', 'items'],
      },
    },
  },
  required: ['outfits'],
};

/** Three complete, different outfits inside the budget, usually in 3 to 6 seconds. */
export async function buildOutfits(b: OutfitBrief): Promise<{ outfits: Outfit[]; ms: number }> {
  const t0 = Date.now();
  const query = `${b.gender}'s outfit for ${b.occasion}. ${b.notes ?? ''}`;
  const q = await embedQuery(query);
  const qn = norm(q);
  const ceiling = b.budget_usd * 0.5; // no single piece eats the whole budget
  const pool = products.filter((p) => usable(p) && vectors[p.id] && p.gender === b.gender && p.simulated.price <= ceiling);
  const lists = Object.entries(ROLES).map(([role, slots]) => {
    const best = pool.filter((p) => slots.includes(enriched[p.id]?.slot))
      .map((p) => ({ p, s: cosine(q, qn, p.id) })).sort((x, y) => y.s - x.s).slice(0, PER_ROLE);
    const lines = best.map(({ p }) => {
      const e = enriched[p.id];
      return `${p.id} | $${p.simulated.price} | ${p.title.replace(/\s*\|.*$/, '')} | ${e.photo_color}, ${e.fabric}, ${e.fit}, formality ${e.formality}`;
    });
    return `${role.toUpperCase()}:\n${lines.join('\n')}`;
  });

  const prompt = `You are a sharp menswear and womenswear stylist. Build 4 complete outfits for this shopper.
Occasion: ${b.occasion}
Budget: up to $${b.budget_usd} per outfit, all pieces together. Add up each outfit's prices before you answer and leave a little room.
Department: ${b.gender}'s
About the shopper: ${b.notes || 'nothing yet'}

Rules:
- Use only product ids from the lists below.
- Each outfit is a top and a bottom (or a suit or dress instead of both), plus shoes. Add a layer only when it helps and the budget allows.
- Every outfit's total must be at or under $${b.budget_usd}.
- In "difference", compare with "the others" and never say how many outfits there are.
- Make the outfits clearly different from each other (for example sharper, more relaxed, more edge), all right for the occasion.
- Colors and formality must work together within each outfit.

${lists.join('\n\n')}`;

  const ask = async (text: string) => {
    const res = await ai().models.generateContent({
      model: OUTFIT_MODEL,
      contents: text,
      config: { responseMimeType: 'application/json', responseSchema: outfitSchema, temperature: 0.6 },
    });
    return (JSON.parse(res.text ?? '{}').outfits ?? []).map((o: any) => {
      const items = o.items.filter((it: any) => byId[it.product_id]);
      const total = items.reduce((a: number, it: any) => a + byId[it.product_id].simulated.price, 0);
      return { ...o, items, total_usd: Math.round(total * 100) / 100 };
    }).filter((o: Outfit) => o.items.length >= 2) as Outfit[];
  };
  const fits = (o: Outfit) => o.total_usd <= b.budget_usd;

  const all = await ask(prompt);
  let outfits = all.filter(fits).slice(0, 3);
  if (outfits.length < 3) {
    // The model can't add up reliably: send back the ones that went over, with their real totals, once.
    const over = all.filter((o) => !fits(o)).map((o) =>
      `${o.outfit_name}: total $${o.total_usd} (${o.items.map((it) => `${it.product_id} $${byId[it.product_id].simulated.price}`).join(', ')})`);
    const fix = await ask(`${prompt}

These outfits went over the $${b.budget_usd} budget:
${over.join('\n')}
Build ${4 - outfits.length} new outfits that stay under budget and differ from: ${outfits.map((o) => o.outfit_name).join(', ') || 'none'}.`);
    outfits = [...outfits, ...fix.filter(fits)].slice(0, 3);
  }
  return { outfits, ms: Date.now() - t0 };
}

// ---- Photo walkthrough: what each product photo shows, so Sasha can flip through them and talk ----
const SITE_PHOTOS = 'https://mhalpert.github.io/mens-fashion-barn/data/catalog/';
const photoNotes = new Map<string, Promise<PhotoNote[]>>();

/** One short note per product photo (the angle and the fine details you can see), cached per product. */
/** What a photo shows, and where its fine details sit (x, y from 0 to 1000, left/top = 0), so the pointer can glide over them. */
export type PhotoNote = { say: string; spots: { detail: string; x: number; y: number }[] };
export function describePhotos(p: any): Promise<PhotoNote[]> {
  if (!photoNotes.has(p.id)) {
    const run = (async () => {
      const pics = await Promise.all(p.images.map(async (path: string) => {
        const res = await fetch(SITE_PHOTOS + path.replace(/\.(png|jpe?g)$/i, '.webp'));
        if (!res.ok) throw new Error(`photo ${res.status}`);
        return Buffer.from(await res.arrayBuffer()).toString('base64');
      }));
      const res = await ai().models.generateContent({
        model: OUTFIT_MODEL,
        contents: [{ role: 'user', parts: [
          ...pics.map((data) => ({ inlineData: { mimeType: 'image/webp', data } })),
          { text: `These are the ${pics.length} product photos, in order, for "${p.title}" by ${p.brand}. Product copy: ${p.description ?? ''}
For each photo, write one or two short spoken sentences a stylist would say while showing it: the angle or view, then the fine details you can actually see in it (fabric texture like herringbone or ribbing, stitching, buttons, lining, collar, cuffs, hardware, how it drapes or fits on the model). Only what is visible. No prices.
Also give the one or two details of this product itself (never the model, other clothes or props) that you mention and that sit in a specific spot, each with a 2-4 word label and its point in that photo: x and y from 0 to 1000 (x from the left edge, y from the top edge), right on the detail. Say them in the same order as in your sentences.` },
        ] }],
        config: {
          responseMimeType: 'application/json',
          responseSchema: { type: Type.OBJECT, required: ['photos'], properties: { photos: { type: Type.ARRAY, items: { type: Type.OBJECT, required: ['say', 'spots'], properties: {
            say: { type: Type.STRING },
            spots: { type: Type.ARRAY, items: { type: Type.OBJECT, required: ['detail', 'x', 'y'], properties: { detail: { type: Type.STRING }, x: { type: Type.NUMBER }, y: { type: Type.NUMBER } } } },
          } } } } },
        },
      });
      return (JSON.parse(res.text ?? '{}').photos ?? []) as PhotoNote[];
    })();
    run.catch(() => photoNotes.delete(p.id));
    photoNotes.set(p.id, run);
  }
  return photoNotes.get(p.id)!;
}
