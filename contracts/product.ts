// DRAFT — needs team sign-off (Mike: data/, Arjun: shop page). Shape copied from the team plan.

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price_usd: number;
  colors: string[];
  sizes: string[];
  /** 1 = very casual … 5 = black tie */
  formality: 1 | 2 | 3 | 4 | 5;
  seasons: string[];
  style_tags: string[];
  image_url: string;
  description: string;
}
