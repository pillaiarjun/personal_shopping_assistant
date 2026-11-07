// DRAFT — needs team sign-off (Jing: /api/style-outfit, ZooWork agent). Response shape copied from the team plan.

/** Body the browser POSTs to the style-outfit route (default /api/style-outfit). */
export interface StyleOutfitRequest {
  occasion: string;
  budget_usd?: number;
  notes?: string;
}

export interface StylistItem {
  product_id: string;
  /** e.g. "top", "bottom", "shoes", "outerwear", "accessory" */
  slot: string;
  why: string;
}

/** Response body of the style-outfit route. */
export interface StylistResponse {
  outfit_name: string;
  items: StylistItem[];
  total_usd: number;
  spoken_summary: string;
}
