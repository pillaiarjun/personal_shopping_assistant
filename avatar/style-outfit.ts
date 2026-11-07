// Client for Jing's style-outfit route, plus a mock that needs no backend.

import type { Product } from "../contracts/product";
import type { StyleOutfitRequest, StylistResponse } from "../contracts/stylist";

export type StyleOutfitFn = (req: StyleOutfitRequest) => Promise<StylistResponse>;

export const DEFAULT_STYLE_OUTFIT_URL = "/api/style-outfit";
export const DEFAULT_STYLE_OUTFIT_TIMEOUT_MS = 45_000;

/** POSTs the request to the backend route and returns its StylistResponse. */
export function httpStyleOutfit(
  url: string = DEFAULT_STYLE_OUTFIT_URL,
  timeoutMs: number = DEFAULT_STYLE_OUTFIT_TIMEOUT_MS,
): StyleOutfitFn {
  return async (req) => {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(req),
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) throw new Error(`style-outfit ${res.status}: ${(await res.text()).slice(0, 200)}`);
    return (await res.json()) as StylistResponse;
  };
}

const SLOTS: Record<string, string> = {
  outerwear: "outerwear",
  jackets: "outerwear",
  shirts: "top",
  tops: "top",
  knitwear: "top",
  trousers: "bottom",
  pants: "bottom",
  shorts: "bottom",
  shoes: "shoes",
  footwear: "shoes",
  accessories: "accessory",
};

/**
 * Fake stylist: picks the cheapest item per slot that fits the budget. Good enough to
 * exercise the outfit board and the router without the ZooWork backend.
 */
export function mockStyleOutfit(products: Product[], delayMs = 1500): StyleOutfitFn {
  return async ({ occasion, budget_usd }) => {
    await new Promise((r) => setTimeout(r, delayMs));
    const bySlot = new Map<string, Product>();
    for (const p of [...products].sort((a, b) => a.price_usd - b.price_usd)) {
      const slot = SLOTS[p.category.toLowerCase()];
      if (slot && !bySlot.has(slot)) bySlot.set(slot, p);
    }
    const sum = () => [...bySlot.values()].reduce((s, p) => s + p.price_usd, 0);
    // Over budget: drop the optional slots first.
    for (const optional of ["accessory", "outerwear"]) {
      if (budget_usd != null && sum() > budget_usd) bySlot.delete(optional);
    }
    const picks = [...bySlot.entries()];
    const total = Math.round(sum() * 100) / 100;
    return {
      outfit_name: `Mock look: ${occasion}`,
      items: picks.map(([slot, p]) => ({ product_id: p.id, slot, why: `${p.name} keeps it simple for ${occasion}.` })),
      total_usd: total,
      spoken_summary: `I put together ${picks.length} pieces for ${occasion}, coming to about ${Math.round(total)} dollars.`,
    };
  };
}
