// Builds catalog/embeddings.json: one Gemini embedding per product, from its enriched details.
// Sasha's search compares a shopper's words against these. Run once (and after re-enriching):
//   node catalog/embed.ts
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { readFile, writeFile } from 'node:fs/promises';
import { embedText, EMBED_DIMS, EMBED_MODEL } from '../store.ts';
dotenv.config({ path: '.env.local', quiet: true });

const products: any[] = JSON.parse(await readFile(new URL('../../data/catalog/products.json', import.meta.url), 'utf8'));
const enriched: Record<string, any> = JSON.parse(await readFile(new URL('./enriched.json', import.meta.url), 'utf8'));
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

const out: Record<string, number[]> = {};
const BATCH = 100;
const t0 = Date.now();
for (let i = 0; i < products.length; i += BATCH) {
  const batch = products.slice(i, i + BATCH);
  const res = await ai.models.embedContent({
    model: EMBED_MODEL,
    contents: batch.map((p) => embedText(p, enriched[p.id])),
    config: { taskType: 'RETRIEVAL_DOCUMENT', outputDimensionality: EMBED_DIMS },
  });
  res.embeddings!.forEach((e, j) => (out[batch[j].id] = e.values!.map((v) => Math.round(v * 1e4) / 1e4)));
  console.log(`${Math.min(i + BATCH, products.length)}/${products.length}`);
}
await writeFile(new URL('./embeddings.json', import.meta.url), JSON.stringify(out));
console.log(`done in ${((Date.now() - t0) / 1000).toFixed(1)} s with ${EMBED_MODEL}`);
