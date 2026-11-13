// Checks Sasha's personality on Gemini Live: greeting, first read, a bad idea, and a personal question.
// Run: node tests/personality-test.ts   (uses last-frame.jpg as the camera picture)
import { GoogleGenAI, Modality } from '@google/genai';
import dotenv from 'dotenv';
import { readFile } from 'node:fs/promises';
dotenv.config({ path: '.env.local', quiet: true });

// Same prompt the agent uses (agent.ts adds the no-store note and greeting the same way).
const agentSrc = await readFile(new URL('../agent.ts', import.meta.url), 'utf8');
const note = agentSrc.match(/const NO_STORE_NOTE = `([\s\S]*?)`;/)![1];
const greeting = agentSrc.match(/const GREETING = "([^"]+)"/)![1];
const prompt = (await readFile(new URL('../sasha-prompt.md', import.meta.url), 'utf8')) + note;
const ON = 'CAMERA STATUS (from the app, not the shopper): the camera is ON. You are getting live video of the shopper again. Only describe what is clearly visible in the newest picture.';
const img = (await readFile(new URL('../last-frame.jpg', import.meta.url))).toString('base64');

const TURNS = [
  `Say this greeting in your own voice, with energy, keeping every word: "${greeting}"`,
  "I'm Mike.",
  "Casual streetwear mostly. My cousin's wedding is in two weeks, I was thinking cargo shorts and a nice tee.",
  'Ha, okay. Before we get into it, what are you up to this weekend?',
  'Fine, fine. Budget is about five hundred bucks.',
];

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
let current = '';
let done: (() => void) | null = null;
const session = await ai.live.connect({
  model: 'gemini-3.8-live',
  config: { responseModalities: [Modality.AUDIO], outputAudioTranscription: {}, systemInstruction: prompt, speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Aoede' } } } },
  callbacks: {
    onmessage: (m: any) => {
      const sc = m.serverContent;
      if (sc?.outputTranscription?.text) current += sc.outputTranscription.text;
      if (sc?.turnComplete) done?.();
    },
    onerror: (e: any) => console.error(e),
  },
});
session.sendClientContent({ turns: [{ role: 'user', parts: [{ text: ON }] }], turnComplete: false });
session.sendRealtimeInput({ video: { mimeType: 'image/jpeg', data: img } });
await new Promise((r) => setTimeout(r, 1500));

for (const [i, text] of TURNS.entries()) {
  current = '';
  const finished = new Promise<void>((r) => { done = r; setTimeout(r, 30000); });
  session.sendClientContent({ turns: [{ role: 'user', parts: [{ text }] }], turnComplete: true });
  await finished;
  if (i > 0) console.log(`YOU:   ${text}`);
  console.log(`SASHA: ${current.trim()}\n`);
}
session.close();
process.exit(0);
