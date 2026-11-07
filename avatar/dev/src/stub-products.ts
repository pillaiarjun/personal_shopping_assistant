// Fake catalog for the harness and tests. Not the real data (that's Mike's data/).
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
  p("p_001", "Oxford Button-Down Shirt", "Harbor & Co", "shirts", 68, ["white", "light blue"], TOPS, 3, ["classic", "preppy"], "Crisp cotton oxford with a soft roll collar. Works tucked or untucked."),
  p("p_002", "Linen Camp-Collar Shirt", "Saltmarsh", "shirts", 74, ["sand", "sage"], TOPS, 2, ["summer", "relaxed"], "Breathable washed linen with a boxy fit. Made for warm evenings."),
  p("p_003", "Merino Crewneck Sweater", "Northfold", "knitwear", 95, ["navy", "charcoal", "oatmeal"], TOPS, 3, ["classic", "layering"], "Fine-gauge merino that layers over a collar without bulk."),
  p("p_004", "Slim Selvedge Jeans", "Indigo Works", "trousers", 120, ["indigo"], WAIST, 2, ["denim", "casual"], "Raw selvedge denim in a slim tapered cut. Fades with wear."),
  p("p_005", "Pleated Wool Trousers", "Ashby Tailoring", "trousers", 145, ["charcoal", "navy"], WAIST, 4, ["tailored", "smart"], "Single-pleat worsted wool with a tapered leg and side adjusters."),
  p("p_006", "Stretch Chinos", "Harbor & Co", "trousers", 58, ["khaki", "olive", "navy"], WAIST, 3, ["smart casual"], "Everyday cotton chinos with a little stretch. Clean flat front."),
  p("p_007", "Unstructured Linen Blazer", "Ashby Tailoring", "outerwear", 210, ["navy", "tan"], TOPS, 4, ["tailored", "summer"], "Half-lined linen blazer with soft shoulders. Easy over a tee or a shirt."),
  p("p_008", "Waxed Cotton Field Jacket", "Northfold", "outerwear", 240, ["olive", "brown"], TOPS, 2, ["rugged", "heritage"], "Water-resistant waxed cotton with four bellows pockets."),
  p("p_009", "Suede Chelsea Boots", "Cobble Lane", "shoes", 165, ["tan", "chocolate"], SHOE, 3, ["smart casual"], "Suede chelsea boots on a slim rubber sole. Dress up or down."),
  p("p_010", "White Leather Sneakers", "Plain Step", "shoes", 98, ["white"], SHOE, 2, ["minimal", "casual"], "Clean full-grain leather low-tops with a cupsole."),
  p("p_011", "Penny Loafers", "Cobble Lane", "shoes", 150, ["burgundy", "black"], SHOE, 4, ["classic", "preppy"], "Hand-sewn moc-toe loafers in polished leather."),
  p("p_012", "Heavyweight Pocket Tee", "Plain Step", "shirts", 32, ["white", "black", "heather grey"], TOPS, 1, ["basics", "casual"], "Thick 240gsm cotton tee that holds its shape."),
  p("p_013", "Knit Silk Tie", "Ashby Tailoring", "accessories", 55, ["navy", "burgundy"], ["One size"], 4, ["tailored"], "Square-end knit silk tie with a textured weave."),
  p("p_014", "Leather Dress Belt", "Cobble Lane", "accessories", 48, ["brown", "black"], ["32", "34", "36"], 3, ["classic"], "Full-grain leather belt with a brushed silver buckle."),
  p("p_015", "Linen Drawstring Shorts", "Saltmarsh", "shorts", 52, ["sand", "navy"], TOPS, 1, ["summer", "relaxed"], "Lightweight linen shorts with a 7-inch inseam."),
  p("p_016", "Navy Wool Suit Jacket", "Ashby Tailoring", "outerwear", 380, ["navy"], ["38R", "40R", "42R", "44R"], 5, ["tailored", "formal"], "Two-button worsted wool jacket with a half canvas."),
];
