// Records one Sasha line in each Gemini Live voice -> casting/voices/<Voice>.wav
import { GoogleGenAI, Modality } from '@google/genai';
import dotenv from 'dotenv';
import { writeFile } from 'node:fs/promises';
dotenv.config({ path: '.env.local', quiet: true });
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
const VOICES = ['Orus','Enceladus','Iapetus','Algieba','Erinome','Algenib','Rasalgethi','Achernar','Schedar','Gacrux','Achird','Sadaltager'];
const LINE = "Hi, I'm Sasha, your stylist at The Fashion Barn. Ooh, I love that jacket. What are we dressing you up for today?";
function wav(pcm: Buffer, rate = 24000) {
  const h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + pcm.length, 4); h.write('WAVE', 8); h.write('fmt ', 12);
  h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22); h.writeUInt32LE(rate, 24);
  h.writeUInt32LE(rate * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34); h.write('data', 36); h.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([h, pcm]);
}
async function record(voice: string) {
  const chunks: Buffer[] = [];
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), 40000);
    ai.live.connect({
      model: 'gemini-3.8-live',
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
        systemInstruction: 'You are a voice actor. Read the user\'s line exactly as written, warmly and naturally, like a friendly personal stylist. Say nothing else.',
      },
      callbacks: {
        onmessage: (m: any) => {
          for (const p of m.serverContent?.modelTurn?.parts ?? []) if (p.inlineData?.data) chunks.push(Buffer.from(p.inlineData.data, 'base64'));
          if (m.serverContent?.turnComplete) { clearTimeout(timer); resolve(); }
        },
        onerror: reject,
        onclose: (e: any) => { clearTimeout(timer); chunks.length ? resolve() : reject(new Error('closed: ' + e?.reason)); },
      },
    }).then((s) => {
      s.sendClientContent({ turns: [{ role: 'user', parts: [{ text: LINE }] }], turnComplete: true });
      setTimeout(() => s.close(), 39000);
    }).catch(reject);
  });
  await writeFile(`casting/voices/${voice}.wav`, wav(Buffer.concat(chunks)));
  return Buffer.concat(chunks).length / 48000;
}
const results: string[] = [];
for (let i = 0; i < VOICES.length; i += 1) {
  await Promise.all(VOICES.slice(i, i + 1).map(async (v) => {
    try { results.push(`${v}: ${(await record(v)).toFixed(1)}s`); } catch (e) { results.push(`${v}: FAILED ${(e as Error).message}`); }
  }));
}
console.log(results.join('\n'));
process.exit(0);
