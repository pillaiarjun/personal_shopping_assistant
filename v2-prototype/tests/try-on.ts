// Virtual try-on test: puts a catalog item on the shopper's photo with Nano Banana.
// Run: node tests/try-on.ts [productId] [photo] [model]
//   productId  catalog id, e.g. MW-0230 (default: a denim trucker jacket)
//   photo      the shopper's picture (default: snapshot.jpg, saved by the agent during a call)
//   model      default gemini-3.1-flash-lite-image (Nano Banana 2 Lite)
// Writes tryon/<productId>-<model>.jpg and prints how long it took.
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import sharp from 'sharp';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
dotenv.config({ path: '.env.local', quiet: true });

const [productId = 'MW-0230', photoPath = 'snapshot.jpg', model = 'gemini-3.1-flash-lite-image'] = process.argv.slice(2);
const catalog = JSON.parse(
  await readFile(new URL('../../personal_shopping_assistant/data/catalog/products.json', import.meta.url), 'utf8'),
);
const product = catalog.find((p: any) => p.id === productId);
if (!product) throw new Error(`No product ${productId}`);

// Product photo straight from the store's CDN, normalised to a small JPEG.
const res = await fetch(product.source_images[0]);
if (!res.ok) throw new Error(`Product photo failed: ${res.status}`);
const garment = await sharp(Buffer.from(await res.arrayBuffer())).flatten({ background: '#ffffff' })
  .resize({ width: 768, height: 768, fit: 'inside' }).jpeg({ quality: 85 }).toBuffer();
const person = await sharp(await readFile(photoPath)).resize({ width: 1024, withoutEnlargement: true }).jpeg({ quality: 85 }).toBuffer();

const prompt = `Virtual try-on. The first image is a shopper on a webcam. The second image is a product: "${product.title}" (${product.category}).
Edit the first image so the shopper is wearing this exact item, replacing what they wear in that spot. Keep their face, hair, pose, body, background and lighting exactly the same.
Match the item's color, fabric, pattern and details to the product photo, and make it fit naturally with realistic folds and shadows. Output one photo.`;

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
const t0 = Date.now();
const out = await ai.models.generateContent({
  model,
  contents: [{ role: 'user', parts: [
    { inlineData: { mimeType: 'image/jpeg', data: person.toString('base64') } },
    { inlineData: { mimeType: 'image/jpeg', data: garment.toString('base64') } },
    { text: prompt },
  ] }],
});
const ms = Date.now() - t0;
const img = out.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData)?.inlineData?.data;
if (!img) throw new Error('No image back: ' + JSON.stringify(out.candidates?.[0]?.content?.parts?.map((p: any) => p.text ?? '[image]')));

await mkdir('tryon', { recursive: true });
const short = model.replace('gemini-', '').replace('-image', '');
await writeFile(`tryon/${productId}-${short}.jpg`, Buffer.from(img, 'base64'));
await writeFile(`tryon/${productId}-product.jpg`, garment);
console.log(`${product.title} with ${model}: ${(ms / 1000).toFixed(1)} s -> tryon/${productId}-${short}.jpg`);
