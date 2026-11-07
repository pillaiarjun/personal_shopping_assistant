// Stand-in for Arjun's page: implements ShopBridge over the stub catalog and reports UI state.
import type { Product } from "../../../contracts/product";
import type { SearchFilters, ShopBridge } from "../../../contracts/shop-bridge";
import type { StylistResponse } from "../../../contracts/stylist";

export interface CartLine {
  product: Product;
  size: string;
}

export interface ShopView {
  filters: SearchFilters;
  results: Product[];
  shown: Product | null;
  cart: CartLine[];
  outfit: StylistResponse | null;
}

export function searchCatalog(catalog: Product[], f: SearchFilters): Product[] {
  const words = (f.query ?? "").toLowerCase().split(/\s+/).filter(Boolean);
  const scored = catalog
    .filter((p) => !f.category || p.category.toLowerCase().includes(f.category.toLowerCase()))
    .filter((p) => f.max_price == null || p.price_usd <= f.max_price)
    .filter((p) => !f.color || p.colors.some((c) => c.toLowerCase().includes(f.color!.toLowerCase())))
    .map((p) => {
      const hay = [p.name, p.brand, p.category, ...p.colors, ...p.style_tags, p.description].join(" ").toLowerCase();
      return { p, score: words.filter((w) => hay.includes(w)).length };
    })
    .filter(({ score }) => words.length === 0 || score > 0)
    .sort((a, b) => b.score - a.score || a.p.price_usd - b.p.price_usd);
  return scored.map(({ p }) => p);
}

export function createFakeShop(catalog: Product[], onChange: (view: ShopView) => void): ShopBridge {
  const view: ShopView = { filters: {}, results: catalog, shown: null, cart: [], outfit: null };
  const emit = () => onChange({ ...view, cart: [...view.cart] });
  const byId = (id: string) => catalog.find((p) => p.id === id) ?? null;

  return {
    searchProducts(filters) {
      view.filters = filters;
      view.results = searchCatalog(catalog, filters);
      view.shown = null;
      emit();
      return view.results;
    },
    showProduct(id) {
      view.shown = byId(id);
      emit();
      return view.shown;
    },
    addToCart(id, size) {
      const p = byId(id);
      if (!p) return { ok: false, reason: `There's no product with id ${id}.` };
      if (!p.sizes.includes(size)) return { ok: false, reason: `${p.name} comes in ${p.sizes.join(", ")}, not ${size}.` };
      view.cart.push({ product: p, size });
      emit();
      return {
        ok: true,
        cart_count: view.cart.length,
        cart_total_usd: view.cart.reduce((s, l) => s + l.product.price_usd, 0),
      };
    },
    showOutfit(outfit) {
      view.outfit = outfit;
      emit();
    },
  };
}
