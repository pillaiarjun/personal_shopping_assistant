// Fake catalog for the harness and tests. Not the real data (that's Arjun's data/). Ids and singular categories follow TEAM_PLAN.md.
import type { Product } from "../../../contracts/product";

const p = (
  id: string,
  name: string,
  brand: string,
  category: string,
  price_usd: number,
  colors: string[],
  sizes: string[],
  formality: Product["formality"],
  style_tags: string[],
  description: string,
): Product => ({
  id,
  name,
  brand,
  category,
  price_usd,
  colors,
  sizes,
  formality,
  seasons: ["spring", "summer", "fall", "winter"],
  style_tags,
  image_url: "",
  description,
});

const TOPS = ["S", "M", "L", "XL"];
const WAIST = ["30", "32", "34", "36"];
const SHOE = ["8", "9", "10", "11", "12"];

export const STUB_PRODUCTS: Product[] = [
  p("jkt-001", "Unstructured Linen Blazer", "Ashby Tailoring", "jacket", 240, ["sand", "navy"], TOPS, 3, ["italian", "relaxed", "summer"], "Half-lined linen blazer with soft shoulders. Linen stays cool in the heat."),
  p("jkt-002", "Waxed Cotton Field Jacket", "Northfold", "jacket", 220, ["olive", "brown"], TOPS, 2, ["rugged", "heritage"], "Water-resistant waxed cotton with four bellows pockets."),
  p("jkt-003", "Navy Wool Suit Jacket", "Ashby Tailoring", "jacket", 380, ["navy"], ["38R", "40R", "42R", "44R"], 5, ["tailored", "formal"], "Two-button worsted wool jacket with a half canvas."),
  p("jkt-004", "Cotton Seersucker Blazer", "Saltmarsh", "jacket", 195, ["light blue"], TOPS, 3, ["summer", "preppy"], "Puckered cotton that breathes. Unlined for hot days."),
  p("shr-001", "Oxford Button-Down Shirt", "Harbor & Co", "shirt", 68, ["white", "light blue"], TOPS, 3, ["classic", "preppy"], "Crisp cotton oxford with a soft roll collar. Works tucked or untucked."),
  p("shr-002", "Linen Camp-Collar Shirt", "Saltmarsh", "shirt", 74, ["sand", "sage"], TOPS, 2, ["summer", "relaxed", "italian"], "Breathable washed linen with a boxy fit. Made for warm evenings."),
  p("shr-003", "Poplin Dress Shirt", "Ashby Tailoring", "shirt", 90, ["white"], TOPS, 4, ["tailored", "formal"], "Smooth two-ply poplin with a spread collar."),
  p("shr-004", "Heavyweight Pocket Tee", "Plain Step", "shirt", 32, ["white", "black", "heather grey"], TOPS, 1, ["basics", "casual"], "Thick 240gsm cotton tee that holds its shape."),
  p("trs-001", "Pleated Wool Trousers", "Ashby Tailoring", "trousers", 145, ["charcoal", "navy"], WAIST, 4, ["tailored", "smart"], "Single-pleat worsted wool with a tapered leg and side adjusters."),
  p("trs-002", "Stretch Chinos", "Harbor & Co", "trousers", 58, ["khaki", "olive", "navy"], WAIST, 3, ["smart casual"], "Everyday cotton chinos with a little stretch. Clean flat front."),
  p("trs-003", "Linen Drawstring Trousers", "Saltmarsh", "trousers", 85, ["sand", "white"], WAIST, 2, ["summer", "relaxed", "italian"], "Lightweight linen with a drawstring waist and a straight leg."),
  p("trs-004", "Slim Selvedge Jeans", "Indigo Works", "trousers", 120, ["indigo"], WAIST, 2, ["denim", "casual"], "Raw selvedge denim in a slim tapered cut. Fades with wear."),
  p("sho-001", "Suede Chelsea Boots", "Cobble Lane", "shoes", 165, ["tan", "chocolate"], SHOE, 3, ["smart casual"], "Suede chelsea boots on a slim rubber sole. Dress up or down."),
  p("sho-002", "White Leather Sneakers", "Plain Step", "shoes", 98, ["white"], SHOE, 2, ["minimal", "casual"], "Clean full-grain leather low-tops with a cupsole."),
  p("sho-003", "Penny Loafers", "Cobble Lane", "shoes", 150, ["burgundy", "black"], SHOE, 4, ["classic", "preppy", "italian"], "Hand-sewn moc-toe loafers in polished leather."),
  p("sho-004", "Cap-Toe Oxfords", "Cobble Lane", "shoes", 210, ["black"], SHOE, 5, ["formal", "tailored"], "Black calf oxfords on a leather sole. Black tie ready."),
];
