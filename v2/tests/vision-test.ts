// Sends last-frame.jpg to Gemini Live (same model Sasha uses) and prints what it says.
import { GoogleGenAI, Modality } from '@google/genai';
import dotenv from 'dotenv';
import { readFile } from 'node:fs/promises';
dotenv.config({ path: '.env.local', quiet: true });

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
const img = (await readFile(process.argv[2] ?? 'last-frame.jpg')).toString('base64');
let text = '';
const t0 = Date.now();
let firstAudio = 0;
const done = new Promise<void>((resolve, reject) => {
  const timer = setTimeout(() => reject(new Error('timeout')), 30000);
  ai.live
    .connect({
      model: 'gemini-3.8-live',
      config: { responseModalities: [Modality.AUDIO], outputAudioTranscription: {} },
      callbacks: {
        onmessage: (m: any) => {
          const sc = m.serverContent;
          if (sc?.modelTurn?.parts?.some((p: any) => p.inlineData) && !firstAudio) firstAudio = Date.now() - t0;
          if (sc?.outputTranscription?.text) text += sc.outputTranscription.text;
          if (sc?.turnComplete) { clearTimeout(timer); resolve(); }
        },
        onerror: (e: any) => reject(e),
        onclose: (e: any) => { if (!text) reject(new Error('closed: ' + (e?.reason ?? ''))); },
      },
    })
    .then((session) => {
      session.sendClientContent({
        turns: [{ role: 'user', parts: [
          { inlineData: { mimeType: 'image/jpeg', data: img } },
          { text: 'In one sentence: what is this person wearing?' },
        ] }],
        turnComplete: true,
      });
      done.finally(() => session.close());
    })
    .catch(reject);
});
await done;
console.log(`first audio after ${firstAudio} ms`);
console.log('Gemini said:', text.trim());
