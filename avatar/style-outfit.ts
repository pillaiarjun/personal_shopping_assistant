// Client for Jing's style-outfit route, plus a mock that needs no backend.

import type { Product } from "../contracts/product";
import type { Look, StyleOutfitRequest, StylistResponse } from "../contracts/stylist";

export type StyleOutfitFn = (req: StyleOutfitRequest) => Promise<StylistResponse>;

export const DEFAULT_STYLE_OUTFIT_URL = "/api/style-outfit";
export const DEFAULT_STYLE_OUTFIT_TIMEOUT_MS = 90_000; // plan target is < 60 s per styling run

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

const SLOTS =["jacket", "shirt", "trousers", "shoes"] as const;

/** Demo closet, standing in for Jing's shopper memory. */
const MOCK_CLOSET: Partial<Record<(typeof SLOTS)[number], string>> = { trousers: "Navy chinos", shoes: "Brown suede loafers" };

/**
 * Fake stylist: three looks, one catalog item per slot (n-th cheapest for look n), reusing a
 * closet piece when the budget runs out. Good enough to exercise the outfit board and the
 * router without the ZooWork backend.
 */
export function mockStyleOutfit(products: Product[], delayMs = 1500): StyleOutfitFn {
  return async ({ occasion, budget_usd, notes }) => {
    await new Promise((r) => setTimeout(r, delayMs));
    const bySlot = new Map<string, Product[]>();
    for (const p of [...products].sort((a, b) => a.price_usd - b.price_usd)) {
      const slot = p.category.toLowerCase();
      if ((SLOTS as readonly string[]).includes(slot)) bySlot.set(slot, [...(bySlot.get(slot) ?? []), p]);
    }
    const looks: Look[] = [0, 1, 2].map((n) => {
      const items: Look["items"] = [];
      let total = 0;
      for (const slot of SLOTS) {
        const options = bySlot.get(slot) ?? [];
        const p = options[Math.min(n, options.length - 1)];
        const owned = MOCK_CLOSET[slot];
        const overBudget = p && budget_usd != null && total + p.price_usd > budget_usd / 3;
        if (owned && (!p || overBudget || n === 0)) {
          items.push({ closet_item: owned, slot, why: "Already owned, so the budget goes further." });
        } else if (p) {
          items.push({ product_id: p.id, slot, why: `${p.name} suits ${occasion}.` });
          total += p.price_usd;
        }
      }
      return { outfit_name: `${["Classic", "Relaxed", "Sharp"][n]} ${occasion}`, items, total_usd: Math.round(total * 100) / 100 };
    });
    return {
      looks,
      spoken_summary: `I built three looks for ${occasion}${notes ? `, taking "${notes}" into account` : ""}. The first reuses pieces you already own.`,
      lookbook_artifact: "mock-lookbook",
    };
  };
}
