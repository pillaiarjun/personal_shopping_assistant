// A robot shopper for whole-call tests, no person needed. It joins a room like the store page does
// (token from server.ts), shows last-frame.jpg as its camera, speaks each line with macOS `say`,
// and answers the agent's page calls ("barn" RPC) the way the store would.
// Each line is spoken once Sasha has finished talking (her audio has been quiet for a moment).
// Run (with server.ts and the agent running):  node tests/call-sim.ts "I'm Mike." "A wedding." ...
// Then read agent.log for both sides of the conversation.
import { AudioFrame, AudioSource, AudioStream, LocalAudioTrack, LocalVideoTrack, Room, RoomEvent, TrackKind, TrackPublishOptions, TrackSource, VideoBufferType, VideoFrame, VideoSource, type RemoteTrack } from '@livekit/rtc-node';
import sharp from 'sharp';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const LINES = process.argv.slice(2).length ? process.argv.slice(2) : [
  "I'm Mike.",
  "Honestly, I've got a wedding coming up.",
  "It's outdoors, summer afternoon. About six hundred bucks.",
  "No, nothing to build around.",
  "The second one.",
  "Yes, show me.",
];
const RATE = 24000;
const log = (m: string) => console.log(`[sim +${((Date.now() - t0) / 1000).toFixed(1)}s] ${m}`);
const t0 = Date.now();
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function speech(text: string): Int16Array {
  const file = join(tmpdir(), `sim-${Date.now()}.wav`);
  execFileSync('say', ['-o', file, `--data-format=LEI16@${RATE}`, text]);
  const buf = readFileSync(file);
  const at = buf.indexOf('data') + 8; // skip the WAV header
  return new Int16Array(buf.buffer.slice(buf.byteOffset + at, buf.byteOffset + buf.length));
}

const { url, token } = await (await fetch('http://localhost:8790/token')).json();
const room = new Room();
const actions: Record<string, unknown> = {};
const bag: any[] = []; // what the fake store has bagged
let looks: string[] = []; // outfit names on screen, for lines like "I like the {outfit2}"
room.localParticipant!; // set after connect
await room.connect(url, token, { autoSubscribe: true, dynacast: false });
room.localParticipant!.registerRpcMethod('barn', async (data) => {
  const a = JSON.parse(data.payload);
  log(`PAGE ${a.action} ${JSON.stringify({ ...a, action: undefined, result: a.result ? `${a.result.looks.length} looks` : undefined }).slice(0, 160)}`);
  if (a.action === 'show_looks') looks = a.result.looks.map((l: any) => l.outfit_name);
  if (a.action === 'add_to_bag') { bag.push(a); return JSON.stringify({ ok: true, size: a.size, count: bag.length }); }
  if (a.action === 'get_bag') return JSON.stringify({ ok: true, count: bag.length, total: 0 });
  return JSON.stringify(actions[a.action] ?? { ok: true, sizes: ['M', 'L'], colors: ['default'] });
});
log('joined');

// Camera: the still picture, twice a second.
const img = await sharp(readFileSync(new URL('../last-frame.jpg', import.meta.url))).resize(640, 360).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const vsrc = new VideoSource(img.info.width, img.info.height);
await room.localParticipant!.publishTrack(LocalVideoTrack.createVideoTrack('camera', vsrc), new TrackPublishOptions({ source: TrackSource.SOURCE_CAMERA }));
const cam = setInterval(() => vsrc.captureFrame(new VideoFrame(new Uint8Array(img.data), img.info.width, img.info.height, VideoBufferType.RGBA)), 500);

// Mic: silence, except while a line is spoken.
const asrc = new AudioSource(RATE, 1);
await room.localParticipant!.publishTrack(LocalAudioTrack.createAudioTrack('mic', asrc), new TrackPublishOptions({ source: TrackSource.SOURCE_MICROPHONE }));
const CHUNK = RATE / 50; // 20 ms
let queue: Int16Array | null = null;
let pos = 0;
const mic = setInterval(async () => {
  const out = new Int16Array(CHUNK);
  if (queue) {
    out.set(queue.subarray(pos, pos + CHUNK));
    pos += CHUNK;
    if (pos >= queue.length) queue = null;
  }
  await asrc.captureFrame(new AudioFrame(out, RATE, 1, CHUNK));
}, 20);

// Sasha's voice: watch its loudness to know when she has finished talking.
let lastLoud = 0;
room.on(RoomEvent.TrackSubscribed, async (track: RemoteTrack) => {
  if (track.kind !== TrackKind.KIND_AUDIO) return;
  for await (const f of new AudioStream(track) as any) {
    const d = f.data as Int16Array;
    let sum = 0;
    for (let i = 0; i < d.length; i += 8) sum += Math.abs(d[i]);
    if (sum / (d.length / 8) > 300) lastLoud = Date.now();
  }
});
async function waitForSasha(quietMs = 2600, maxMs = 45000) {
  const start = Date.now();
  await sleep(1500);
  while (Date.now() - start < maxMs) {
    if (lastLoud && Date.now() - lastLoud > quietMs) return true;
    await sleep(200);
  }
  return false;
}

for (const line of LINES) {
  const ok = await waitForSasha();
  if (!ok) log('!! Sasha never finished (or never spoke): sending the next line anyway');
  // A leading "~" speaks the line quietly (25% volume), "~~" very quietly (10%), like a short mumbled "yes".
  const quiet = line.startsWith('~~') ? 0.1 : line.startsWith('~') ? 0.25 : 1;
  const text = line.replace(/^~+/, '').replace(/\{outfit(\d)\}/g, (_, n) => looks[+n - 1] ?? `outfit ${n}`);
  log(`YOU${quiet < 1 ? ` (volume ${quiet * 100}%)` : ''}: ${text}`);
  queue = speech(text).map((v) => Math.round(v * quiet));
  pos = 0;
  lastLoud = 0;
  while (queue) await sleep(100);
}
if (!(await waitForSasha(2500, 60000))) log('!! no reply to the last line');
log('done');
clearInterval(cam);
clearInterval(mic);
await room.disconnect();
process.exit(0);
