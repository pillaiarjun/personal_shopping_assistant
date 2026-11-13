// Cleanup pass over catalog/enriched.json (run after catalog/enrich.ts). Safe to re-run.
//  1. Color: Gemini describes the color in the PHOTO. For items sold in several colors that is
//     only one of them, so it's stored as photo_color, next to the full listed_colors.
//  2. Formality: Gemini rarely gives 5, so tuxedos, gowns and black-tie pieces are set to 5.
//  3. Sasha lines: rewrites lines with banned words or an opener used more than 3 times.
// Run: node catalog/cleanup.ts [file]   (default catalog/enriched.json)
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
dotenv.config({ path: '.env.local', quiet: true });

const CATALOG_PATHS = ['../../data/catalog/products.json', '../../personal_shopping_assistant/data/catalog/products.json'];
const CATALOG_FILE = CATALOG_PATHS.map((p) => new URL(p, import.meta.url)).find((u) => existsSync(u))!;
const FILE = process.argv[2] ?? fileURLToPath(new URL('./enriched.json', import.meta.url));
const MODEL = process.env.ENRICH_MODEL ?? 'gemini-3.5-flash-lite';
const BANNED = /\b(darling|elevat\w*|chic|effortless\w*|MVP)\b|^nothing\b/i;
const MAX_PER_OPENER = 3;

const data: Record<string, any> = JSON.parse(await readFile(FILE, 'utf8'));
const products = JSON.parse(await readFile(CATALOG_FILE, 'utf8'));
const byId = Object.fromEntries(products.map((p: any) => [p.id, p]));
const ids = Object.keys(data);

// 1. Color.
let multi = 0;
for (const id of ids) {
  const e = data[id];
  const p = byId[id];
  if (e.color !== undefined) { e.photo_color = e.color; delete e.color; }
  e.listed_colors = p.colors;
  e.photo_shows_one_of_several_colors = p.colors.length > 1;
  if (e.photo_shows_one_of_several_colors) multi++;
}

// 2. Formality.
const blackTie = (e: any, p: any) =>
  p.category === 'Tuxedos' || p.subcategory === 'Gown' || (p.occasions.includes('black tie') && ['one-piece', 'suit', 'layer'].includes(e.slot) && e.formality >= 4);
let raised = 0;
for (const id of ids) {
  const e = data[id];
  if (blackTie(e, byId[id]) && e.formality !== 5) { e.formality = 5; raised++; }
}

// 3. Sasha lines.
const opener = (s: string) => s.trim().split(/\s+/).slice(0, 2).join(' ').toLowerCase().replace(/[^a-z' ]/g, '');
const seen: Record<string, number> = {};
const redo: string[] = [];
for (const id of ids) {
  const line = data[id].sasha_line ?? '';
  const o = opener(line);
  seen[o] = (seen[o] ?? 0) + 1;
  if (BANNED.test(line) || seen[o] > MAX_PER_OPENER) redo.push(id);
}
const overused = Object.entries(seen).filter(([, n]) => n >= MAX_PER_OPENER).map(([o]) => `"${o}"`);

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
async function rewrite(id: string) {
  const e = data[id];
  const p = byId[id];
  const res = await ai.models.generateContent({
    model: MODEL,
    contents: `Write one new spoken line from Sasha, a direct, funny New York stylist, about why this piece works.
Item: ${p.title} (${p.category}). ${e.visual_description}
Rules: under 20 words, plain words, a little attitude, specific to this item. No price.
Do not start with: ${overused.join(', ') || 'none'}, "Nothing". Never use "darling", "elevate", "chic", "effortless" or "MVP".
Current line to replace: "${e.sasha_line}"
Reply with the line only.`,
    config: { temperature: 0.9 },
  });
  const line = (res.text ?? '').trim().replace(/^"|"$/g, '');
  if (line && !BANNED.test(line)) e.sasha_line = line;
}
let fixed = 0;
const queue = [...redo];
await Promise.all(Array.from({ length: 4 }, async () => {
  while (queue.length) {
    const id = queue.shift()!;
    for (let i = 1; i <= 3; i++) {
      try { await rewrite(id); fixed++; break; }
      catch (err) { await new Promise((r) => setTimeout(r, /429|quota/i.test(String(err)) ? 20000 : 2000)); }
    }
  }
}));

await writeFile(FILE, JSON.stringify(data, null, 1));
console.log(`${ids.length} items: ${multi} sold in several colors (photo_color + listed_colors), ${raised} raised to formality 5, ${fixed}/${redo.length} Sasha lines rewritten`);
