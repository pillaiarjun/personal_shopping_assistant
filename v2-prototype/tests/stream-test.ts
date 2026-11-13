// Streams last-frame.jpg as LIVE VIDEO input (not chat history), then asks about it.
// Usage: node tests/stream-test.ts media|video
import { GoogleGenAI, Modality } from '@google/genai';
import dotenv from 'dotenv';
import { readFile } from 'node:fs/promises';
dotenv.config({ path: '.env.local', quiet: true });
const field = process.argv[2] ?? 'video';
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
const data = (await readFile('last-frame.jpg')).toString('base64');
let text = '';
await new Promise<void>((resolve, reject) => {
  const timer = setTimeout(() => reject(new Error('timeout')), 30000);
  ai.live.connect({
    model: 'gemini-3.8-live',
    config: { responseModalities: [Modality.AUDIO], outputAudioTranscription: {} },
    callbacks: {
      onmessage: (m: any) => {
        const sc = m.serverContent;
        if (sc?.outputTranscription?.text) text += sc.outputTranscription.text;
        if (sc?.turnComplete) { clearTimeout(timer); resolve(); }
      },
      onerror: reject,
      onclose: (e: any) => { clearTimeout(timer); text ? resolve() : reject(new Error('closed: ' + e?.reason)); },
    },
  }).then(async (s) => {
    for (let i = 0; i < 3; i++) { s.sendRealtimeInput({ [field]: { mimeType: 'image/jpeg', data } } as any); await new Promise(r => setTimeout(r, 1000)); }
    s.sendRealtimeInput({ text: 'In one sentence, what am I wearing right now?' });
  }).catch(reject);
});
console.log(`${field}: ${text.trim()}`);
process.exit(0);
