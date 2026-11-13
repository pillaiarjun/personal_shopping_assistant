// The try-on reveal: the shopper, head to toe, wearing a whole outfit on a white photo set.
// Nano Banana 2 (gemini-3.1-flash-image) from the latest camera snapshot plus each product's photo.
// Takes about 7 seconds, so the agent starts all three outfits the moment they're on screen.
import { GoogleGenAI } from '@google/genai';
import sharp from 'sharp';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { byId } from './store.ts';

const MODEL = process.env.TRYON_MODEL ?? 'gemini-3.1-flash-image';
const SITE_PHOTOS = 'https://mhalpert.github.io/mens-fashion-barn/data/catalog/';
const OUT_DIR = new URL('./tryon/', import.meta.url);

let client: GoogleGenAI | null = null;
const ai = () => (client ??= new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY }));

const photoCache = new Map<string, Promise<Buffer>>();
function productPhoto(p: any) {
  if (!photoCache.has(p.id)) {
    photoCache.set(p.id, (async () => {
      const urls = [...(p.source_images ?? []), ...p.images.map((i: string) => SITE_PHOTOS + i.replace(/\.(png|jpe?g)$/i, '.webp'))];
      for (const u of urls) {
        try {
          const res = await fetch(u);
          if (!res.ok) continue;
          return await sharp(Buffer.from(await res.arrayBuffer())).flatten({ background: '#ffffff' })
            .resize({ width: 512, height: 512, fit: 'inside' }).jpeg({ quality: 85 }).toBuffer();
        } catch { /* try the next one */ }
      }
      photoCache.delete(p.id);
      throw new Error(`No working photo for ${p.id}`);
    })());
  }
  return photoCache.get(p.id)!;
}

/** Makes the picture and returns its file name (served by server.ts at /tryon/<file>). */
export async function tryOn(personJpeg: Buffer, productIds: string[], name: string): Promise<string> {
  const items = productIds.map((id) => byId[id]).filter(Boolean);
  const [person, ...photos] = await Promise.all([
    sharp(personJpeg).resize({ width: 1024, withoutEnlargement: true }).jpeg({ quality: 85 }).toBuffer(),
    ...items.map(productPhoto),
  ]);
  const list = items.map((p, i) => `Image ${i + 2}: "${p.title}" (${p.category})`).join('\n');
  const prompt = `Fashion photo shoot. Image 1 shows the shopper (it is only a reference for who they are). The other images are clothing products:
${list}
Create a new full-length photo of this same person, head to toe, wearing ALL of these items together as one outfit.
Keep their face, hair, skin tone and body shape exactly the same so they are clearly recognizable. Do not make them slimmer, taller or more muscular.
Setting: a professional photo studio with a seamless pure white background and floor, soft even lighting, a light natural shadow under the feet. Relaxed natural standing pose, facing the camera, the whole body and shoes in frame.
Match each item's color, fabric, pattern and details to its product photo, with realistic fit, folds and shadows. Output one photo.`;
  const out = await ai().models.generateContent({
    model: MODEL,
    contents: [{ role: 'user', parts: [
      { inlineData: { mimeType: 'image/jpeg', data: person.toString('base64') } },
      ...photos.map((b) => ({ inlineData: { mimeType: 'image/jpeg', data: b.toString('base64') } })),
      { text: prompt },
    ] }],
    config: { imageConfig: { aspectRatio: '3:4' } },
  });
  const img = out.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData)?.inlineData?.data;
  if (!img) throw new Error('The image model sent no picture back');
  await mkdir(OUT_DIR, { recursive: true });
  const file = `${name}-${Date.now().toString(36)}.jpg`;
  await writeFile(new URL(file, OUT_DIR), await sharp(Buffer.from(img, 'base64')).jpeg({ quality: 88 }).toBuffer());
  return file;
}

export const readSnapshot = (path = 'snapshot.jpg') => readFile(path).catch(() => null);
