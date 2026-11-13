// Sasha's store tools. Search and outfit building run here in the agent (store.ts); the page in the
// shopper's browser only shows the results. The agent drives the page with LiveKit RPC calls on
// method "barn" (handled in web/sasha-live.ts, which calls window.Barn in site/barn.js).
import { type JobContext, llm } from '@livekit/agents';
import { z } from 'zod';
import { brief, buildOutfits, byId, details, search, type Outfit } from './store.ts';
import { readSnapshot, tryOn } from './tryon.ts';

type Log = (msg: string, extra?: unknown) => void;

export interface ToolHooks { start(name: string): void; end(name: string): void }

export function storeTools(ctx: JobContext, log: Log, hooks?: ToolHooks) {
  // ---- talking to the page ----
  const shopper = () => [...ctx.room.remoteParticipants.values()].find((p) => p.identity.startsWith('shopper-'))?.identity;
  async function page(action: string, args: Record<string, unknown> = {}) {
    const to = shopper();
    if (!to) return { ok: false, error: 'The shopper has left the call' };
    try {
      const out = await ctx.room.localParticipant!.performRpc({ destinationIdentity: to, method: 'barn', payload: JSON.stringify({ action, ...args }) });
      return JSON.parse(out);
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
        return {
          ok: true,
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
        return { shown: found.length, products: found.map(brief) };
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
        return { shown: found.length, products: found.map(brief) };
      },
    }),

    show_product: llm.tool({
      description: 'Open one product\'s page on his screen, with its photos, colors and sizes.',
      parameters: z.object({ product_id: z.string() }),
      execute: async ({ product_id }) => {
        if (!byId[product_id]) return { ok: false, error: `No product ${product_id}` };
        const out = await page('open_product', { id: product_id });
        return { ...brief(byId[product_id]), sizes_in_stock: out.sizes, colors: out.colors };
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

    show_on_me: llm.tool({
      description: 'The reveal: show him a picture of himself wearing one of the three outfits, head to toe. Use only after he says yes to seeing it on himself.',
      parameters: z.object({ outfit_number: z.number().int().min(1).max(3) }),
      execute: async ({ outfit_number }) => {
        const i = outfit_number - 1;
        if (!outfits[i]) return { ok: false, error: 'Build the outfits first.' };
        await page('tryon_loading');
        try {
          const file = await picture(i);
          await page('tryon_show', { file, title: outfits[i].outfit_name });
          return { ok: true, shown: outfits[i].outfit_name };
        } catch (e) {
          await page('tryon_hide');
          return { ok: false, error: (e as Error).message };
        }
      },
    }),

    add_to_bag: llm.tool({
      description: 'Put items in his bag, each in the size he confirmed: a whole outfit by number, or single products. Only after he has confirmed his sizes.',
      parameters: z.object({
        outfit_number: z.number().int().min(1).max(3).optional().describe('A whole outfit from the last three.'),
        items: z.array(z.object({
          product_id: z.string(),
          size: z.string().optional().describe('The size he confirmed for this piece, as listed in its sizes_in_stock.'),
        })).optional().describe('Every piece to add with its size. For a whole outfit, list each of its pieces here too, with sizes.'),
      }),
      execute: async ({ outfit_number, items }) => {
        const outfitIds = outfit_number ? outfits[outfit_number - 1]?.items.map((it) => it.product_id) ?? [] : [];
        const sized = new Map((items ?? []).map((it) => [it.product_id, it.size]));
        const ids = [...new Set([...outfitIds, ...sized.keys()])];
        if (!ids.length) return { ok: false, error: 'Say which outfit or which products.' };
        const added = [];
        for (const id of ids) {
          if (!byId[id]) { added.push({ product_id: id, ok: false, error: 'No such product' }); continue; }
          const asked = sized.get(id);
          const r = await page('add_to_bag', { id, size: asked });
          added.push({ ...item(id), ok: r.ok, size: r.size, size_he_asked_for: asked, error: r.error ?? undefined });
        }
        const bag = await page('get_bag');
        return { added, bag_items: bag.count, bag_total_usd: bag.total, note: 'If a size differs from what he asked for, it was out of stock: tell him.' };
      },
    }),
  };
  // Every tool tells the agent when it starts and ends (agent.ts pauses the camera stream meanwhile).
  for (const t of Object.values(tools) as any[]) {
    const run = t.execute;
    t.execute = async (...args: any[]) => {
      const name = Object.keys(tools).find((k) => (tools as any)[k] === t)!;
      hooks?.start(name);
      try { return await run(...args); } finally { hooks?.end(name); }
    };
  }
  return tools;
}
