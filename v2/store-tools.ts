// Sasha's store tools. Search and outfit building run here in the agent (store.ts); the page in the
// shopper's browser only shows the results. The agent drives the page with LiveKit RPC calls on
// method "barn" (handled in web/sasha-live.ts, which calls window.Barn in site/barn.js).
import { type JobContext, llm } from '@livekit/agents';
import { z } from 'zod';
import { brief, buildOutfits, byId, catalogSlot, describePhotos, details, search, type Outfit, type PhotoNote } from './store.ts';
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
export interface Flow { done: Set<string>; note(): string | undefined; userTurns: number; said: { text: string; turn: number }[]; /** His latest words. */ his: string; /** His last few lines. */ hisLines: string[]; /** When he last clicked something on the page himself. */ clickedAt: number; /** His sizes once confirmed: tops, waist, shoes. */ sizes: Record<string, string> }
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
    his: '',
    hisLines: [],
    clickedAt: 0,
    sizes: {},
    note() {
      const known = Object.entries(this.sizes).map(([k, v]) => `${k} ${v}`).join(', ');
      const parts = [
        done.size ? `Already done in this call, so never again: ${[...done].map((k) => LABELS[k] ?? k).join('; ')}.` : '',
        known ? `His sizes, already confirmed (never ask or read these back again, just use them): ${known}.` : '',
      ].filter(Boolean);
      return parts.length ? parts.join(' ') : undefined;
    },
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
    const started = Date.now();
    // He clicked somewhere himself: the tour is over, the pointer stops following the old script.
    const next = async () => { if (k < steps.length && (hooks?.flow?.clickedAt ?? 0) < started) { await steps[k++](); tourTimer = setTimeout(next, gapMs); } };
    return next();
  }
  let picked: number | null = null;
  // Which outfit he means. Names beat numbers: Gemini guessed "1" when he said "the Linen Sunset Edge".
  // Order of trust: the name she passed, then a name in his latest words, then the number.
  const STOP = new Set(['the', 'and', 'with', 'look', 'outfit', 'one']);
  const nameWords = (t: string) => t.toLowerCase().split(/[^a-z]+/).filter((w) => w.length > 2 && !STOP.has(w));
  function byName(text?: string): number | undefined {
    if (!text || !outfits.length) return undefined;
    const said = new Set(nameWords(text));
    const scores = outfits.map((o) => nameWords(o.outfit_name).filter((w) => said.has(w) || [...said].some((x) => x.length > 3 && (x.startsWith(w) || w.startsWith(x)))).length);
    const best = Math.max(...scores);
    return best > 0 && scores.filter((x) => x === best).length === 1 ? scores.indexOf(best) + 1 : undefined;
  }
  function whichOutfit(number?: number, name?: string): number | undefined {
    // "the second one", "the middle one": he gave a position, so the number stands over loose name words.
    const his = hooks?.flow?.his ?? '';
    const gavePosition = /\b(first|second|third|last|middle|left|right|number (one|two|three|1|2|3))\b/i.test(his);
    // A name that matches none of the outfits on screen (from an earlier set) means her number is stale too.
    const staleName = !!name && !byName(name);
    const valid = (k?: number | null) => (k && outfits[k - 1] ? k : undefined);
    const n = byName(name) ?? (gavePosition ? undefined : byName(his)) ?? (staleName ? valid(picked) ?? valid(number) : valid(number) ?? valid(picked));
    if (n && number && n !== number) log(`outfit: she said ${number}, he meant ${n} (${outfits[n - 1]?.outfit_name})`);
    return n && outfits[n - 1] ? n : undefined;
  }
  const outfitParams = {
    outfit_name: z.string().optional().describe('The outfit\'s name, exactly as shown, like "Linen Sunset Edge". Always give it when he named one.'),
    outfit_number: z.number().int().min(1).max(3).optional().describe('1, 2 or 3, left to right on his screen.'),
  };
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
  // His sizes are asked once per call: tops (shirts, knits, jackets, blazers), waist (pants, shorts), shoes.
  const sizeKind = (p: any): string | undefined => {
    if (!p || p.size_type === 'one') return undefined;
    const slot = catalogSlot(p.id);
    return slot === 'shoes' ? 'shoes' : slot === 'bottom' || slot === 'swim' ? 'waist' : slot === 'top' || slot === 'layer' || slot === 'suit' || slot === 'one-piece' ? 'tops' : undefined;
  };
  // The bit of a size that carries over between pieces: "L - 42" -> "L", "36W | 34-36L" -> "36", "12" -> "12".
  const sizeCore = (kind: string, size: string) => {
    const low = norm(size).replace(/extralarge/, 'xl').replace(/extrasmall/, 'xs');
    const letter = low.match(/^(xxs|xs|s|m|l|xl|xxl|xxxl)\b/);
    if (kind === 'tops' && letter) return letter[1].toUpperCase();
    const num = low.match(/\d+(\.5)?/);
    return num ? num[0] : low.toUpperCase();
  };
  const knownSize = (p: any) => { const k = sizeKind(p); return k ? hooks?.flow?.sizes[k] : undefined; };
  const sameAsKnown = (p: any, size?: string) => { const k = sizeKind(p), known = knownSize(p); return !!(k && known && size && sizeCore(k, size) === known); };
  const bagged = new Set<string>(); // product ids put in his bag this call
  const heardAt = new Map<string, number>(); // when she was handed it
  const heard = new Map<string, number>(); // "MW-0383:L" -> his turn count when she was told to read it back (or offered it)
  let lastBuild: { budget: number; at: number; run: Promise<unknown> } | null = null;
  async function buildAndShow({ occasion, budget_usd, gender, notes }: { occasion: string; budget_usd: number; gender: 'men' | 'women'; notes?: string }) {
        if (!(budget_usd > 0)) return { ok: false, error: 'Ask for his budget first.' };
        // She once made up $1,200 when his sentence cut off at "Total budget is". He has to have said a number.
        const heardNumbers = [...(hooks?.flow?.hisLines ?? []), hooks?.flow?.his ?? ''].some((t) => /\d|hundred|thousand|grand|\bk\b|fifty|twenty|thirty|forty|sixty|seventy|eighty|ninety/i.test(t));
        if (hooks?.flow && !heardNumbers) return { ok: false, error: "He hasn't told you a number yet. Ask him for his budget and wait for it; never guess one." };
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
          replaces: picked !== null || hooks?.flow?.done.has('outfits') ? 'These replace any outfits from before: only talk about these, by these names.' : undefined,
          say_next: `${outfits.length === 3 ? 'All three are' : `These ${outfits.length} are`} on his screen now. Even if he spoke while you waited, introduce each one by name in one sentence about its feel and where it shines (its intro), then ask which he likes. Save the piece-by-piece detail for after he picks.`,
          outfits: outfits.map((o, i) => ({
            number: i + 1, name: o.outfit_name, intro: o.difference, how_it_works: o.why_it_works,
            total_usd: o.total_usd, items: o.items.map((it) => ({ slot: it.slot, why: it.why, ...details(byId[it.product_id]) })),
          })),
        };
  }

  const showPick = (o: Outfit) => page('show_pick', { name: o.outfit_name, intro: o.difference, total_usd: o.total_usd, items: o.items.map(({ product_id, slot }) => ({ product_id, slot })) });

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
      execute: async ({ to }) => {
        clearTimeout(tourTimer);
        const out = await page('scroll', { to });
        if (out?.ok === false && /detail|description/i.test(to)) return { ...out, hint: 'This is a list, not a product page. If he wants details on a piece, open it with show_product.' };
        return out;
      },
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
      parameters: z.object(outfitParams),
      execute: async ({ outfit_name, outfit_number: asked }) => {
        if (!outfits.length) return { ok: false, error: 'Build the outfits first.' };
        const outfit_number = whichOutfit(asked, outfit_name);
        if (!outfit_number) return { ok: false, error: `Which one? Ask him: ${outfits.map((o) => o.outfit_name).join(', ')}.` };
        const o = outfits[outfit_number - 1];
        picked = outfit_number;
        await showPick(o);
        await tour(o.items.map((it) => () => (picked === outfit_number ? page('point', { target: `product:${it.product_id}` }) : Promise.resolve())), PIECE_SECONDS * 1000);
        hooks?.flow?.done.add('picked');
        return {
          ok: true, name: o.outfit_name, on_his_screen_now: `${o.outfit_name}: talk about this one only, by this name.`, how_it_works: o.why_it_works, total_usd: o.total_usd,
          sizes_still_needed: [...new Set(o.items.map((it) => sizeKind(byId[it.product_id])).filter((k) => k && !hooks?.flow?.sizes[k!]))],
          pieces_in_order: o.items.map((it, i) => ({ pointer_on_it_at_second: i * PIECE_SECONDS, slot: it.slot, why: it.why, ...details(byId[it.product_id]) })),
          how: `It's on his screen on its own now, with each price and the total. Your pointer moves to each piece in this order, every ${PIECE_SECONDS} seconds, starting now: talk about them in the same order, one or two sentences each, and what makes the pairing work. If he also asked to change a piece (another color, a different shoe), call swap_piece right after this instead of asking. Otherwise end with "Want to see it on you?"`,
          already: hooks?.flow?.note(),
        };
      },
    }),

    show_on_me: llm.tool({
      description: 'The reveal: show him a picture of himself wearing one of the three outfits, head to toe. Call it the moment he says yes to "Want to see it on you?", or asks to see any of the three on himself.',
      parameters: z.object(outfitParams),
      execute: async ({ outfit_name, outfit_number: asked }) => {
        if (!outfits.length) return { ok: false, error: 'Build the outfits first.' };
        const n = whichOutfit(asked, outfit_name);
        if (!n) return { ok: false, error: `Nothing is showing on his screen, so don't react to a picture. Ask him which one: ${outfits.map((o) => o.outfit_name).join(', ')}.` };
        const i = n - 1;
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

    swap_piece: llm.tool({
      description: 'Change one piece of an outfit: "keep the shirt but in white", "different shoes", "something cheaper than that jacket". Finds the closest piece in the same slot (in the color he asked for, if any), puts it into the outfit on his screen with the new total, and moves your pointer to it. His try-on picture is redone with the new piece.',
      parameters: z.object({
        ...outfitParams,
        piece: z.string().describe('Which piece to change: its product_id, or its slot like "shirt", "shorts", "shoes".'),
        color: z.string().optional().describe('The color he wants instead, like "white". Leave out if he did not say one.'),
        wish: z.string().optional().describe('Anything else he wants from the new piece: "more casual", "linen", "under $50".'),
        new_product_id: z.string().optional().describe('Only when he picked one of the alternatives you offered: its product_id.'),
      }),
      execute: async ({ outfit_name, outfit_number: asked, piece, color, wish, new_product_id }) => {
        if (!outfits.length) return { ok: false, error: 'Build the outfits first.' };
        const n = whichOutfit(asked, outfit_name);
        if (!n) return { ok: false, error: `Which outfit? Ask him: ${outfits.map((o) => o.outfit_name).join(', ')}.` };
        const o = outfits[n - 1];
        const oldId = resolveId(piece, n);
        const slotItem = o.items.find((it) => it.product_id === oldId);
        if (!slotItem) return { ok: false, error: `Which piece? This outfit has: ${o.items.map((it) => `${it.slot} (${brief(byId[it.product_id]).title}, ${it.product_id})`).join('; ')}.` };
        const old = byId[slotItem.product_id];
        let pick = new_product_id ? byId[resolveId(new_product_id) ?? new_product_id] : undefined;
        let others: any[] = [];
        if (!pick) {
          const type = brief(old).title.replace(/\b(ivory|white|black|navy|blue|green|red|grey|gray|brown|tan|beige|olive|cream|pink|yellow|orange|purple|khaki|stone|sand|charcoal|embroidered)\b/gi, '').trim();
          const query = [color, type, wish].filter(Boolean).join(' ');
          const found = (await search({ query, gender: old.gender, slots: [catalogSlot(old.id)].filter(Boolean) as string[], limit: 12 }))
            .filter((p) => p.id !== old.id && !o.items.some((it) => it.product_id === p.id));
          const c = color?.toLowerCase().split(/\s+/).pop();
          const inColor = c ? found.filter((p) => `${brief(p).color} ${p.colors?.join(' ')} ${p.title}`.toLowerCase().includes(c)) : found;
          const pool = inColor.length ? inColor : found;
          [pick, ...others] = pool;
          others = others.slice(0, 2);
          if (!pick) return { ok: false, error: 'Nothing close enough in the store. Tell him, and offer a different color or style.' };
        }
        slotItem.product_id = pick.id;
        slotItem.why = `Swapped in for the ${brief(old).title} at his request.`;
        o.total_usd = o.items.reduce((sum, it) => sum + (byId[it.product_id]?.simulated.price ?? 0), 0);
        pictures[n - 1] = null; // his try-on picture is redone with the new piece
        picked = n;
        clearTimeout(tourTimer);
        await showPick(o);
        await page('point', { target: `product:${pick.id}` });
        picture(n - 1);
        hooks?.flow?.done.add('swapped');
        const wanted = color?.toLowerCase().split(/\s+/).pop();
        return {
          ok: true, outfit: o.outfit_name, removed: brief(old).title,
          now_in_the_outfit: details(pick), new_total_usd: o.total_usd,
          color_match: !wanted ? undefined : !`${brief(pick).color} ${pick.title}`.toLowerCase().includes(wanted)
            ? `Nothing ${color} in stock for this slot; this is the closest. Say so.`
            : `The ${brief(old).title} only comes in ${brief(old).color}, so this is the closest ${color} piece in the store. Say that plainly, then sell it.`,
          other_options: others.map((p) => brief(p)),
          how: 'It is swapped on his screen and your pointer is on it. Tell him in a sentence or two what you put in and why it works with the rest, say the new total, then ask "Want to see it on you?" If he wants one of the other options, call swap_piece again with its new_product_id.',
          already: hooks?.flow?.note(),
        };
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
        items = items.map((it) => ({ ...it, product_id: resolveId(it.product_id, outfit_number) ?? it.product_id }));
        // Pieces in a size he already confirmed this call need no read-back; a missing size is filled in from his known one.
        items = items.map((it) => ({ ...it, size: it.size || knownSize(byId[it.product_id]) }));
        // Bagging the look (two or more of its pieces): any piece she left out goes in too when its size is known,
        // from his confirmed sizes or from a piece of the same kind in this call (a vest takes his top size).
        const look = outfit_number ? outfits[outfit_number - 1] : undefined;
        if (look && look.items.filter((o) => items.some((it) => it.product_id === o.product_id)).length >= 2) {
          for (const o of look.items) {
            const p = byId[o.product_id];
            if (!p || bagged.has(o.product_id) || items.some((it) => it.product_id === o.product_id)) continue;
            const k = sizeKind(p);
            const same = k ? items.find((it) => it.size && byId[it.product_id] && sizeKind(byId[it.product_id]) === k) : undefined;
            const size = p.size_type === 'one' ? undefined : knownSize(p) ?? (same ? sizeCore(k!, same.size!) : undefined);
            if (p.size_type === 'one' || size) items.push({ product_id: o.product_id, size });
          }
        }
        const allKnown = items.every((it) => !byId[it.product_id] || byId[it.product_id].size_type === 'one' || sameAsKnown(byId[it.product_id], it.size));
        if (!sizes_read_back_and_confirmed && !allKnown) return { ok: false, error: 'Read his sizes back to him first ("Large blazer, 32 waist, size 10 loafers, right?") and wait for his yes.' };
        const slotOf = (id: string) => outfits[(outfit_number ?? picked ?? 1) - 1]?.items.find((it) => it.product_id === id)?.slot ?? byId[id]?.category;
        const missing = items.filter((it) => byId[it.product_id] && byId[it.product_id].size_type !== 'one' && !it.size);
        if (missing.length) return { ok: false, error: `You don't have his size for: ${missing.map((it) => brief(byId[it.product_id]).title).join(', ')}. Ask him for just that; never guess, and never re-ask a size he already gave (${hooks?.flow?.note() ?? ''}).` };
        // The read-back, in code: a piece+size goes in only if she was handed it to read back (or offered it as a
        // swap) and he has spoken since. Otherwise she gets the list to say out loud and must wait for his yes.
        const turns = hooks?.flow?.userTurns ?? 0;
        const pair = (it: { product_id: string; size?: string }) => `${it.product_id}:${norm(it.size ?? '')}`;
        // Did she say this size out loud (in her last few lines) before his latest turn?
        const WORDS: Record<string, string> = { xs: 'extra small', s: 'small', m: 'medium', l: 'large', xl: 'extra large', xxl: 'double xl' };
        const NUM = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen'];
        // The ways she might say a size out loud. Store labels can be compound ("L - 42", "36W | 34-36L",
        // "32x30"): the letter size or the first number is enough ("large", "forty-two", "thirty-six waist").
        const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
        const spell = (n: number) => (n < 15 ? NUM[n] : n < 20 ? ['fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'][n - 15] : n < 100 ? `${TENS[Math.floor(n / 10)]}${n % 10 ? ` ${NUM[n % 10]}` : ''}` : String(n));
        const forms = (size: string) => {
          const low = size.toLowerCase().replace(/extra[- ]?large/, 'xl').replace(/extra[- ]?small/, 'xs').replace(/\blarge\b/, 'l').replace(/\bmedium\b/, 'm').replace(/\bsmall\b/, 's');
          const out: string[] = [];
          const letter = low.match(/\b(xxs|xs|s|m|l|xl|xxl|xxxl)\b/);
          if (letter) out.push(letter[1], WORDS[letter[1]] ?? '');
          const num = low.match(/(\d+)(\.5)?/);
          if (num) {
            out.push(num[0], spell(+num[1]));
            if (num[2]) out.push(`${num[1]} and a half`, `${spell(+num[1])} and a half`);
          }
          const z = norm(size).replace(/d$/, '');
          if (/^\d+[rls]$/.test(z)) out.push(z.slice(0, -1) + ({ r: ' regular', l: ' long', s: ' short' } as any)[z.slice(-1)]);
          return out.filter(Boolean);
        };
        const recent = (hooks?.flow?.said ?? []).filter((x) => x.turn <= turns).slice(-4).map((x) => ` ${x.text.toLowerCase().replace(/[^a-z0-9. ]+/g, ' ')} `);
        const mentions = (lines: string[], size?: string) => !size || lines.some((t) => forms(size).some((f) => new RegExp(`(^|[^a-z0-9.])${f.replace('.', '\\.')}(?! (one|two|three|four|five|six|seven|eight|nine)\\b)([^a-z0-9]|$)`).test(t.replace(/-/g, ' '))));
        // He said this size himself in his last few lines ("large on top, 36 waist, size 12 shoes"): nothing to read back.
        const hisRecent = [...(hooks?.flow?.hisLines ?? [])].slice(-3).map((t) => ` ${t.toLowerCase().replace(/[^a-z0-9. -]+/g, ' ')} `);
        const saidIt = (size?: string) => mentions(recent, size) || mentions(hisRecent, size);
        // Loop breaker: if she was already handed this piece to read back a few seconds ago and calls again saying
        // he confirmed, let it through. One read-back round at most, never a loop.
        const handedAt = new Map<string, number>(heardAt);
        const unheard = items.filter((it) => byId[it.product_id] && !sameAsKnown(byId[it.product_id], it.size) && !((heard.get(pair(it)) ?? Infinity) < turns) && !saidIt(it.size) && !(Date.now() - (handedAt.get(pair(it)) ?? Infinity) > 3000));
        if (unheard.length) {
          for (const it of unheard) if (!heard.has(pair(it))) { heard.set(pair(it), turns); heardAt.set(pair(it), Date.now()); }
          const say = unheard.map((it) => `${it.size ?? 'one size'} ${brief(byId[it.product_id]).title}`).join(', ');
          const left = outfit_number ? outfits[outfit_number - 1]?.items.filter((o) => !items.some((it) => it.product_id === o.product_id)).map((o) => brief(byId[o.product_id]).title) : [];
          return { ok: false, left_out_of_this_call: left?.length ? left : undefined, not_yet: `Nothing is in his bag yet. Never tell him it is, even if he asks: that would be a lie he sees on screen. Read this back to him in your own words and wait for his yes: ${say}. When he says yes, call add_to_bag again with the same pieces and sizes.` };
        }
        // Pieces already in his bag from this call aren't added again (she re-sends the whole outfit when fixing one size).
        const already_in_bag = items.filter((it) => bagged.has(it.product_id)).map((it) => brief(byId[it.product_id]).title);
        items = items.filter((it) => !bagged.has(it.product_id));
        if (!items.length) return { ok: true, already_in_bag, note: 'All of these are already in his bag. Nothing was added twice.' };
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
          if (r.ok) bagged.add(p.id);
          const kind = sizeKind(p);
          if (r.ok && kind && hooks?.flow) hooks.flow.sizes[kind] = sizeCore(kind, it.size ?? size);
        }
        const bag = await page('get_bag');
        if (added.some((a) => a.ok)) { await page('open_bag'); hooks?.flow?.done.add('bagged'); }
        return {
          added, already_in_bag: already_in_bag.length ? already_in_bag : undefined, sold_out: sold_out.length ? sold_out : undefined, bag_items: bag.count, bag_total_usd: bag.total,
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
