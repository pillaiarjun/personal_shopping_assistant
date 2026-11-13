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
import { Behavior, FunctionResponseScheduling, Session as GenAISession } from '@google/genai';
import dotenv from 'dotenv';
import { writeFile } from 'node:fs/promises';
import { appendFileSync, mkdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { newFlow, storeTools } from './store-tools.ts';

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
      // Tools don't block: she keeps talking while the store works, and the result comes in when she's
      // free (WHEN_IDLE). With blocking tools Gemini often went silent after the result.
      toolBehavior: Behavior.NON_BLOCKING,
      toolResponseScheduling: FunctionResponseScheduling.WHEN_IDLE,
      inputAudioTranscription: { languageCodes: ['en-US'], customVocabulary: ['Sasha', 'Fashion Barn'] } as any,
      realtimeInputConfig: {
        automaticActivityDetection: {
          startOfSpeechSensitivity: 'START_SENSITIVITY_LOW' as any,
          endOfSpeechSensitivity: 'END_SENSITIVITY_HIGH' as any,
          // Speech must last 400 ms before it counts as him talking over her, so a cough, a door or
          // background chatter doesn't cut her off mid-sentence (that's what sounded like stuttering).
          prefixPaddingMs: Number(process.env.PREFIX_MS ?? 400),
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

    // --- The call log: everything in order, one JSON line each, in logs/call-<room>.jsonl:
    // both sides of the conversation, every tool with its arguments and result, every page action,
    // and what he clicks, scrolls and opens on the page himself.
    mkdirSync('logs', { recursive: true });
    const callStart = Date.now();
    const callLog = `logs/call-${ctx.room.name}.jsonl`;
    const record = (kind: string, data: Record<string, unknown> = {}) => {
      try { appendFileSync(callLog, JSON.stringify({ t: +((Date.now() - callStart) / 1000).toFixed(1), kind, ...data }) + '\n'); } catch { /* logging never breaks the call */ }
    };
    const short = (v: unknown, n = 700) => { const j = JSON.stringify(v) ?? ''; return j.length > n ? j.slice(0, n) + '…' : j; };
    log(`call log: ${callLog}`);

    // --- Quiet notes: context for Gemini that doesn't make her speak (turnComplete: false).
    // Held while she's talking so they never cut into a sentence.
    const pendingNotes: string[] = [];
    function quietNote(text: string) {
      if (!liveSession) return;
      if (agentState === 'speaking') { pendingNotes.push(text); return; }
      liveSession.sendClientEvent({ type: 'content', value: { turns: [{ role: 'user', parts: [{ text }] }], turnComplete: false } });
    }

    // --- What has already happened (store-tools adds to it too), so she never asks the same thing twice.
    const flow = newFlow();
    const SAID: [string, RegExp][] = [
      ['vibe_question', /event or (an )?occasion|specific event|specific occasion/i],
      ['step_back', /step back|back up a (bit|little)|as far (back )?as you can/i],
      ['budget', /(spend|budget)\b.*\?/i],
      ['build_around', /build around/i],
      ['see_it_question', /see it on you/i],
      ['sizes_question', /(what are you in|your sizes?|what size|waist).*\?/i],
      ['second_outfit', /other (four |three |two )?days|days off|second outfit|another (look|outfit) for/i],
    ];
    function heardHerSay(text: string) {
      for (const [key, re] of SAID) {
        if (!flow.done.has(key) && re.test(text)) {
          flow.done.add(key);
          record('flow', { done: key });
          quietNote(`APP NOTE (not from the shopper): ${flow.note()} Keep moving to the next step.`);
        }
      }
    }

    // --- No dead air. Small beats are fine; a gap of more than about two seconds when it's her turn is not.
    // Her turn: a tool just finished, or he finished talking. If she's still quiet after the gap (and he isn't
    // talking), a note tells her to carry on. It goes straight to Gemini as a short turn of its own.
    let toolsRunning = 0;
    let agentState = 'initializing';
    let owed: { why: string; since: number; gap: number } | null = null;
    let toolSince = 0;
    let filledThisTool = false;
    let lastNudgeAt = 0;
    const owe = (why: string, gap: number) => { owed = { why, since: Date.now(), gap }; };
    function nudge(why: string) {
      if (!liveSession) return;
      lastNudgeAt = Date.now();
      log(`dead air: ${why}`);
      record('nudge', { why });
      liveSession.sendClientEvent({ type: 'content', value: { turns: [{ role: 'user', parts: [{ text: `APP NOTE (not from the shopper): it's been quiet for a couple of seconds. ${why} Carry on talking naturally from exactly where you left off. Don't repeat what you already said, don't greet him again, and don't mention this note.` }] }], turnComplete: true } });
    }
    const watchdog = setInterval(() => {
      if (process.env.WATCHDOG === 'off' || agentState === 'speaking' || userSpeaking || Date.now() - lastNudgeAt < 5000) return;
      if (owed && !toolsRunning && Date.now() - owed.since > owed.gap) { const why = owed.why; owed = null; nudge(why); return; }
      // A slow tool (the outfits, the bag): one quick filler line while it works.
      if (toolsRunning && !filledThisTool && Date.now() - toolSince > 2500) {
        filledThisTool = true;
        nudge('The store is still working on what he asked for. Fill the wait with one quick line or a short question about him, then stop.');
      }
    }, 250);
    ctx.addShutdownCallback(async () => clearInterval(watchdog));

    const hooks = {
      flow,
      start: (name: string, args?: unknown) => {
        toolsRunning++; toolSince = Date.now(); filledThisTool = false; owed = null;
        log(`tool ${name} started`); record('tool', { name, args });
      },
      end: (name: string, result?: unknown) => {
        toolsRunning--;
        log(`tool ${name} done in ${Date.now() - toolSince} ms`);
        record('tool_result', { name, ms: Date.now() - toolSince, result: short(result) });
        owe(`The ${name.replace(/_/g, ' ')} step finished and its result is in: tell him about it and keep the conversation going.`, 2000);
      },
      page: (action: string, args: unknown, result: unknown) => record('page', { action, args: short(args, 300), result: short(result, 300) }),
    };

    // --- What he does on the page himself: logged, and the bigger moves passed to her quietly.
    ctx.room.on(RoomEvent.DataReceived, (payload: Uint8Array, _p?: unknown, _k?: unknown, topic?: string) => {
      if (topic !== 'shopper-activity') return;
      try {
        const a = JSON.parse(new TextDecoder().decode(payload));
        record('shopper', a);
        if (a.kind === 'page' || a.kind === 'click') quietNote(`APP NOTE (not from the shopper's voice): on the page he just ${a.kind === 'page' ? `opened ${a.detail}` : `clicked "${a.detail}" (page ${a.hash || '#/'})`}. Only bring it up if it helps.`);
      } catch { /* ignore */ }
    });

    const agent = new voice.Agent({ instructions: INSTRUCTIONS, tools: storeTools(ctx, log, hooks) });
    const session = new voice.AgentSession({ llm: makeModel() });

    // --- Timing: when you stop talking -> when Sasha starts talking.
    let userStoppedAt = 0;
    session.on(voice.AgentSessionEventTypes.UserStateChanged, (ev) => {
      userSpeaking = ev.newState === 'speaking';
      if (userSpeaking && agentState === 'speaking') record('interrupted', {});
      if (ev.oldState === 'speaking') { flow.userTurns++; userStoppedAt = Date.now(); owe('He finished talking and is waiting for your answer.', 2500); }
    });
    session.on(voice.AgentSessionEventTypes.AgentStateChanged, (ev) => {
      agentState = ev.newState;
      record('sasha_state', { state: ev.newState });
      if (ev.newState === 'speaking') owed = null;
      else if (pendingNotes.length) for (const n of pendingNotes.splice(0)) quietNote(n);
      if (ev.newState === 'speaking' && userStoppedAt) {
        log(`reply started ${Date.now() - userStoppedAt} ms after you stopped`);
        userStoppedAt = 0;
      }
    });
    // --- Transcript: both sides of the conversation, so stalls can be traced.
    session.on(voice.AgentSessionEventTypes.ConversationItemAdded, (ev) => {
      const item = ev.item as any;
      const text = item.textContent ?? '';
      if (text && (item.role === 'user' || item.role === 'assistant')) {
        log(`${item.role === 'user' ? 'YOU' : 'SASHA'}: ${text}`);
        record(item.role === 'user' ? 'you' : 'sasha', { text, interrupted: item.interrupted || undefined });
        if (item.role === 'assistant') { heardHerSay(text); flow.said.push({ text, turn: flow.userTurns }); }
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
      record('camera', { status: next });
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
