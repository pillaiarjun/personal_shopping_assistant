// Sasha's store tools. Search and outfit building run here in the agent (store.ts); the page in the
// shopper's browser only shows the results. The agent drives the page with LiveKit RPC calls on
// method "barn" (handled in web/sasha-live.ts, which calls window.Barn in site/barn.js).
import { type JobContext, llm } from '@livekit/agents';
import { z } from 'zod';
import { brief, buildOutfits, byId, describePhotos, details, search, type Outfit, type PhotoNote } from './store.ts';
import { readSnapshot, tryOn } from './tryon.ts';

type Log = (msg: string, extra?: unknown) => void;

export interface ToolHooks {
  start(name: string, args?: unknown): void;
  end(name: string, result?: unknown): void;
  /** Every page action, for the call log. */
  page?(action: string, args: unknown, result: unknown): void;
  /** What has already happened in this call (agent.ts also fills it from Sasha's own words). */
  flow?: Flow;
}
/** The call's progress, kept in code so Sasha doesn't ask the same thing twice. */
export interface Flow { done: Set<string>; note(): string | undefined; userTurns: number; said: { text: string; turn: number }[] }
export function newFlow(): Flow {
  const LABELS: Record<string, string> = {
    new_arrivals: 'shown the new arrivals', vibe_question: 'asked whether he is shopping for an event or occasion',
    budget: 'asked his budget', step_back: 'asked him to step back', build_around: 'asked if he has something to build around',
    outfits: 'built the three outfits', picked: 'walked him through the outfit he picked', see_it_question: 'asked "Want to see it on you?"',
    reveal: 'shown him wearing it', sizes_question: 'asked his sizes', bagged: 'put the outfit in his bag', second_outfit: 'offered a second outfit',
  };
  const done = new Set<string>();
  return {
    done,
    userTurns: 0,
    said: [],
    note: () => (done.size ? `Already done in this call, so never again: ${[...done].map((k) => LABELS[k] ?? k).join('; ')}.` : undefined),
  };
}

// Sizes as people say them vs the store's labels ("L - 42", "32W x 32L", "10D").
const norm = (s: string) => String(s).toLowerCase().replace(/\b(size|waist|shoes?|top|us|in)\b/g, '').replace(/\s+/g, '').replace(/^(large)$/, 'l').replace(/^(medium)$/, 'm').replace(/^(small)$/, 's');
function matchSize(p: any, asked: string): string | undefined {
  const a = norm(asked);
  return p.sizes.find((x: string) => norm(x) === a) ?? p.sizes.find((x: string) => norm(x).startsWith(a + '-') || norm(x).startsWith(a + 'w') || norm(x) === a + 'd' || norm(x).split(/[-/]/)[0] === a);
}
// For tests: TEST_SOLD_OUT=shoes:10 makes every shoe in size 10 look sold out.
const [soldSlot, soldSize] = (process.env.TEST_SOLD_OUT ?? '').split(':');
const inStock = (p: any, size: string, slot?: string) =>
  !(soldSlot && (slot ?? '').toLowerCase().replace('footwear', 'shoes').includes(soldSlot) && norm(size) === norm(soldSize)) && (p.simulated.inventory[size] ?? 0) > 0;


export function storeTools(ctx: JobContext, log: Log, hooks?: ToolHooks) {
  // ---- talking to the page ----
  const shopper = () => [...ctx.room.remoteParticipants.values()].find((p) => p.identity.startsWith('shopper-'))?.identity;
  async function page(action: string, args: Record<string, unknown> = {}) {
    const to = shopper();
    if (!to) return { ok: false, error: 'The shopper has left the call' };
    try {
      const out = JSON.parse(await ctx.room.localParticipant!.performRpc({ destinationIdentity: to, method: 'barn', payload: JSON.stringify({ action, ...args }) }));
      hooks?.page?.(action, args, out);
      return out;
    } catch (e) {
      log(`page ${action} failed`, (e as Error).message);
      return { ok: false, error: 'The store page did not respond' };
    }
  }

  // ---- outfits and their try-on pictures (started as soon as the outfits are on screen) ----
  let outfits: Outfit[] = [];
  let pictures: (Promise<string> | null)[] = [];
  const startPicture = async (i: number) => {
    const snap = await readSnapshot();
    if (!snap) throw new Error('No camera picture of the shopper yet');
    const t0 = Date.now();
    const file = await tryOn(snap, outfits[i].items.map((it) => it.product_id), `outfit-${i + 1}`);
    log(`try-on ${i + 1} ready in ${((Date.now() - t0) / 1000).toFixed(1)} s -> ${file}`);
    return file;
  };
  const picture = (i: number) => {
    if (!pictures[i]) {
      const job = startPicture(i);
      job.catch((e) => { log(`try-on ${i + 1} failed`, e.message); pictures[i] = null; }); // a later ask retries
      pictures[i] = job;
    }
    return pictures[i]!;
  };

  const item = (id: string) => {
    const b = brief(byId[id]);
    return { product_id: id, title: b.title, brand: b.brand, price: b.price, color: b.color };
  };

  let openId = '';
  let tourTimer: ReturnType<typeof setTimeout> | undefined;
  const PHOTO_SECONDS = 6;
  const PIECE_SECONDS = 6;
  /** Runs page steps one after another, a few seconds apart, while Sasha talks. A new tour cancels the old one. */
  function tour(steps: (() => Promise<unknown>)[], gapMs: number) {
    clearTimeout(tourTimer);
    let k = 0;
    const next = async () => { if (k < steps.length) { await steps[k++](); tourTimer = setTimeout(next, gapMs); } };
    return next();
  }
  let picked: number | null = null;
  // She sometimes names a piece instead of giving its id ("the jacket", "product_id_jacket_outfit_2").
  // Find the real product: an exact id, an id inside the text, or a piece of the picked outfit whose slot/title matches.
  const SLOT_WORDS: Record<string, string[]> = { shoes: ['shoe', 'loafer', 'sneaker', 'boot', 'footwear'], pants: ['pant', 'trouser', 'chino', 'jean', 'denim', 'bottom', 'waist'], top: ['shirt', 'polo', 'sweater', 'knit', 'tee', 'top'], outer: ['jacket', 'blazer', 'coat', 'suit', 'outer', 'layer'] };
  function resolveId(ref: string, outfitNo?: number): string | undefined {
    if (byId[ref]) return ref;
    const m = ref.toUpperCase().match(/MW-\d+/);
    if (m && byId[m[0]]) return m[0];
    const words = ref.toLowerCase().split(/[^a-z]+/).filter((w) => w.length > 2);
    const pool = outfitNo ?? picked ? [outfits[(outfitNo ?? picked)! - 1]] : outfits;
    for (const o of pool) for (const it of o?.items ?? []) {
      const hay = `${it.slot} ${byId[it.product_id]?.title} ${byId[it.product_id]?.category}`.toLowerCase();
      const keys = Object.entries(SLOT_WORDS).filter(([, ws]) => ws.some((w) => hay.includes(w))).flatMap(([, ws]) => ws);
      if (words.some((w) => hay.includes(w) || keys.some((k) => w.startsWith(k)))) return it.product_id;
    }
    return undefined;
  }
  const heard = new Map<string, number>(); // "MW-0383:L" -> his turn count when she was told to read it back (or offered it)
  let lastBuild: { budget: number; at: number; run: Promise<unknown> } | null = null;
  async function buildAndShow({ occasion, budget_usd, gender, notes }: { occasion: string; budget_usd: number; gender: 'men' | 'women'; notes?: string }) {
        if (!(budget_usd > 0)) return { ok: false, error: 'Ask for his budget first.' };
        const result = await buildOutfits({ occasion, budget_usd: Math.min(budget_usd, 10000), gender, notes });
        log(`outfits for "${occasion}" ($${budget_usd}): ${result.outfits.length} in ${result.ms} ms`);
        if (!result.outfits.length) return { ok: false, error: 'No outfits came back. Try a broader occasion or a higher budget.' };
        outfits = result.outfits;
        pictures = [];
        await page('show_looks', {
          result: {
            looks: outfits.map((o) => ({ outfit_name: o.outfit_name, items: o.items.map(({ product_id, slot, why }) => ({ product_id, slot, why })), total_usd: o.total_usd })),
            spoken_summary: outfits.map((o) => `${o.outfit_name}: ${o.difference}`).join(' '),
          },
        });
        outfits.forEach((_, i) => picture(i)); // the reveal is ready by the time he picks
        for (const o of outfits) for (const it of o.items) if (byId[it.product_id]) describePhotos(byId[it.product_id]).catch(() => {});
        log(outfits.map((o, i) => `outfit ${i + 1} ${o.outfit_name}: ${o.items.map((it) => byId[it.product_id]?.title).join(' + ')}`).join('\n'));
        hooks?.flow?.done.add('outfits');
        picked = null;
        return {
          ok: true,
          already: hooks?.flow?.note(),
          say_next: 'All three are on his screen now. Even if he spoke while you waited, introduce each one by name in one sentence about its feel and where it shines (its intro), then ask which he likes. Save the piece-by-piece detail for after he picks.',
          outfits: outfits.map((o, i) => ({
            number: i + 1, name: o.outfit_name, intro: o.difference, how_it_works: o.why_it_works,
            total_usd: o.total_usd, items: o.items.map((it) => ({ slot: it.slot, why: it.why, ...details(byId[it.product_id]) })),
          })),
        };
  }

  const tools = {
    search_products: llm.tool({
      description: 'Find products in the store and put them on his screen. Use for any single-item request ("show me loafers", "something in linen"). Returns the products shown, best match first.',
      parameters: z.object({
        query: z.string().describe('What he wants, in plain words, with any style, color, fabric or occasion: "brown suede loafers for a summer wedding".'),
        gender: z.enum(['men', 'women']).describe('The department you decided on.'),
        max_price: z.number().optional().describe('Top price per item in dollars, if he gave one.'),
        just_in: z.boolean().optional().describe('Only new arrivals.'),
        on_sale: z.boolean().optional().describe('Only sale items.'),
        heading: z.string().optional().describe('A short heading for the page, like "Loafers for the wedding".'),
      }),
      execute: async ({ query, gender, max_price, just_in, on_sale, heading }) => {
        const t0 = Date.now();
        const found = await search({ query, gender, max_price, just_in, on_sale, limit: 6 });
        log(`search "${query}": ${found.length} in ${Date.now() - t0} ms`);
        if (!found.length) return { shown: 0, note: 'Nothing matched. Loosen the search or try other words.' };
        await page('show_products', { ids: found.map((p) => p.id), heading: heading ?? query });
        return { shown: found.length, products: found.map(brief), already: hooks?.flow?.note() };
      },
    }),

    show_new_arrivals: llm.tool({
      description: 'Right after your first read of his outfit: put the new arrivals that match what he is wearing on his screen. Returns the pieces shown; name three of them.',
      parameters: z.object({
        wearing: z.string().describe('What you can see him wearing and its vibe: "brown zip-up track jacket, gray sweatpants, casual and sporty".'),
        gender: z.enum(['men', 'women']),
      }),
      execute: async ({ wearing, gender }) => {
        const t0 = Date.now();
        const found = await search({ query: `new everyday pieces in the same spirit as: ${wearing}`, gender, just_in: true, slots: ['top', 'layer', 'bottom', 'shoes'], limit: 6 });
        log(`new arrivals like "${wearing}": ${found.length} in ${Date.now() - t0} ms`);
        if (!found.length) return { shown: 0, note: 'No new arrivals matched. Skip to the vibe question.' };
        await page('show_products', { ids: found.map((p) => p.id), heading: 'Just in, picked for you' });
        hooks?.flow?.done.add('new_arrivals');
        return { shown: found.length, products: found.map(brief), already: hooks?.flow?.note() };
      },
    }),

    show_product: llm.tool({
      description: 'Open one product\'s page on his screen and show it off: the page flips through its photos, a few seconds each, then scrolls down to the details. Use it whenever he wants a product, or a closer look at one. Returns what each photo shows, in order, so you can talk him through them as they change.',
      parameters: z.object({ product_id: z.string() }),
      execute: async ({ product_id: ref }) => {
        const product_id = resolveId(ref);
        const p = product_id ? byId[product_id] : undefined;
        if (!p || !product_id) return { ok: false, error: `No product "${ref}". Use a product_id like MW-0383 from an earlier result.` };
        const out = await page('open_product', { id: product_id });
        openId = product_id;
        const notes = await describePhotos(p).catch(() => [] as PhotoNote[]);
        const n = Math.min(4, p.images.length);
        // Every photo gets PHOTO_SECONDS on screen; inside that, the pointer glides over its details
        // (up to two, ~1.8 s and ~4 s in), with a small magnifier, while she talks about them.
        const live = () => openId === product_id;
        const steps: (() => Promise<unknown>)[] = [];
        for (let i = 0; i < n; i++) {
          const spots = (notes[i]?.spots ?? []).slice(0, 2);
          steps.push(() => (live() ? page('show_photo', { index: i }) : Promise.resolve()));
          steps.push(() => (live() && spots[0] ? page('hover_photo', spots[0]) : Promise.resolve()));
          steps.push(() => (live() && spots[1] ? page('hover_photo', spots[1]) : Promise.resolve()));
        }
        steps.push(() => (live() ? page('point', { target: p.details?.length ? 'details' : 'description' }) : Promise.resolve()));
        await tour(steps, (PHOTO_SECONDS * 1000) / 3);
        return {
          ok: true, ...details(p), sizes_in_stock: out.sizes, colors: out.colors,
          photos: notes.slice(0, n).map((note, i) => ({ photo: i + 1, on_screen_at_second: i * PHOTO_SECONDS, what_it_shows: note.say, pointer_glides_over: note.spots?.slice(0, 2).map((s) => s.detail) })),
          product_copy: p.description, product_details: p.details?.slice(0, 6),
          how: `Photo 1 is on his screen now. The page moves to the next photo every ${PHOTO_SECONDS} seconds, and on each one your pointer glides over the details listed for it, in that order, so name them as it does, then scrolls to the product details at second ${n * PHOTO_SECONDS}. Start talking right away and keep going: about two short sentences per photo on the fine details it shows, in order, so your words match what he sees, then one line on a detail from the product details. Then ask what he thinks.`,
          already: hooks?.flow?.note(),
        };
      },
    }),

    point_at: llm.tool({
      description: 'Move your pointer to a part of the page and ring it while you talk about it, like tapping the screen. With click: true it also clicks it (a size or color chip, a photo, a product). Targets: photo, thumbnails, title, price, colors, sizes, description, details, add_to_bag, related, total, pieces, bag, looks, or product:<id>, look:<1-3>, photo:<n>, size:<size>, color:<name>. If a target is not on the page, it returns the ones that are.',
      parameters: z.object({ target: z.string(), click: z.boolean().optional() }),
      execute: async ({ target, click }) => { clearTimeout(tourTimer); return page('point', { target, click }); },
    }),

    scroll_page: llm.tool({
      description: 'Scroll his screen to show more of the page: "down", "up", "top", "bottom", or to a target (same names as point_at). Use it when you talk about something below the fold.',
      parameters: z.object({ to: z.string() }),
      execute: async ({ to }) => { clearTimeout(tourTimer); return page('scroll', { to }); },
    }),

    build_outfits: llm.tool({
      description: 'Pull three complete, different outfits from the store for his event and budget, and put them on his screen side by side. Takes a few seconds. Also starts his try-on pictures in the background.',
      parameters: z.object({
        occasion: z.string().describe('The event, setting and dress code: "beach wedding in Italy, July, afternoon".'),
        budget_usd: z.number().describe('The budget he told you for one whole outfit, in dollars (at most 10000). Only call this after he has said a number.'),
        gender: z.enum(['men', 'women']),
        notes: z.string().optional().describe('His style, what he likes and hates, colors, what he is wearing now, and anything he wants to build around.'),
      }),
      execute: async (args) => {
        // Gemini sometimes fires this twice in a row. One build per budget per minute and a half:
        // a repeat gets the same outfits back instead of a fresh set on screen.
        if (lastBuild && lastBuild.budget === args.budget_usd && Date.now() - lastBuild.at < 90000) {
          const r: any = await lastBuild.run;
          return r.ok ? { ...r, note: 'Already on his screen from your last call. Do not build again.' } : r;
        }
        const run = buildAndShow(args);
        lastBuild = { budget: args.budget_usd, at: Date.now(), run };
        return run;
      },
    }),

    pick_outfit: llm.tool({
      description: 'The moment he picks one of the three outfits: puts that outfit on its own on his screen, every piece with its price and the total, and moves your pointer to each piece in turn, a few seconds apart, while you walk him through them.',
      parameters: z.object({ outfit_number: z.number().int().min(1).max(3) }),
      execute: async ({ outfit_number }) => {
        const o = outfits[outfit_number - 1];
        if (!o) return { ok: false, error: 'Build the outfits first.' };
        picked = outfit_number;
        await page('show_pick', { name: o.outfit_name, intro: o.difference, total_usd: o.total_usd, items: o.items.map(({ product_id, slot }) => ({ product_id, slot })) });
        await tour(o.items.map((it) => () => (picked === outfit_number ? page('point', { target: `product:${it.product_id}` }) : Promise.resolve())), PIECE_SECONDS * 1000);
        hooks?.flow?.done.add('picked');
        return {
          ok: true, name: o.outfit_name, how_it_works: o.why_it_works, total_usd: o.total_usd,
          pieces_in_order: o.items.map((it, i) => ({ pointer_on_it_at_second: i * PIECE_SECONDS, slot: it.slot, why: it.why, ...details(byId[it.product_id]) })),
          how: `It's on his screen on its own now, with each price and the total. Your pointer moves to each piece in this order, every ${PIECE_SECONDS} seconds, starting now: talk about them in the same order, one or two sentences each, and what makes the pairing work. Then ask "Want to see it on you?"`,
          already: hooks?.flow?.note(),
        };
      },
    }),

    show_on_me: llm.tool({
      description: 'The reveal: show him a picture of himself wearing one of the three outfits, head to toe. Call it the moment he says yes to "Want to see it on you?", or asks to see any of the three on himself.',
      parameters: z.object({ outfit_number: z.number().int().min(1).max(3) }),
      execute: async ({ outfit_number }) => {
        const i = outfit_number - 1;
        if (!outfits[i]) return { ok: false, error: 'Build the outfits first.' };
        clearTimeout(tourTimer);
        await page('tryon_loading', { title: outfits[i].outfit_name });
        try {
          const file = await picture(i);
          await page('tryon_show', { file, title: outfits[i].outfit_name });
          hooks?.flow?.done.add('reveal');
          return { ok: true, shown: outfits[i].outfit_name, how: 'He is looking at himself in it right now: react to it straight away, like a friend would.', already: hooks?.flow?.note() };
        } catch (e) {
          await page('tryon_hide');
          return { ok: false, error: (e as Error).message };
        }
      },
    }),

    add_to_bag: llm.tool({
      description: 'Put pieces in his bag, each in the size he gave you. Only after you have read his sizes back to him and he said yes. A piece whose size is sold out is not added: you get the sizes in stock so you can offer the closest one or a swap.',
      parameters: z.object({
        sizes_read_back_and_confirmed: z.boolean().describe('True only if you repeated his sizes back and he said yes.'),
        outfit_number: z.number().int().min(1).max(3).optional().describe('The outfit these pieces come from, if any.'),
        items: z.array(z.object({
          product_id: z.string().describe('The product_id from an earlier result, like MW-0383.'),
          size: z.string().optional().describe('The size he said for this piece, like "L", "32", "10". Leave out only for one-size pieces.'),
        })).describe('Every piece to add, each with its size.'),
      }),
      execute: async ({ sizes_read_back_and_confirmed, outfit_number, items }) => {
        if (!sizes_read_back_and_confirmed) return { ok: false, error: 'Read his sizes back to him first ("Large blazer, 32 waist, size 10 loafers, right?") and wait for his yes.' };
        items = items.map((it) => ({ ...it, product_id: resolveId(it.product_id, outfit_number) ?? it.product_id }));
        const slotOf = (id: string) => outfits[(outfit_number ?? picked ?? 1) - 1]?.items.find((it) => it.product_id === id)?.slot ?? byId[id]?.category;
        const missing = items.filter((it) => byId[it.product_id] && byId[it.product_id].size_type !== 'one' && !it.size);
        if (missing.length) return { ok: false, error: `You don't have his size for: ${missing.map((it) => brief(byId[it.product_id]).title).join(', ')}. Ask him; never guess.` };
        // The read-back, in code: a piece+size goes in only if she was handed it to read back (or offered it as a
        // swap) and he has spoken since. Otherwise she gets the list to say out loud and must wait for his yes.
        const turns = hooks?.flow?.userTurns ?? 0;
        const pair = (it: { product_id: string; size?: string }) => `${it.product_id}:${norm(it.size ?? '')}`;
        // Did she say this size out loud (in her last few lines) before his latest turn?
        const WORDS: Record<string, string> = { xs: 'extra small', s: 'small', m: 'medium', l: 'large', xl: 'extra large', xxl: 'double xl' };
        const NUM = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen'];
        const forms = (size: string) => {
          const z = norm(size).replace(/d$/, '');
          const half = z.match(/^(\d+)\.5$/);
          return [z, WORDS[z], /^\d+$/.test(z) ? NUM[+z] : undefined, half ? `${half[1]} and a half` : undefined, half ? `${NUM[+half[1]]} and a half` : undefined, ...(/^\d+[rls]$/.test(z) ? [z.slice(0, -1) + ({ r: ' regular', l: ' long', s: ' short' } as any)[z.slice(-1)]] : [])].filter(Boolean) as string[];
        };
        const recent = (hooks?.flow?.said ?? []).filter((x) => x.turn < turns).slice(-4).map((x) => ` ${x.text.toLowerCase().replace(/[^a-z0-9. ]+/g, ' ')} `);
        const saidIt = (size?: string) => !size || recent.some((t) => forms(size).some((f) => new RegExp(`(^|[^a-z0-9.])${f.replace('.', '\\.')}([^a-z0-9]|$)`).test(t)));
        const unheard = items.filter((it) => byId[it.product_id] && !((heard.get(pair(it)) ?? Infinity) < turns) && !saidIt(it.size));
        if (unheard.length) {
          for (const it of unheard) if (!heard.has(pair(it))) heard.set(pair(it), turns);
          const say = unheard.map((it) => `${it.size ?? 'one size'} ${brief(byId[it.product_id]).title}`).join(', ');
          const left = outfit_number ? outfits[outfit_number - 1]?.items.filter((o) => !items.some((it) => it.product_id === o.product_id)).map((o) => brief(byId[o.product_id]).title) : [];
          return { ok: false, left_out_of_this_call: left?.length ? left : undefined, not_yet: `Nothing is in his bag yet, so never say it is. Read this back to him in your own words and wait for his yes: ${say}. When he says yes, call add_to_bag again with the same pieces and sizes.` };
        }
        const added = [], sold_out = [];
        for (const it of items) {
          const p = byId[it.product_id];
          if (!p) { added.push({ product_id: it.product_id, ok: false, error: 'No such product' }); continue; }
          const size = p.size_type === 'one' ? p.sizes[0] : matchSize(p, it.size!);
          if (!size) { sold_out.push({ ...item(p.id), his_size: it.size, problem: 'That size does not exist for this piece', sizes: p.sizes }); continue; }
          if (!inStock(p, size, slotOf(p.id))) {
            const in_stock = p.sizes.filter((x: string) => inStock(p, x, slotOf(p.id)));
            for (const x of in_stock) heard.set(`${p.id}:${norm(x)}`, turns);
            sold_out.push({ ...item(p.id), his_size: size, problem: 'Sold out in his size', in_stock });
            continue;
          }
          const r = await page('add_to_bag', { id: p.id, size });
          added.push({ ...item(p.id), ok: r.ok, size: r.size ?? size, error: r.error ?? undefined });
        }
        const bag = await page('get_bag');
        if (added.some((a) => a.ok)) { await page('open_bag'); hooks?.flow?.done.add('bagged'); }
        return {
          added, sold_out: sold_out.length ? sold_out : undefined, bag_items: bag.count, bag_total_usd: bag.total,
          note: sold_out.length
            ? 'Tell him what went in. For each sold-out piece, offer the nearest size in stock or to find him a similar piece in his size (search_products), and only add it once he says yes.'
            : 'His bag is open on his screen. Tell him what went in, in which sizes, and the bag total.',
        };
      },
    }),
  };
  // Every tool tells the agent when it starts and ends (agent.ts pauses the camera stream meanwhile).
  // Gemini sometimes fires the same call twice within a second (the photo tour then ran twice):
  // a repeat with the same arguments within 4 s gets the first call's result.
  const recent = new Map<string, { at: number; out: Promise<unknown> }>();
  for (const t of Object.values(tools) as any[]) {
    const run = t.execute;
    t.execute = async (...args: any[]) => {
      const name = Object.keys(tools).find((k) => (tools as any)[k] === t)!;
      const key = name + JSON.stringify(args[0] ?? {});
      const prev = recent.get(key);
      if (prev && Date.now() - prev.at < 4000 && name !== 'add_to_bag') { log(`tool ${name} repeated, skipped`); return { ...(await prev.out as object), note: 'Same call a moment ago; it is already on his screen.' }; }
      const p = (async () => {
      hooks?.start(name, args[0]);
      let out: unknown;
      try { out = await run(...args); return out; } finally { hooks?.end(name, out); }
      })();
      recent.set(key, { at: Date.now(), out: p });
      return p;
    };
  }
  return tools;
}
