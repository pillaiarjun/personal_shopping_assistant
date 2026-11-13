// Checks Sasha won't claim to see the shopper when the camera is off.
// Scenario A: no picture ever, camera OFF.  Scenario B: saw a picture, then camera went OFF.
// Run: node tests/camera-off-test.ts
import { GoogleGenAI, Modality } from '@google/genai';
import dotenv from 'dotenv';
import { readFile } from 'node:fs/promises';
dotenv.config({ path: '.env.local', quiet: true });

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
const prompt = await readFile(new URL('../sasha-prompt.md', import.meta.url), 'utf8');
const OFF = 'CAMERA STATUS (from the app, not the shopper): the camera is OFF. No video is coming through, so you cannot see the shopper right now, and any earlier pictures are out of date. Do not describe their clothes or say you can see them. If it comes up, tell them their camera looks like it is off and ask them to turn it on.';
const ON = 'CAMERA STATUS (from the app, not the shopper): the camera is ON. You are getting live video of the shopper again. Only describe what is clearly visible in the newest picture.';
const QUESTION = "I'm Mike. So, what do you think of what I'm wearing right now?";

async function run(name: string, image: string | null) {
  let text = '';
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), 30000);
    ai.live
      .connect({
        model: 'gemini-3.8-live',
        config: { responseModalities: [Modality.AUDIO], outputAudioTranscription: {}, systemInstruction: prompt },
        callbacks: {
          onmessage: (m: any) => {
            const sc = m.serverContent;
            if (sc?.outputTranscription?.text) text += sc.outputTranscription.text;
            if (sc?.turnComplete) { clearTimeout(timer); resolve(); }
          },
          onerror: reject,
        },
      })
      .then(async (s) => {
        const note = (t: string) => s.sendClientContent({ turns: [{ role: 'user', parts: [{ text: t }] }], turnComplete: false });
        if (image) {
          note(ON);
          s.sendRealtimeInput({ video: { mimeType: 'image/jpeg', data: image } });
          await new Promise((r) => setTimeout(r, 1500));
        }
        note(OFF);
        s.sendClientContent({ turns: [{ role: 'user', parts: [{ text: QUESTION }] }], turnComplete: true });
        const close = () => s.close();
        setTimeout(close, 31000);
      })
      .catch(reject);
  });
  console.log(`${name}:\n  ${text.trim()}\n`);
}

const img = (await readFile(new URL('../last-frame.jpg', import.meta.url))).toString('base64');
await run('A. camera never on', null);
await run('B. saw a picture, then camera turned off', img);
process.exit(0);
