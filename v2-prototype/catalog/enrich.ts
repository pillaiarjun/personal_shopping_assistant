// Catalog enrichment: Gemini looks at each product's photo + text once and fills in the
// fields a stylist needs (color family, fabric, fit, formality, season, outfit slot...).
//
// Run:   node catalog/enrich.ts [limit] [ids...]
//   limit  only do this many new items (default: all)
//   ids    only these product ids, e.g. MW-0230 WW-0276
// Output: catalog/enriched.json (keyed by product id). Safe to stop and re-run: items
// already done are skipped.
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import sharp from 'sharp';
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
dotenv.config({ path: '.env.local', quiet: true });

const MODEL = process.env.ENRICH_MODEL ?? 'gemini-3.5-flash-lite';
const CONCURRENCY = Number(process.env.ENRICH_CONCURRENCY ?? 8);
const SITE_PHOTOS = 'https://mhalpert.github.io/mens-fashion-barn/data/catalog/';
const OUT = new URL('./enriched.json', import.meta.url);
const CATALOG_PATHS = ['../../data/catalog/products.json', '../../personal_shopping_assistant/data/catalog/products.json'];
const CATALOG_FILE = CATALOG_PATHS.map((p) => new URL(p, import.meta.url)).find((u) => existsSync(u))!;
const CATALOG = CATALOG_FILE;

const COLOR_FAMILIES = ['black', 'white', 'cream', 'gray', 'navy', 'blue', 'green', 'olive', 'brown', 'tan',
  'red', 'burgundy', 'pink', 'purple', 'yellow', 'orange', 'gold', 'silver', 'multi'];
const SLOTS = ['top', 'layer', 'bottom', 'one-piece', 'suit', 'shoes', 'bag', 'belt', 'neckwear', 'jewelry',
  'headwear', 'eyewear', 'socks', 'underwear', 'swim', 'other-accessory'];

const schema = {
  type: Type.OBJECT,
  properties: {
    slot: { type: Type.STRING, enum: SLOTS, description: 'Where this goes in an outfit. layer = jacket, blazer, cardigan, coat worn over a top. suit = a full matching suit or tuxedo sold as a set.' },
    color: { type: Type.STRING, description: 'Main color in plain words, as seen in the photo, e.g. "dark olive green".' },
    color_family: { type: Type.STRING, enum: COLOR_FAMILIES },
    accent_colors: { type: Type.ARRAY, items: { type: Type.STRING } },
    pattern: { type: Type.STRING, enum: ['solid', 'stripe', 'check', 'print', 'floral', 'graphic', 'textured', 'colorblock', 'other'] },
    fabric: { type: Type.STRING, description: 'Main material, from the text if stated, else what the photo clearly shows. "unknown" if unclear.' },
    fit: { type: Type.STRING, description: 'Fit or shape in a few words, e.g. "slim", "relaxed straight leg", "oversized", "n/a".' },
    formality: { type: Type.INTEGER, description: '1 = gym/lounge, 2 = casual, 3 = smart casual, 4 = business / cocktail, 5 = black tie.' },
    seasons: { type: Type.ARRAY, items: { type: Type.STRING, enum: ['spring', 'summer', 'fall', 'winter'] } },
    occasions: { type: Type.ARRAY, items: { type: Type.STRING }, description: '3 to 6 short occasions, e.g. "beach wedding", "office", "date night".' },
    visual_description: { type: Type.STRING, description: 'One or two factual sentences describing exactly what the item looks like, for search.' },
    sasha_line: { type: Type.STRING, description: 'One short spoken line from Sasha, a direct, funny New York stylist, about why this piece works. Under 20 words, plain words, a little attitude, and specific to this item. Never start with "Nothing", never say "darling", "elevate", "chic", "effortless" or "MVP". No price, no claims the text does not support.' },
    pairs_with: { type: Type.ARRAY, items: { type: Type.STRING }, description: '3 to 5 kinds of pieces it pairs well with, e.g. "white leather sneakers".' },
    photo_type: { type: Type.STRING, enum: ['product-only', 'on-model', 'detail', 'multiple-items', 'unclear'] },
    photo_matches_title: { type: Type.BOOLEAN, description: 'False if the photo clearly shows a different item than the title.' },
  },
  required: ['slot', 'color', 'color_family', 'pattern', 'fabric', 'fit', 'formality', 'seasons', 'occasions',
    'visual_description', 'sasha_line', 'pairs_with', 'photo_type', 'photo_matches_title'],
  propertyOrdering: ['slot', 'color', 'color_family', 'accent_colors', 'pattern', 'fabric', 'fit', 'formality', 'seasons',
    'occasions', 'visual_description', 'sasha_line', 'pairs_with', 'photo_type', 'photo_matches_title'],
};

async function photo(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`photo ${res.status}`);
  return sharp(Buffer.from(await res.arrayBuffer())).flatten({ background: '#ffffff' })
    .resize({ width: 640, height: 640, fit: 'inside' }).jpeg({ quality: 80 }).toBuffer();
}

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

async function enrich(p: any) {
  // First working photo: the brand's CDN, then the copy on the Fashion Barn site.
  const urls = [...p.source_images, ...p.images.map((i: string) => SITE_PHOTOS + i.replace(/\.(png|jpe?g)$/i, '.webp'))];
  let img: Buffer | null = null;
  for (const u of urls) { try { img = await photo(u); break; } catch { /* try the next one */ } }
  if (!img) throw new Error('no working photo');
  const text = `You are cataloguing a product for a fashion store's stylist. Use the photo and the text below.
Only state what the photo or text supports. Department: ${p.gender}'s.
Title: ${p.title}
Brand: ${p.brand}
Category: ${p.category} / ${p.subcategory}
Store style tag: ${p.style}
Description: ${p.description}
Details: ${(p.details ?? []).join('; ') || 'none'}
Listed colors: ${(p.colors ?? []).join(', ')}`;
  const res = await ai.models.generateContent({
    model: MODEL,
    contents: [{ role: 'user', parts: [{ inlineData: { mimeType: 'image/jpeg', data: img.toString('base64') } }, { text }] }],
    config: { responseMimeType: 'application/json', responseSchema: schema, temperature: 0.2 },
  });
  return JSON.parse(res.text ?? '{}');
}

const catalog: any[] = JSON.parse(await readFile(CATALOG, 'utf8'));
const done: Record<string, any> = existsSync(OUT) ? JSON.parse(await readFile(OUT, 'utf8')) : {};
const [limitArg, ...ids] = process.argv.slice(2);
let todo = catalog.filter((p) => !done[p.id] && (ids.length === 0 || ids.includes(p.id)));
if (limitArg && Number(limitArg) > 0) todo = todo.slice(0, Number(limitArg));
console.log(`${Object.keys(done).length} done already, ${todo.length} to do with ${MODEL}`);

const t0 = Date.now();
let finished = 0;
let failed = 0;
let saving = Promise.resolve();
const save = () => (saving = saving.then(() => writeFile(OUT, JSON.stringify(done, null, 1))));

async function worker() {
  while (todo.length) {
    const p = todo.shift()!;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        done[p.id] = { ...(await enrich(p)), model: MODEL };
        break;
      } catch (e) {
        const msg = (e as Error).message ?? String(e);
        if (attempt === 3) { failed++; console.log(`  ${p.id} failed: ${msg.slice(0, 120)}`); }
        else await new Promise((r) => setTimeout(r, (/429|quota/i.test(msg) ? 20000 : 2000) * attempt));
      }
    }
    finished++;
    if (finished % 25 === 0) { await save(); console.log(`  ${finished} done, ${((Date.now() - t0) / 1000).toFixed(0)} s`); }
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker));
await save();
await saving;
console.log(`finished ${finished - failed}, failed ${failed}, ${((Date.now() - t0) / 1000).toFixed(0)} s`);
