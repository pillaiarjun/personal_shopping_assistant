// Full-outfit try-on test: several outfits (each several catalog items) generated at the same time,
// the way Sasha would start them while she describes the looks.
// Run: node tests/try-on-outfits.ts [photo] [outfits] [model]
//   photo    the shopper's picture (default: tryon-photo.jpg)
//   outfits  outfits split by ";", items by ",", e.g. "MW-0227,MW-0039,MW-0102;MW-0183,MW-0444,MW-0109"
//   model    default gemini-3.1-flash-image (Nano Banana 2)
//   scene    studio (default): head-to-toe on a white photo set. room: keep their own photo's setting.
// Writes tryon/outfit-<n>-<scene>.jpg and tryon/outfits-compare-<scene>.jpg, and prints how long each took.
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { existsSync } from 'node:fs';
import sharp from 'sharp';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
dotenv.config({ path: '.env.local', quiet: true });

const CATALOG_PATHS = ['../../data/catalog/products.json', '../../personal_shopping_assistant/data/catalog/products.json'];
const CATALOG_FILE = CATALOG_PATHS.map((p) => new URL(p, import.meta.url)).find((u) => existsSync(u))!;
const SITE_PHOTOS = 'https://mhalpert.github.io/mens-fashion-barn/data/catalog/';
const DEFAULT_OUTFITS = 'MW-0227,MW-0039,MW-0102;MW-0183,MW-0444,MW-0109;MW-0234,MW-0040,MW-0072';
const [photoPath = 'tryon-photo.jpg', outfitArg = DEFAULT_OUTFITS, model = 'gemini-3.1-flash-image', scene = 'studio'] = process.argv.slice(2);

const catalog: any[] = JSON.parse(await readFile(CATALOG_FILE, 'utf8'));
const byId = Object.fromEntries(catalog.map((p) => [p.id, p]));
const outfits = outfitArg.split(';').map((o) => o.split(',').map((id) => {
  const p = byId[id.trim()];
  if (!p) throw new Error(`No product ${id}`);
  return p;
}));

async function productPhoto(p: any) {
  const urls = [...p.source_images, ...p.images.map((i: string) => SITE_PHOTOS + i.replace(/\.(png|jpe?g)$/i, '.webp'))];
  for (const u of urls) {
    try {
      const res = await fetch(u);
      if (!res.ok) continue;
      return await sharp(Buffer.from(await res.arrayBuffer())).flatten({ background: '#ffffff' })
        .resize({ width: 512, height: 512, fit: 'inside' }).jpeg({ quality: 85 }).toBuffer();
    } catch { /* try the next one */ }
  }
  throw new Error(`No working photo for ${p.id}`);
}

const person = await sharp(await readFile(photoPath)).resize({ width: 1024, withoutEnlargement: true }).jpeg({ quality: 85 }).toBuffer();
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

async function tryOn(items: any[], n: number) {
  const photos = await Promise.all(items.map(productPhoto));
  const list = items.map((p, i) => `Image ${i + 2}: "${p.title}" (${p.category})`).join('\n');
  const prompt = scene === 'studio'
    ? `Fashion photo shoot. Image 1 shows the shopper (it is only a reference for who they are). The other images are clothing products:
${list}
Create a new full-length photo of this same person, head to toe, wearing ALL of these items together as one outfit.
Keep their face, hair, skin tone and body shape exactly the same so they are clearly recognizable. Do not make them slimmer, taller or more muscular.
Setting: a professional photo studio with a seamless pure white background and floor, soft even lighting, a light natural shadow under the feet. Relaxed natural standing pose, facing the camera, the whole body and shoes in frame.
Match each item's color, fabric, pattern and details to its product photo, with realistic fit, folds and shadows. Output one photo.`
    : `Virtual try-on. Image 1 is a shopper on a webcam. The other images are clothing products:
${list}
Edit image 1 so the shopper is wearing ALL of these items together as one outfit, replacing what they wear now. Keep their face, hair, pose, body, background and lighting exactly the same, and keep the same framing.
Match each item's color, fabric, pattern and details to its product photo, with realistic fit, folds and shadows. Only show parts of the outfit that fall inside the frame. Output one photo.`;
  const t0 = Date.now();
  const out = await ai.models.generateContent({
    model,
    contents: [{ role: 'user', parts: [
      { inlineData: { mimeType: 'image/jpeg', data: person.toString('base64') } },
      ...photos.map((b) => ({ inlineData: { mimeType: 'image/jpeg', data: b.toString('base64') } })),
      { text: prompt },
    ] }],
    // Studio: a portrait shot. Room: keep the webcam's wide shape so it can't zoom out and invent things.
    config: { imageConfig: { aspectRatio: scene === 'studio' ? '3:4' : '16:9' } },
  });
  const img = out.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData)?.inlineData?.data;
  if (!img) throw new Error(`Outfit ${n}: no image back`);
  const file = `tryon/outfit-${n}-${scene}.jpg`;
  await writeFile(file, Buffer.from(img, 'base64'));
  console.log(`outfit ${n} (${items.map((p) => p.id).join(', ')}): ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  return { file, photos };
}

await mkdir('tryon', { recursive: true });
const t0 = Date.now();
const results = await Promise.all(outfits.map((o, i) => tryOn(o, i + 1)));
console.log(`all ${outfits.length} done in ${((Date.now() - t0) / 1000).toFixed(1)} s (run at the same time)`);

// One comparison sheet: a row per outfit = product photos, then the try-on.
const H = 360;
const rows = await Promise.all(results.map(async (r) => {
  const tiles = [...r.photos, await readFile(r.file)];
  const imgs = await Promise.all(tiles.map((b) => sharp(b).resize({ height: H }).toBuffer({ resolveWithObject: true })));
  return imgs;
}));
const width = Math.max(...rows.map((imgs) => imgs.reduce((w, i) => w + i.info.width + 10, -10)));
const comp: any[] = [];
rows.forEach((imgs, r) => { let x = 0; for (const i of imgs) { comp.push({ input: i.data, left: x, top: r * (H + 10) }); x += i.info.width + 10; } });
await sharp({ create: { width, height: rows.length * (H + 10) - 10, channels: 3, background: '#ffffff' } })
  .composite(comp).jpeg({ quality: 85 }).toFile(`tryon/outfits-compare-${scene}.jpg`);
console.log(`comparison sheet -> tryon/outfits-compare-${scene}.jpg`);
