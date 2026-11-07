// The interface the router drives. The canonical definition is the DRAFT in
// contracts/shop-bridge.ts; this file just re-exports it and adds the lookup helper.

export type { ShopBridge, SearchFilters, AddToCartResult } from "../contracts/shop-bridge";
export type { Product } from "../contracts/product";
export type { StylistResponse, StylistItem, StyleOutfitRequest } from "../contracts/stylist";

import type { ShopBridge } from "../contracts/shop-bridge";

/** The page's bridge, read lazily so the page can register window.shop after the call starts. */
export function windowShop(): ShopBridge | undefined {
  return typeof window === "undefined" ? undefined : window.shop;
}
