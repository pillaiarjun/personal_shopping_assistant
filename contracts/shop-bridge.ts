// DRAFT — Arjun + Soham agree this at the 1:15 pairing.
//
// The shop page implements ShopBridge and assigns it to window.shop. The avatar's tool
// router (avatar/router.ts) calls it when Tavus sends a tool call, and you can drive it
// from the browser console too:
//   await window.shop.searchProducts({ query: "linen shirt", max_price: 80 })
//   await window.shop.showProduct("p_001")
//   await window.shop.addToCart("p_001", "M")
//
// Every method may be sync or async. The page owns all rendering; the router only
// receives compact data back and trims it before sending it to the avatar.

import type { Product } from "./product";
import type { StylistResponse } from "./stylist";

export interface SearchFilters {
  /** free text, e.g. "navy linen shirt" */
  query?: string;
  category?: string;
  max_price?: number;
  color?: string;
}

export type AddToCartResult =
  | { ok: true; cart_count: number; cart_total_usd: number }
  /** reason is spoken by the avatar, so keep it short: "Size XL is sold out." */
  | { ok: false; reason: string };

export interface ShopBridge {
  /** Apply filters to the visible grid. Return matches in rank order (the router keeps the top 5). */
  searchProducts(filters: SearchFilters): Product[] | Promise<Product[]>;
  /** Open the product detail view. Return the product, or null if the id is unknown. */
  showProduct(productId: string): Product | null | Promise<Product | null>;
  /** Add to cart. Only called after the shopper says yes out loud. */
  addToCart(productId: string, size: string): AddToCartResult | Promise<AddToCartResult>;
  /** Render the outfit board from the stylist response. */
  showOutfit(outfit: StylistResponse): void | Promise<void>;
}

declare global {
  interface Window {
    shop?: ShopBridge;
  }
}
