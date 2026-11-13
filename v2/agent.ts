// Sasha V2 prototype: Gemini Live (voice + brain + eyes) with an optional Tavus face.
//
// Run:   node agent.ts dev   and   node server.ts, then open the store (site/) and press Talk to Sasha.
//
// Switches in .env.local:
//   AVATAR=tavus | none     (default none: voice only)
//   GEMINI=inference | google
//        inference = Gemini through LiveKit Cloud, needs only LIVEKIT_* keys (default)
//        google    = your own GOOGLE_API_KEY
//   VISION=on | off         (default on: streams the camera to Gemini as live video; google mode only)

import { type JobContext, ServerOptions, cli, defineAgent, inference, voice } from '@livekit/agents';
import * as google from '@livekit/agents-plugin-google';
import * as tavus from '@livekit/agents-plugin-tavus';
import { RoomEvent, TrackKind, VideoBufferType, VideoStream, type Track, type VideoFrame } from '@livekit/rtc-node';
import sharp from 'sharp';
import { Session as GenAISession } from '@google/genai';
import dotenv from 'dotenv';
import { writeFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { storeTools } from './store-tools.ts';

dotenv.config({ path: '.env.local' });

const AVATAR = process.env.AVATAR ?? 'none';
const GEMINI = process.env.GEMINI ?? 'inference';
const VISION = (process.env.VISION ?? 'on') !== 'off';
const VOICE = process.env.GEMINI_VOICE ?? 'Aoede';
const FRAME_WIDTH = Number(process.env.FRAME_WIDTH ?? 768);

// The full Sasha prompt (sasha-prompt.md); the store tools are in store-tools.ts.
const INSTRUCTIONS = readFileSync(new URL('./sasha-prompt.md', import.meta.url), 'utf8');
const GREETING = "Hey, I'm Sasha, your AI stylist here at Fashion Barn. Here's the deal: I get to know you, check out what you've got on, then I pull looks from our racks and show you how they look on you. What's your name?";

// Gemini Live takes camera frames on its `video` input. The plugin sends them as `media`,
// which gemini-3.8-live ignores (tested), so re-label image chunks as video.
const origSend = GenAISession.prototype.sendRealtimeInput;
GenAISession.prototype.sendRealtimeInput = function (params: any) {
  if (params?.media?.mimeType?.startsWith('image/')) params = { video: params.media };
  return origSend.call(this, params);
};

// Remembers the live Gemini session so we can stream video frames into it.
let liveSession: any = null;
class LiveGemini extends google.beta.realtime.RealtimeModel {
  override session() {
    const s = super.session();
    liveSession = s;
    return s;
  }
}

function makeModel() {
  if (GEMINI === 'google') {
    // Turn-taking: hard to trigger (so Sasha's own voice leaking from speakers doesn't
    // "interrupt" her), quick to decide you've finished (half a second of silence).
    return new LiveGemini({
      model: 'gemini-3.8-live',
      voice: VOICE,
      // English only: on auto-detect, a casual answer was once heard as Swedish and she said goodbye.
      language: 'en-US',
      inputAudioTranscription: { languageCodes: ['en-US'], customVocabulary: ['Sasha', 'Fashion Barn'] } as any,
      realtimeInputConfig: {
        automaticActivityDetection: {
          startOfSpeechSensitivity: 'START_SENSITIVITY_LOW' as any,
          endOfSpeechSensitivity: 'END_SENSITIVITY_HIGH' as any,
          prefixPaddingMs: 200,
          silenceDurationMs: Number(process.env.SILENCE_MS ?? 500),
        },
      },
    });
  }
  return new inference.RealtimeModel({ model: 'google/gemini-3.8-live', voice: VOICE });
}

// Keeps the newest camera frame from the shopper. take() returns nothing once frames
// stop arriving (camera off or muted), so Sasha never keeps "seeing" a frozen picture.
const CAMERA_STALE_MS = 2000;
function watchCamera(ctx: JobContext) {
  let latest: VideoFrame | null = null;
  let latestAt = 0;
  let stream: VideoStream | null = null;

  const attach = (track: Track) => {
    if (track.kind !== TrackKind.KIND_VIDEO) return;
    stream?.cancel().catch(() => {});
    const s = new VideoStream(track);
    stream = s;
    (async () => {
      try {
        for await (const ev of s) {
          latest = ev.frame;
          latestAt = Date.now();
        }
      } catch {
        /* stream closed */
      }
    })();
    log('camera track attached');
  };

  for (const p of ctx.room.remoteParticipants.values()) {
    for (const pub of p.trackPublications.values()) if (pub.track) attach(pub.track);
  }
  ctx.room.on(RoomEvent.TrackSubscribed, (track, _pub, participant) => {
    // Ignore the avatar's own video.
    if (participant.identity.startsWith('tavus')) return;
    attach(track);
  });

  return { take: () => (Date.now() - latestAt < CAMERA_STALE_MS ? latest : null) };
}

const t0 = Date.now();
const log = (msg: string, extra?: unknown) =>
  console.log(`[sasha +${((Date.now() - t0) / 1000).toFixed(1)}s] ${msg}`, extra ?? '');

export default defineAgent({
  entry: async (ctx: JobContext) => {
    await ctx.connect();
    log(`room joined  avatar=${AVATAR} gemini=${GEMINI} vision=${VISION}`);

    // While a tool runs, Gemini waits for its result: extra input then (our camera frames) can make it
    // drop the reply, so frames pause. If she still says nothing after a tool, nudge her to carry on.
    let toolsRunning = 0;
    let agentState = 'initializing';
    let nudge: NodeJS.Timeout | undefined;
    const hooks = {
      start: (name: string) => { toolsRunning++; clearTimeout(nudge); log(`tool ${name} started`); },
      end: (name: string) => {
        toolsRunning--;
        clearTimeout(nudge);
        nudge = setTimeout(() => {
          if (toolsRunning || agentState === 'speaking' || userSpeaking) return;
          log(`silent after ${name}: nudging her to carry on`);
          session.generateReply({ instructions: 'Carry on from where you were: talk him through what you just put on his screen, then keep the conversation going.' });
        }, 2500);
      },
    };
    const agent = new voice.Agent({ instructions: INSTRUCTIONS, tools: storeTools(ctx, log, hooks) });
    const session = new voice.AgentSession({ llm: makeModel() });

    // --- Timing: when you stop talking -> when Sasha starts talking.
    let userStoppedAt = 0;
    session.on(voice.AgentSessionEventTypes.UserStateChanged, (ev) => {
      userSpeaking = ev.newState === 'speaking';
      if (ev.oldState === 'speaking') userStoppedAt = Date.now();
    });
    session.on(voice.AgentSessionEventTypes.AgentStateChanged, (ev) => {
      agentState = ev.newState;
      if (ev.newState === 'speaking') clearTimeout(nudge);
      if (ev.newState === 'speaking' && userStoppedAt) {
        log(`reply started ${Date.now() - userStoppedAt} ms after you stopped`);
        userStoppedAt = 0;
      }
    });
    // --- Transcript: both sides of the conversation, so stalls can be traced.
    session.on(voice.AgentSessionEventTypes.ConversationItemAdded, (ev) => {
      const item = ev.item as any;
      const text = item.textContent ?? '';
      if (text && (item.role === 'user' || item.role === 'assistant')) log(`${item.role === 'user' ? 'YOU' : 'SASHA'}: ${text}`);
    });
    session.on(voice.AgentSessionEventTypes.MetricsCollected, (ev) => {
      const m = ev.metrics as any;
      if (m.type === 'avatar_metrics' || m.type === 'realtime_model_metrics') {
        const { type, ttftMs, ttft, playbackLatency, avatarJoinedAt, startedAt } = m;
        log(type, { ttftMs: ttftMs ?? ttft, playbackLatency, joinMs: avatarJoinedAt && startedAt ? avatarJoinedAt - startedAt : undefined });
      }
    });

    // --- Vision: a continuous LIVE VIDEO stream into Gemini, alongside the audio, the way
    // Gemini Live is designed to work (not chat turns). About 1 frame/s while you talk and
    // one every 3 s otherwise, the same rate LiveKit's Python video_input uses.
    // LiveKit's Node plugin doesn't wire this up, so we send frames on the Gemini session
    // ourselves (see LiveGemini and the sendRealtimeInput patch at the top).
    const camera = VISION && GEMINI === 'google' ? watchCamera(ctx) : null;
    let userSpeaking = false;
    let sending = false;
    let framesSent = 0;
    let lastSentAt = 0;
    let lastSnapAt = 0;
    // --- Camera status: Gemini can't tell "no pictures" from "nothing to see", so we tell it
    // whenever the camera goes off, dark or back on. It's added to her context quietly
    // (turnComplete: false), so it doesn't make her speak.
    type CamStatus = 'on' | 'off' | 'dark';
    let camStatus: CamStatus | null = null;
    const CAMERA_NOTES: Record<CamStatus, string> = {
      off: 'CAMERA STATUS (from the app, not the shopper): the camera is OFF. No video is coming through, so you cannot see the shopper right now, and any earlier pictures are out of date. Do not describe their clothes or say you can see them. If it comes up, tell them their camera looks like it is off and ask them to turn it on.',
      dark: 'CAMERA STATUS (from the app, not the shopper): the camera is on, but the picture is black or too dark to see anything. Do not describe their clothes or say you can see them. If it comes up, tell them you can\'t see anything and ask them to check the camera or step into the light.',
      on: 'CAMERA STATUS (from the app, not the shopper): the camera is ON. You are getting live video of the shopper again. Only describe what is clearly visible in the newest picture.',
    };
    function setCamStatus(next: CamStatus) {
      if (next === camStatus || !liveSession) return;
      camStatus = next;
      liveSession.sendClientEvent({
        type: 'content',
        value: { turns: [{ role: 'user', parts: [{ text: CAMERA_NOTES[next] }] }], turnComplete: false },
      });
      log(`camera status -> ${next}`);
    }

    async function streamFrame() {
      if (sending || !liveSession || toolsRunning) return;
      const frame = camera?.take() ?? null;
      if (!frame) return setCamStatus('off');
      if (camStatus === 'on' && !userSpeaking && Date.now() - lastSentAt < 3000) return;
      sending = true;
      try {
        const rgba = frame.convert(VideoBufferType.RGBA);
        const jpeg = await sharp(Buffer.from(rgba.data), { raw: { width: rgba.width, height: rgba.height, channels: 4 } })
          .removeAlpha()
          .resize({ width: FRAME_WIDTH, withoutEnlargement: true })
          .jpeg({ quality: 80 })
          .toBuffer();
        // A covered lens or blank feed still sends frames, just black ones.
        const { channels } = await sharp(jpeg).stats();
        const brightness = channels.reduce((sum, c) => sum + c.mean, 0) / channels.length;
        setCamStatus(brightness < 15 ? 'dark' : 'on');
        // Full-size photo for the try-on test (tests/try-on.ts), refreshed every 10 s.
        if (camStatus === 'on' && Date.now() - lastSnapAt > 10000) {
          lastSnapAt = Date.now();
          await sharp(Buffer.from(rgba.data), { raw: { width: rgba.width, height: rgba.height, channels: 4 } })
            .removeAlpha().jpeg({ quality: 90 }).toFile('snapshot.jpg');
        }
        liveSession.sendClientEvent({
          type: 'realtime_input',
          value: { mediaChunks: [{ mimeType: 'image/jpeg', data: jpeg.toString('base64') }] },
        });
        lastSentAt = Date.now();
        framesSent++;
        if (framesSent === 1 || framesSent % 30 === 0) {
          log(`video frames streamed: ${framesSent} (${frame.width}x${frame.height})`);
          await writeFile('last-frame.jpg', jpeg); // what Sasha sees, for checking
        }
      } catch (e) {
        log('could not stream camera frame', (e as Error).message);
      } finally {
        sending = false;
      }
    }
    const frameTimer = setInterval(streamFrame, 1000);
    ctx.addShutdownCallback(async () => clearInterval(frameTimer));

    // --- Face.
    if (AVATAR === 'tavus') {
      const avatar = new tavus.AvatarSession({
        faceId: process.env.TAVUS_FACE_ID || undefined,
        palId: process.env.TAVUS_PAL_ID || undefined,
      });
      log('starting Tavus avatar');
      await avatar.start(session, ctx.room);
      log('Tavus avatar started');
    }

    await session.start({ agent, room: ctx.room });

    // Diagnostic: who is publishing audio/video? With a face on, only the avatar should
    // publish Sasha's voice; if the agent also publishes audio you hear it ahead of the lips.
    const roomReport = () => {
      const lines = [`agent(${ctx.room.localParticipant?.identity}): ` +
        [...(ctx.room.localParticipant?.trackPublications.values() ?? [])].map((p: any) => `${p.kind === 1 ? 'audio' : p.kind === 2 ? 'video' : p.kind}:${p.name ?? ''}`).join(', ')];
      for (const rp of ctx.room.remoteParticipants.values())
        lines.push(`${rp.identity}: ` + [...rp.trackPublications.values()].map((p: any) => `${p.kind === 1 ? 'audio' : p.kind === 2 ? 'video' : p.kind}:${p.name ?? ''}`).join(', '));
      log('room tracks\n   ' + lines.join('\n   '));
    };
    setTimeout(roomReport, 12000);
    session.generateReply({ instructions: `Say this greeting in your own voice, with energy, keeping every word: "${GREETING}"` });
  },
});

cli.runApp(new ServerOptions({ agent: fileURLToPath(import.meta.url) }));
