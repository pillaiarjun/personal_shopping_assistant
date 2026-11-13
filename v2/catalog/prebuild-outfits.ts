// Builds the ready-made outfit library (catalog/outfit-library.json) with Gemini 4 Hydrogen, ahead of time.
// During a call, build_outfits uses these when his occasion and budget are close to one here (instant),
// and builds live with Flash Lite otherwise.
//   node catalog/prebuild-outfits.ts            # fills in whatever is missing (safe to re-run after errors)
//   node catalog/prebuild-outfits.ts --fresh    # rebuilds everything
// Uses GOOGLE_API_KEY (free tier: only 20 Hydrogen requests a day, so it takes a few days to fill),
// or the paid key with PREBUILD_KEY=paid node catalog/prebuild-outfits.ts (about 60 builds, a few dollars at most).
// Hydrogen is slow (~40 s a build) and the free tier is often busy, so it waits and retries.
import dotenv from 'dotenv';
import type { LibraryEntry } from '../store.ts';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
dotenv.config({ path: '.env.local', quiet: true }); // run from v2/
if (process.env.PREBUILD_KEY === 'paid') process.env.GOOGLE_API_KEY = process.env.GOOGLE_TRYON_API_KEY;
process.env.OUTFIT_FALLBACK_MODELS = ''; // Hydrogen only: no quiet fallback to a smaller model
const MODEL = process.env.PREBUILD_MODEL ?? 'gemini-4-hydrogen';
const { buildOutfits, embedOccasion, hasAccessory, MAX_PIECES } = await import('../store.ts');

const OCCASIONS = [
  'dinner date',
  'outdoor summer wedding guest',
  'formal evening wedding guest',
  'job interview',
  'everyday office',
  'weekend in the city, brunch and walking around',
  'beach vacation',
  'night out at a bar or party',
  'business trip and conference',
  'casual drinks with friends',
];
const BUDGETS = [300, 500, 800];
const GENDERS = ['men', 'women'] as const;

const FILE = new URL('./outfit-library.json', import.meta.url);
const fresh = process.argv.includes('--fresh');
// Entries made under older rules (no accessory, or more than six pieces) are rebuilt.
const entries: LibraryEntry[] = (!fresh && existsSync(FILE) ? JSON.parse(readFileSync(FILE, 'utf8')).entries as LibraryEntry[] : [])
  .filter((e) => e.outfits.every((o) => hasAccessory(o) && o.items.length <= MAX_PIECES));
const save = () => writeFileSync(FILE, JSON.stringify({ made_with: MODEL, entries }, null, 0).replace(/\{"occasion"/g, '\n{"occasion"') + '\n');
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const jobs = GENDERS.flatMap((gender) => OCCASIONS.flatMap((occasion) => BUDGETS.map((budget_usd) => ({ gender, occasion, budget_usd }))))
  .filter((j) => !entries.some((e) => e.gender === j.gender && e.occasion === j.occasion && e.budget_usd === j.budget_usd));
console.log(`${jobs.length} to build with ${MODEL}`);

async function one(j: (typeof jobs)[number]) {
  for (let attempt = 1; attempt <= 6; attempt++) {
    try {
      const { outfits, ms } = await buildOutfits({ ...j, notes: '' }, { model: MODEL, library: false });
      if (outfits.length < 3) throw new Error(`only ${outfits.length} outfits`);
      const vector = await embedOccasion(j);
      entries.push({ ...j, model: MODEL, vector, outfits });
      save();
      console.log(`ok   ${j.gender} ${j.occasion} $${j.budget_usd} in ${(ms / 1000).toFixed(0)}s: ${outfits.map((o: any) => `${o.outfit_name} (${o.items.length} pcs, $${o.total_usd})`).join(', ')}`);
      return;
    } catch (e) {
      console.log(`try ${attempt} ${j.gender} ${j.occasion} $${j.budget_usd}: ${String((e as Error).message).slice(0, 90)}`);
      await sleep(attempt * 15000);
    }
  }
  console.log(`GAVE UP ${j.gender} ${j.occasion} $${j.budget_usd}`);
}

// Two at a time: faster, without tripping the free tier's per-minute limit too often.
const queue = [...jobs];
await Promise.all([0, 1].map(async () => { while (queue.length) await one(queue.shift()!); }));
console.log(`library has ${entries.length} entries`);
