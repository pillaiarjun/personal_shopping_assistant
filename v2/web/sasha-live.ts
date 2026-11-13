// Sasha V2 call page: the store's "Talk to Sasha" call over LiveKit, with Gemini Sasha (v2/agent.ts).
// Built to v2/web/dist/sasha-live.js (npm run build:web) and loaded by site/index.html after barn.js.
//
// - Opens full screen with Sasha and the shopper's own camera preview, then shrinks into the sidebar's video spot (corner on small screens)
//   the first time she puts something on the page.
// - The agent drives the store with RPC calls on method "barn" (see the handlers below).
// - The try-on reveal shows the agent's picture of the shopper wearing the look.
//
// URL override: ?v2_server=http://localhost:8790 (token + try-on image server, v2/server.ts)
import { Room, RoomEvent, Track, createLocalTracks, type LocalVideoTrack, type RemoteTrack, type RpcInvocationData } from 'livekit-client';

declare global {
  interface Window { Barn?: any; SashaLive?: unknown }
}

const params = new URLSearchParams(location.search);
const SERVER = (params.get('v2_server') ?? 'http://localhost:8790').replace(/\/+$/, '');
const barn = () => window.Barn;

const css = `
.sl-launch{position:fixed;right:24px;bottom:24px;z-index:450;display:flex;align-items:center;gap:10px;padding:10px 18px 10px 10px;border:0;border-radius:999px;background:#111;color:#fff;font:500 15px/1 "Hanken Grotesk",system-ui,sans-serif;cursor:pointer;box-shadow:0 8px 30px rgba(0,0,0,.25)}
.sl-launch img{width:40px;height:40px;border-radius:50%;object-fit:cover}
body.sl-nobar .stylist{display:none!important}
body.sl-nobar{padding-right:0!important}
.sl-docked{border-radius:0}
.sl-docked .sl-center{padding:0 12px 64px;gap:6px}
.sl-docked .sl-face{width:96px}
.sl-docked .sl-name{font-size:18px}
.sl-docked .sl-caption{display:none}
.sl-docked .sl-self{top:10px;right:10px;width:96px}
.sl-docked .sl-bar{bottom:12px;gap:8px}
.sl-docked .sl-bar button{padding:8px 12px;font-size:12px}
.sl-stage{position:fixed;z-index:500;background:#0e0e10;color:#fff;font-family:"Hanken Grotesk",system-ui,sans-serif;transition:all .6s cubic-bezier(.2,.8,.2,1);overflow:hidden}
.sl-full{inset:0;border-radius:0}
.sl-corner{right:20px;bottom:20px;width:300px;height:330px;border-radius:20px;box-shadow:0 16px 50px rgba(0,0,0,.35)}
.sl-center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;padding:0 16px 120px}
.sl-corner .sl-center{padding:0 12px 84px;gap:8px}
.sl-face{position:relative;width:min(38vh,320px);aspect-ratio:1;border-radius:50%;transition:all .6s cubic-bezier(.2,.8,.2,1)}
.sl-corner .sl-face{width:120px}
.sl-face img{width:100%;height:100%;border-radius:50%;object-fit:cover;position:relative;z-index:1}
.sl-face::before{content:"";position:absolute;inset:-10px;border-radius:50%;background:radial-gradient(circle,rgba(255,196,140,.55),rgba(255,120,90,0) 70%);opacity:0;transform:scale(.9);transition:opacity .25s,transform .25s}
.sl-speaking .sl-face::before{opacity:1;transform:scale(1.12);animation:sl-pulse 1.1s ease-in-out infinite}
@keyframes sl-pulse{50%{transform:scale(1.2)}}
.sl-name{font:400 34px/1.1 Sentient,Georgia,serif;letter-spacing:-.01em}
.sl-corner .sl-name{font-size:20px}
.sl-status{font-size:14px;opacity:.65;min-height:1.2em}
.sl-caption{max-width:min(720px,92vw);text-align:center;font-size:20px;line-height:1.4;min-height:2.8em;opacity:.92}
.sl-corner .sl-caption{display:none}
.sl-self{position:absolute;top:20px;right:20px;width:220px;aspect-ratio:16/9;border-radius:14px;overflow:hidden;background:#222;box-shadow:0 6px 20px rgba(0,0,0,.4);transition:all .6s cubic-bezier(.2,.8,.2,1)}
.sl-corner .sl-self{top:12px;right:12px;width:92px}
.sl-self video{width:100%;height:100%;object-fit:cover;transform:scaleX(-1)}
.sl-self span{position:absolute;left:8px;bottom:6px;font-size:11px;background:rgba(0,0,0,.5);padding:2px 6px;border-radius:6px}
.sl-bar{position:absolute;left:0;right:0;bottom:28px;display:flex;justify-content:center;gap:12px}
.sl-corner .sl-bar{bottom:14px;gap:8px}
.sl-bar button{border:0;border-radius:999px;padding:12px 20px;font:500 14px/1 "Hanken Grotesk",system-ui,sans-serif;cursor:pointer;background:#2a2a2e;color:#fff}
.sl-corner .sl-bar button{padding:9px 12px;font-size:12px}
.sl-bar .sl-end{background:#d6453d}
.sl-bar .sl-off{background:#fff;color:#111}
.sl-reveal{position:fixed;inset:0;z-index:600;display:flex;align-items:center;justify-content:center;background:rgba(10,10,12,.72);backdrop-filter:blur(6px);opacity:0;pointer-events:none;transition:opacity .4s}
.sl-reveal.sl-on{opacity:1;pointer-events:auto}
.sl-card{position:relative;background:#fff;color:#111;border-radius:22px;padding:18px;max-width:min(520px,92vw);box-shadow:0 30px 80px rgba(0,0,0,.4);transform:scale(.94);transition:transform .5s cubic-bezier(.2,.8,.2,1)}
.sl-on .sl-card{transform:none}
.sl-card img{display:block;width:100%;max-height:72vh;object-fit:contain;border-radius:14px;background:#f4f4f4}
.sl-card h3{margin:14px 4px 2px;font:400 26px/1.1 Sentient,Georgia,serif}
.sl-card p{margin:0 4px;font-size:13px;opacity:.6}
.sl-card button{position:absolute;top:26px;right:26px;border:0;border-radius:999px;padding:8px 14px;background:rgba(0,0,0,.6);color:#fff;cursor:pointer}
.sl-loading{width:min(420px,80vw);aspect-ratio:3/4;border-radius:14px;background:linear-gradient(100deg,#eee 30%,#f8f8f8 50%,#eee 70%);background-size:300% 100%;animation:sl-shine 1.4s linear infinite}
@keyframes sl-shine{to{background-position:-150% 0}}
@media (max-width:640px){.sl-self{width:120px}.sl-corner{width:220px;height:280px}.sl-caption{font-size:17px}}
`;

function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls = '', html = ''): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html) e.innerHTML = html;
  return e;
}

document.head.append(el('style', '', css));
const sashaImg = new URL('./sasha-olivia.jpg', import.meta.url).href; // Olivia, the cast face (web/public/)

// ---- launch button ----
const launch = el('button', 'sl-launch', `<img src="${sashaImg}" alt=""><span>Talk to Sasha</span>`);
launch.type = 'button';
document.body.append(launch);
// The store's "Your stylist" sidebar stays hidden until Sasha shrinks. Then, on wide screens, the
// sidebar comes back and she docks into its video spot; on small screens she sits in the corner.
document.body.classList.add('sl-nobar');
document.getElementById('stylist-toggle')?.setAttribute('hidden', '');
const wide = matchMedia('(min-width: 75rem)'); // the store's own sidebar breakpoint (site/stylist.css)
const slot = document.getElementById('avatar-slot');

let room: Room | null = null;
let stage: HTMLElement | null = null;
let shrunk = false;

function place() {
  if (!stage || !shrunk) return;
  const docked = wide.matches && !!slot;
  document.body.classList.toggle('sl-nobar', !docked);
  stage.classList.toggle('sl-docked', docked);
  stage.classList.toggle('sl-corner', !docked);
  if (!docked) return stage.removeAttribute('style');
  const r = slot!.getBoundingClientRect();
  Object.assign(stage.style, { top: `${r.top}px`, left: `${r.left}px`, width: `${r.width}px`, height: `${Math.max(r.height, 240)}px` });
}
addEventListener('resize', place);
wide.addEventListener('change', place);

function shrink() {
  if (!stage || shrunk) return;
  shrunk = true;
  stage.classList.remove('sl-full');
  document.body.classList.remove('sl-nobar');
  requestAnimationFrame(place); // after the sidebar is back, so its slot can be measured
}

function setStatus(text: string) {
  stage?.querySelector('.sl-status')?.replaceChildren(text);
}

// ---- try-on reveal ----
const reveal = el('div', 'sl-reveal', '<div class="sl-card"></div>');
document.body.append(reveal);
const card = reveal.querySelector('.sl-card') as HTMLElement;
function showReveal(content: { url?: string; title?: string; loading?: boolean }) {
  card.innerHTML = content.loading
    ? '<div class="sl-loading"></div><h3>Getting you dressed…</h3><p>One second.</p>'
    : `<img src="${content.url}" alt="You wearing ${content.title ?? 'the look'}"><h3>${content.title ?? 'Your look'}</h3><p>A preview made by AI from your camera. Fit and color may vary.</p><button type="button">Close</button>`;
  card.querySelector('button')?.addEventListener('click', hideReveal);
  reveal.classList.add('sl-on');
}
function hideReveal() { reveal.classList.remove('sl-on'); }
reveal.addEventListener('click', (e) => { if (e.target === reveal) hideReveal(); });

// ---- what the agent can do on the page (RPC method "barn") ----
type Action = { action: string; [k: string]: any };
const actions: Record<string, (a: Action) => unknown> = {
  show_products: (a) => { shrink(); hideReveal(); return barn()?.showIds(a.ids, a.heading); },
  open_product: (a) => { shrink(); hideReveal(); return barn()?.openProduct(a.id); },
  show_looks: (a) => { shrink(); hideReveal(); return barn()?.showLooks(a.result); },
  add_to_bag: (a) => barn()?.addToBag(a.id, a.size, a.color),
  get_bag: () => barn()?.getBag(),
  tryon_loading: () => { shrink(); showReveal({ loading: true }); return { ok: true }; },
  tryon_show: (a) => { shrink(); showReveal({ url: `${SERVER}/tryon/${a.file}`, title: a.title }); return { ok: true }; },
  tryon_hide: () => { hideReveal(); return { ok: true }; },
};

async function onBarn(data: RpcInvocationData) {
  try {
    const a = JSON.parse(data.payload) as Action;
    const fn = actions[a.action];
    const out = fn ? await fn(a) : { ok: false, error: `Unknown action ${a.action}` };
    return JSON.stringify(out ?? { ok: false, error: 'The store is not loaded' });
  } catch (e) {
    return JSON.stringify({ ok: false, error: (e as Error).message });
  }
}

// ---- the call ----
async function start() {
  launch.hidden = true;
  stage = el('div', 'sl-stage sl-full', `
    <div class="sl-center">
      <div class="sl-face"><img src="${sashaImg}" alt="Sasha"></div>
      <div class="sl-name">Sasha</div>
      <div class="sl-status">Connecting…</div>
      <div class="sl-caption" aria-live="polite"></div>
    </div>
    <div class="sl-self"><video autoplay muted playsinline></video><span>You</span></div>
    <div class="sl-bar"><button class="sl-mute" type="button">Mute</button><button class="sl-cam" type="button">Camera off</button><button class="sl-end" type="button">End call</button></div>`);
  document.body.append(stage);
  shrunk = false;
  stage.querySelector('.sl-end')!.addEventListener('click', end);

  try {
    const { url, token } = await (await fetch(`${SERVER}/token`)).json();
    room = new Room({ adaptiveStream: true, dynacast: true });
    room.registerRpcMethod('barn', onBarn);
    room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack) => {
      if (track.kind === Track.Kind.Audio) document.body.append(Object.assign(track.attach(), { className: 'sl-audio' }));
    });
    room.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
      const agentTalking = speakers.some((p) => p.identity !== room?.localParticipant.identity);
      stage?.classList.toggle('sl-speaking', agentTalking);
    });
    room.on(RoomEvent.ParticipantConnected, () => { if (room?.localParticipant.isCameraEnabled !== false) setStatus('Here with you'); });
    room.on(RoomEvent.Disconnected, () => end());
    // Sasha's words as captions, from the agent's transcription stream.
    room.registerTextStreamHandler('lk.transcription', async (reader, info) => {
      if (info.identity === room?.localParticipant.identity) return;
      const box = stage?.querySelector('.sl-caption');
      if (!box) return;
      box.textContent = '';
      for await (const chunk of reader) box.textContent += chunk;
    });

    await room.connect(url, token);
    const audio = { echoCancellation: true, noiseSuppression: true };
    // Camera blocked or missing: carry on with voice only, so she can still talk (she knows the camera is off).
    const tracks = await createLocalTracks({ audio, video: { resolution: { width: 1280, height: 720 } } })
      .catch(() => createLocalTracks({ audio }))
      .catch(() => { throw new Error('the browser blocked the microphone. Allow it in the address bar and try again'); });
    for (const t of tracks) await room.localParticipant.publishTrack(t);
    const cam = tracks.find((t) => t.kind === Track.Kind.Video) as LocalVideoTrack | undefined;
    if (cam) cam.attach(stage.querySelector('.sl-self video') as HTMLVideoElement);
    setStatus(!cam ? 'Voice only: your camera is off or blocked' : room.remoteParticipants.size ? 'Here with you' : 'Sasha is joining…');

    const muteBtn = stage.querySelector('.sl-mute') as HTMLButtonElement;
    muteBtn.addEventListener('click', async () => {
      const on = room!.localParticipant.isMicrophoneEnabled;
      await room!.localParticipant.setMicrophoneEnabled(!on);
      muteBtn.textContent = on ? 'Unmute' : 'Mute';
      muteBtn.classList.toggle('sl-off', on);
    });
    const camBtn = stage.querySelector('.sl-cam') as HTMLButtonElement;
    camBtn.addEventListener('click', async () => {
      const on = room!.localParticipant.isCameraEnabled;
      await room!.localParticipant.setCameraEnabled(!on);
      camBtn.textContent = on ? 'Camera on' : 'Camera off';
      camBtn.classList.toggle('sl-off', on);
    });
  } catch (e) {
    console.error('[sasha-live]', e);
    setStatus(e instanceof TypeError ? "Couldn't reach Sasha's server. Is v2/server.ts running?" : `Couldn't start: ${(e as Error).message}.`);
  }
}

async function end() {
  const r = room;
  room = null;
  await r?.disconnect().catch(() => {});
  document.querySelectorAll('.sl-audio').forEach((a) => a.remove());
  stage?.remove();
  stage = null;
  hideReveal();
  launch.hidden = false;
  document.body.classList.add('sl-nobar');
  shrunk = false;
}

launch.addEventListener('click', start);
window.SashaLive = { start, end, shrink, actions }; // actions: for testing the page without a call
