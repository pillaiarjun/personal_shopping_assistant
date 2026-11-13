// Sasha V2 prototype: Gemini Live (voice + brain + eyes) with an optional Tavus face.
//
// Run:   node agent.ts dev        (then talk to it in the LiveKit Agent Console)
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
import { fileURLToPath } from 'node:url';

dotenv.config({ path: '.env.local' });

const AVATAR = process.env.AVATAR ?? 'none';
const GEMINI = process.env.GEMINI ?? 'inference';
const VISION = (process.env.VISION ?? 'on') !== 'off';
const VOICE = process.env.GEMINI_VOICE ?? 'Aoede';
const FRAME_WIDTH = Number(process.env.FRAME_WIDTH ?? 768);

const INSTRUCTIONS = `You are Sasha, a warm, witty personal stylist at The Fashion Barn.
Keep replies short and natural, like a real conversation: one or two sentences, then a question.
Speak at a relaxed, unhurried pace, calm and friendly, never rushed.
No lists, no emojis, no stage directions.
You can see the shopper live through their camera. Describe only what is clearly visible right now.
If you can't see them, or the picture is dark or blurry, say so and ask them to step into the light. Never guess at age, weight or body type.`;

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

// Keeps the newest camera frame from the shopper.
function watchCamera(ctx: JobContext) {
  let latest: VideoFrame | null = null;
  let stream: VideoStream | null = null;

  const attach = (track: Track) => {
    if (track.kind !== TrackKind.KIND_VIDEO) return;
    stream?.cancel().catch(() => {});
    const s = new VideoStream(track);
    stream = s;
    (async () => {
      try {
        for await (const ev of s) latest = ev.frame;
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

  return { take: () => latest };
}

const t0 = Date.now();
const log = (msg: string, extra?: unknown) =>
  console.log(`[sasha +${((Date.now() - t0) / 1000).toFixed(1)}s] ${msg}`, extra ?? '');

export default defineAgent({
  entry: async (ctx: JobContext) => {
    await ctx.connect();
    log(`room joined  avatar=${AVATAR} gemini=${GEMINI} vision=${VISION}`);

    const agent = new voice.Agent({ instructions: INSTRUCTIONS });
    const session = new voice.AgentSession({ llm: makeModel() });

    // --- Timing: when you stop talking -> when Sasha starts talking.
    let userStoppedAt = 0;
    session.on(voice.AgentSessionEventTypes.UserStateChanged, (ev) => {
      userSpeaking = ev.newState === 'speaking';
      if (ev.oldState === 'speaking') userStoppedAt = Date.now();
    });
    session.on(voice.AgentSessionEventTypes.AgentStateChanged, (ev) => {
      if (ev.newState === 'speaking' && userStoppedAt) {
        log(`reply started ${Date.now() - userStoppedAt} ms after you stopped`);
        userStoppedAt = 0;
      }
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
    async function streamFrame() {
      if (!camera || sending || !liveSession) return;
      if (!userSpeaking && Date.now() - lastSentAt < 3000) return;
      const frame = camera.take();
      if (!frame) return;
      sending = true;
      try {
        const rgba = frame.convert(VideoBufferType.RGBA);
        const jpeg = await sharp(Buffer.from(rgba.data), { raw: { width: rgba.width, height: rgba.height, channels: 4 } })
          .removeAlpha()
          .resize({ width: FRAME_WIDTH, withoutEnlargement: true })
          .jpeg({ quality: 80 })
          .toBuffer();
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
    session.generateReply({ instructions: 'Greet the shopper in one short sentence and ask what brings them in.' });
  },
});

cli.runApp(new ServerOptions({ agent: fileURLToPath(import.meta.url) }));
