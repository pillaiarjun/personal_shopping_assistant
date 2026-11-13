// Checks the opening of a call on Gemini Live, with the real store tools (the page part is skipped):
// name -> first read + score -> new arrivals on screen -> "casual vibe or an event?"
// Run: node tests/flow-test.ts   (uses last-frame.jpg as the camera picture)
import { GoogleGenAI, Modality } from '@google/genai';
import dotenv from 'dotenv';
import { readFile } from 'node:fs/promises';
import { z } from 'zod';
dotenv.config({ path: '.env.local', quiet: true });
const { storeTools } = await import('../store-tools.ts');

const agentSrc = await readFile(new URL('../agent.ts', import.meta.url), 'utf8');
const greeting = agentSrc.match(/const GREETING = "([^"]+)"/)![1];
const prompt = await readFile(new URL('../sasha-prompt.md', import.meta.url), 'utf8');
const ON = 'CAMERA STATUS (from the app, not the shopper): the camera is ON. You are getting live video of the shopper again. Only describe what is clearly visible in the newest picture.';
const img = (await readFile(new URL('../last-frame.jpg', import.meta.url))).toString('base64');

const TURNS = process.argv.slice(2).length ? process.argv.slice(2) : [
  `Say this greeting in your own voice, with energy, keeping every word: "${greeting}"`,
  "I'm Mike.",
  "Yeah, sticking with casual today.",
];

const tools: any = storeTools({ room: { remoteParticipants: new Map(), localParticipant: null } } as any, (m: string) => console.log(`   [${m}]`));
const declarations = Object.entries(tools).map(([name, t]: [string, any]) => {
  const { $schema, ...parameters } = z.toJSONSchema(t.parameters) as any;
  return { name, description: t.description, parametersJsonSchema: parameters };
});

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
let current = '';
let done: (() => void) | null = null;
const session = await ai.live.connect({
  model: 'gemini-3.8-live',
  config: {
    responseModalities: [Modality.AUDIO], outputAudioTranscription: {}, systemInstruction: prompt,
    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Aoede' } } },
    tools: [{ functionDeclarations: declarations }],
  },
  callbacks: {
    onmessage: async (m: any) => {
      const sc = m.serverContent;
      if (sc?.outputTranscription?.text) current += sc.outputTranscription.text;
      if (m.toolCall) {
        const responses = [];
        for (const fc of m.toolCall.functionCalls) {
          console.log(`   TOOL ${fc.name} ${JSON.stringify(fc.args)}`);
          const out = await tools[fc.name].execute(fc.args, { ctx: {}, toolCallId: fc.id });
          responses.push({ id: fc.id, name: fc.name, response: { output: out } });
        }
        session.sendToolResponse({ functionResponses: responses });
      }
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
  // A tool call can end a turn early; give her a moment to finish speaking about the results.
  await new Promise((r) => setTimeout(r, 4000));
  if (i > 0) console.log(`YOU:   ${text}`);
  console.log(`SASHA: ${current.trim()}\n`);
}
session.close();
process.exit(0);
