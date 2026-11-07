// DRAFT — needs team sign-off (Jing: /api/style-outfit, ZooWork agent). Response shape copied
// from TEAM_PLAN.md "Stylist response".

/** Body the browser POSTs to the style-outfit route (default /api/style-outfit). */
export interface StyleOutfitRequest {
  occasion: string;
  budget_usd?: number;
  /** Rework requests ("the shoes are too formal") arrive here too, in the same Session. */
  notes?: string;
  /** Tavus conversation id. Lets the backend keep one ZooWork Session per video call. */
  conversation_id?: string;
}

export type OutfitSlot = "jacket" | "shirt" | "trousers" | "shoes" | (string & {});

/** One piece of a look: either a catalog product or something the shopper already owns. */
export type StylistItem =
  | { product_id: string; closet_item?: undefined; slot: OutfitSlot; why: string }
  | { closet_item: string; product_id?: undefined; slot: OutfitSlot; why: string };

export interface Look {
  outfit_name: string;
  items: StylistItem[];
  /** Sum of catalog items only; the backend recalculates it from the catalog. */
  total_usd: number;
}

/** Response body of the style-outfit route. */
export interface StylistResponse {
  looks: Look[];
  /** Two sentences at most, written to be said aloud. */
  spoken_summary: string;
  /** ID of the published lookbook Artifact (may be empty if that step was cut). */
  lookbook_artifact?: string;
}
