// Runs the agent's store tools without a call: build 3 outfits, then the try-on for each.
// Run: node tests/tools-test.ts [photo=tryon-photo.jpg]
import dotenv from 'dotenv';
import { readFile } from 'node:fs/promises';
dotenv.config({ path: '.env.local', quiet: true });
const { storeTools } = await import('../store-tools.ts');
const { tryOn } = await import('../tryon.ts');

const log = (m: string, x?: unknown) => console.log(m, x ?? '');
const fakeRoom = { room: { remoteParticipants: new Map(), localParticipant: null } } as any;
const tools: any = storeTools(fakeRoom, log);
const run = (name: string, args: any) => tools[name].execute(args, { ctx: {} as any, toolCallId: 'test' });

console.log(await run('search_products', { query: 'brown suede loafers', gender: 'men' }));
const t0 = Date.now();
const res = await run('build_outfits', { occasion: 'summer wedding in Italy, afternoon', budget_usd: 600, gender: 'men' });
console.log(JSON.stringify(res, null, 1).slice(0, 1500));
const photo = await readFile(process.argv[2] ?? 'tryon-photo.jpg');
const files = await Promise.all(res.outfits.map((o: any) => tryOn(photo, o.items.map((i: any) => i.product_id), `test-${o.number}`)));
console.log('try-ons', files, `${((Date.now() - t0) / 1000).toFixed(1)} s from start`);
