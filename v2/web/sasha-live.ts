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
.sl-face img,.sl-face video{width:100%;height:100%;border-radius:50%;object-fit:cover;position:relative;z-index:1}
.sl-face video{position:absolute;inset:0;z-index:2;background:#0e0e10}
.sl-face-toggle{position:fixed;right:24px;bottom:94px;z-index:450;display:flex;align-items:center;gap:8px;padding:6px 12px 6px 8px;border:1px solid rgba(0,0,0,.12);border-radius:999px;background:#fff;color:#111;font:500 13px/1 "Hanken Grotesk",system-ui,sans-serif;cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,.12)}
.sl-face-toggle i{width:28px;height:16px;border-radius:999px;background:#c9c9c9;position:relative;transition:background .2s}
.sl-face-toggle i::after{content:"";position:absolute;top:2px;left:2px;width:12px;height:12px;border-radius:50%;background:#fff;transition:transform .2s}
.sl-face-toggle[aria-checked="true"] i{background:#2f7d4f}
.sl-face-toggle[aria-checked="true"] i::after{transform:translateX(12px)}
.sl-face-toggle:focus-visible,.sl-launch:focus-visible{outline:2px solid #d4664a;outline-offset:3px}
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
.sl-cursor{position:fixed;left:0;top:0;z-index:700;width:30px;height:30px;pointer-events:none;opacity:0;transition:transform .75s cubic-bezier(.3,.9,.3,1),opacity .3s;filter:drop-shadow(0 3px 6px rgba(0,0,0,.35))}
.sl-cursor.sl-on{opacity:1}
.sl-lens{position:fixed;left:0;top:0;z-index:695;width:118px;height:118px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 2px #d4664a,0 8px 22px rgba(0,0,0,.28);background-repeat:no-repeat;background-color:#f4f1ec;pointer-events:none;opacity:0;transform:scale(.6);transition:opacity .3s,transform .35s cubic-bezier(.3,.9,.3,1)}
.sl-lens.sl-on{opacity:1;transform:scale(1)}
.sl-lens i{position:absolute;left:50%;bottom:-30px;transform:translateX(-50%);font:600 11px/1 "Hanken Grotesk",system-ui,sans-serif;font-style:normal;background:#fff;color:#2a2420;padding:5px 8px;border-radius:999px;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,.18)}
.sl-cursor b{position:absolute;left:24px;top:22px;font:600 11px/1 "Hanken Grotesk",system-ui,sans-serif;background:#d4664a;color:#fff;padding:4px 7px;border-radius:999px;white-space:nowrap}
.sl-cursor.sl-press svg{transform:scale(.82);transition:transform .12s}
.sl-ring{position:fixed;z-index:690;pointer-events:none;border:2px solid #d4664a;border-radius:10px;box-shadow:0 0 0 5px rgba(212,102,74,.16);opacity:0;transition:all .45s cubic-bezier(.3,.9,.3,1)}
.sl-ring.sl-on{opacity:1}
.sl-ripple{position:fixed;z-index:695;width:44px;height:44px;margin:-22px 0 0 -22px;border-radius:50%;border:2px solid #d4664a;pointer-events:none;animation:sl-rip .6s ease-out forwards}
@keyframes sl-rip{from{transform:scale(.3);opacity:1}to{transform:scale(1.6);opacity:0}}
.sl-pick-grid{display:grid;grid-template-columns:minmax(0,6fr) minmax(0,5fr);gap:var(--space-2xl,48px);padding-bottom:var(--space-3xl,64px);align-items:start}
.sl-pick-photo{position:relative;aspect-ratio:3/4;background:var(--tile,#f3f1ec);overflow:hidden}
.sl-pick-photo>img{width:100%;height:100%;object-fit:cover;animation:sl-in .8s ease}
@keyframes sl-in{from{opacity:0;transform:scale(1.03)}to{opacity:1;transform:none}}
.sl-pick-collage{display:grid;grid-template-columns:1fr 1fr;gap:2px;height:100%}
.sl-pick-collage img{width:100%;height:100%;object-fit:contain;mix-blend-mode:multiply;background:var(--tile,#f3f1ec)}
.sl-pick-photo figcaption{position:absolute;left:12px;bottom:12px;font-size:12px;background:rgba(255,255,255,.85);padding:4px 8px;border-radius:6px}
.sl-pick-info{position:sticky;top:calc(var(--nav-h,64px) + 24px)}
.sl-pick-info h1{font-size:var(--text-3xl,40px);line-height:1.1;margin:4px 0 8px}
.sl-pick-intro{color:var(--color-ink-2,#444);margin:0 0 16px}
.sl-pick-item{grid-template-columns:64px 1fr auto!important;align-items:center}
.sl-pick-size{font-size:12px;color:var(--color-muted,#777)}
.sl-pick-item.sl-in-bag .sl-pick-size{color:#2f7d4f}
.sl-pick-total{display:flex;justify-content:space-between;padding-top:14px;margin-top:4px;border-top:1px solid var(--color-rule,#ddd);font-size:var(--text-lg,20px)}
.sl-pick-bag{margin-top:10px;font-size:14px;color:#2f7d4f;min-height:1.2em}
.sl-back{display:inline-block;margin-bottom:12px}
@media (max-width:820px){.sl-pick-grid{grid-template-columns:1fr}.sl-pick-info{position:static}}
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

// ---- video face (Tavus) switch, chosen before the call ----
// The server says whether the face can run (Tavus key set) and whether it starts on (AVATAR=tavus).
// His own choice is remembered in this browser and overrides the default.
const faceToggle = el('button', 'sl-face-toggle', '<i aria-hidden="true"></i><span>Video face</span>');
faceToggle.type = 'button';
faceToggle.setAttribute('role', 'switch');
faceToggle.hidden = true;
document.body.append(faceToggle);
let faceOn = false;
const setFace = (on: boolean) => { faceOn = on; faceToggle.setAttribute('aria-checked', String(on)); faceToggle.title = on ? 'Sasha appears as a live video face' : 'Voice only, with her photo'; };
setFace(false);
faceToggle.addEventListener('click', () => {
  setFace(!faceOn);
  try { localStorage.setItem('sasha-face', faceOn ? 'on' : 'off'); } catch {}
});
fetch(`${SERVER}/config`).then((r) => r.json()).then((c: { avatar_available?: boolean; avatar_default?: boolean }) => {
  if (!c.avatar_available) return;
  let saved: string | null = null;
  try { saved = localStorage.getItem('sasha-face'); } catch {}
  setFace(saved ? saved === 'on' : !!c.avatar_default);
  faceToggle.hidden = launch.hidden;
}).catch(() => {});
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
  if (!docked) stage.removeAttribute('style');
  else {
    const r = slot!.getBoundingClientRect();
    Object.assign(stage.style, { top: `${r.top}px`, left: `${r.left}px`, width: `${r.width}px`, height: `${Math.max(r.height, 240)}px` });
  }
  clearBag();
}
addEventListener('resize', place);
wide.addEventListener('change', place);

// The bag drawer slides in on the same side as Sasha. Keep her on top in her own space and start the
// bag's contents below her (or above her, when she sits in the bottom corner on small screens).
const bag = document.getElementById('bag-drawer');
function clearBag() {
  if (!bag) return;
  bag.style.paddingTop = bag.style.paddingBottom = '';
  if (!stage || !shrunk || bag.hidden) return;
  const s = stage.getBoundingClientRect();
  const b = bag.getBoundingClientRect();
  if (s.right <= b.left || s.left >= b.right) return; // not over the bag
  if (stage.classList.contains('sl-corner')) bag.style.paddingBottom = `${innerHeight - s.top + 16}px`;
  else bag.style.paddingTop = `${s.bottom + 20}px`;
}
if (bag) new MutationObserver(() => requestAnimationFrame(clearBag)).observe(bag, { attributes: true, attributeFilter: ['hidden'] });

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

// ---- Sasha's pointer: she moves a cursor to a part of the page, rings it, and can click it ----
// The store's own globals (site/app.js), used to draw the picked outfit like the rest of the store.
declare const byId: Record<string, any>, img: (p: any, i?: number) => string, title: (s: string) => string, esc: (s: unknown) => string, money: (n: number) => string, priceHtml: (p: any) => string, main: HTMLElement;
const cursor = el('div', 'sl-cursor', '<svg viewBox="0 0 24 24" width="30" height="30"><path d="M4 2l16 9-7 2-3 7z" fill="#d4664a" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg><b>Sasha</b>');
const ring = el('div', 'sl-ring');
const lens = el('div', 'sl-lens', '<i></i>');
document.body.append(ring, lens, cursor);
let lensTimer: ReturnType<typeof setTimeout> | undefined;
// Glide the pointer onto a spot in the big product photo (x, y from 0 to 1000 of the picture itself)
// and show that spot magnified beside it, with a short label. Nothing else on the page changes.
async function hoverPhoto(a: { x: number; y: number; detail?: string }) {
  const im = document.querySelector<HTMLImageElement>('.gal-main img');
  if (!im || !im.naturalWidth) return { ok: false, error: 'No product photo on screen' };
  const box = im.getBoundingClientRect();
  if (box.top < 60 || box.bottom > innerHeight) { sashaScrolls(); im.scrollIntoView({ behavior: 'smooth', block: 'center' }); await wait(500); }
  const r = im.getBoundingClientRect();
  // object-fit: contain, so find where the picture actually sits inside the img box.
  const k = Math.min(r.width / im.naturalWidth, r.height / im.naturalHeight);
  const w = im.naturalWidth * k, h = im.naturalHeight * k;
  const left = r.left + (r.width - w) / 2, top = r.top + (r.height - h) / 2;
  const px = left + (Math.max(0, Math.min(1000, a.x)) / 1000) * w, py = top + (Math.max(0, Math.min(1000, a.y)) / 1000) * h;
  ring.classList.remove('sl-on'); ringOn = null;
  cursor.style.transform = `translate(${px}px, ${py}px)`;
  cursor.classList.add('sl-on');
  const Z = 2.6, L = 118;
  const lx = px + 34 + L > innerWidth ? px - 34 - L : px + 34, ly = Math.max(10, py - L - 10);
  Object.assign(lens.style, {
    transform: '', left: `${lx}px`, top: `${ly}px`, backgroundImage: `url("${im.currentSrc || im.src}")`,
    backgroundSize: `${w * Z}px ${h * Z}px`, backgroundPosition: `${L / 2 - (px - left) * Z}px ${L / 2 - (py - top) * Z}px`,
  });
  (lens.querySelector('i') as HTMLElement).textContent = a.detail ?? '';
  (lens.querySelector('i') as HTMLElement).style.display = a.detail ? '' : 'none';
  lens.classList.add('sl-on');
  clearTimeout(lensTimer);
  clearTimeout(ringTimer);
  lensTimer = setTimeout(() => lens.classList.remove('sl-on'), 2600);
  ringTimer = setTimeout(() => cursor.classList.remove('sl-on'), 6000);
  return { ok: true };
}
addEventListener('scroll', () => { if (Date.now() > sashaScrollUntil) lens.classList.remove('sl-on'); }, { passive: true });
let ringTimer: ReturnType<typeof setTimeout> | undefined;
let sashaActing = 0; // clicks Sasha makes herself are not reported as his
let sashaScrollUntil = 0; // nor are her scrolls
let ringOn: HTMLElement | null = null;
const sashaScrolls = () => { sashaScrollUntil = Date.now() + 1500; };
function placeRing() {
  if (!ringOn) return;
  const r = ringOn.getBoundingClientRect();
  Object.assign(ring.style, { left: `${r.left - 6}px`, top: `${r.top - 6}px`, width: `${r.width + 12}px`, height: `${r.height + 12}px` });
}
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Plain names for the parts of each page, so the agent can say "sizes" instead of a CSS selector.
const TARGETS: Record<string, string> = {
  photo: '.sl-pick-photo, .gal-main', thumbnails: '.thumbs', title: '.sl-pick-info h1, .info h1', price: '.info .price',
  colors: '.chips[data-g="c"]', sizes: '.chips[data-g="s"]', description: '.desc p', details: '.desc ul', add_to_bag: '#bag',
  related: '.also', total: '.sl-pick-total, .board-total', pieces: '.sl-pick-list', bag: '#bag-open', looks: '.board-looks', heading: 'main h1',
};
const loose = (s: string) => s.toLowerCase().replace(/[^a-z0-9.]/g, '');
function findTarget(target: string): HTMLElement | null {
  const [kind, ...rest] = target.split(':');
  const v = rest.join(':').trim();
  if (kind === 'product') {
    return document.querySelector<HTMLElement>(`.sl-pick-item[data-id="${v}"]`)
      ?? document.querySelector<HTMLElement>(`main a.card[href="#/product/${v}"], main .board-item a[href="#/product/${v}"]`)?.closest<HTMLElement>('.card, .board-item') ?? null;
  }
  if (kind === 'look') return document.querySelectorAll<HTMLElement>('.board-look')[Number(v) - 1] ?? null;
  if (kind === 'photo' && v) return document.querySelector<HTMLElement>(`.thumbs button[data-i="${Number(v) - 1}"]`);
  if (kind === 'size' || kind === 'color') {
    const chips = [...document.querySelectorAll<HTMLElement>(`.chips[data-g="${kind[0]}"] .chip`)];
    return chips.find((c) => loose(c.dataset.v ?? '') === loose(v)) ?? chips.find((c) => loose(c.dataset.v ?? '').startsWith(loose(v))) ?? null;
  }
  const sel = TARGETS[kind];
  return sel ? [...document.querySelectorAll<HTMLElement>(sel)].find((e) => e.offsetParent !== null) ?? null : null;
}
function availableTargets() {
  const out = Object.keys(TARGETS).filter((k) => findTarget(k));
  document.querySelectorAll<HTMLElement>('.sl-pick-item, main a.card').forEach((e) => out.push(`product:${e.dataset.id ?? e.getAttribute('href')?.split('/').pop()}`));
  document.querySelectorAll('.board-look').forEach((_, i) => out.push(`look:${i + 1}`));
  document.querySelectorAll<HTMLElement>('.chips[data-g="s"] .chip:not([disabled])').forEach((c) => out.push(`size:${c.dataset.v}`));
  document.querySelectorAll('.thumbs button').forEach((_, i) => out.push(`photo:${i + 1}`));
  return [...new Set(out)].slice(0, 40);
}
async function pointAt(target: string, click = false) {
  const t = findTarget(target);
  if (!t) return { ok: false, error: `Nothing called "${target}" on this page`, available: availableTargets() };
  const r0 = t.getBoundingClientRect();
  if (r0.top < 70 || r0.bottom > innerHeight - 20) { sashaScrolls(); t.scrollIntoView({ behavior: 'smooth', block: 'center' }); await wait(550); }
  const r = t.getBoundingClientRect();
  const x = r.left + Math.min(r.width / 2, 120), y = r.top + Math.min(r.height / 2, 90);
  cursor.style.transform = `translate(${x}px, ${y}px)`;
  cursor.classList.add('sl-on');
  ringOn = t;
  placeRing();
  ring.classList.add('sl-on');
  clearTimeout(ringTimer);
  ringTimer = setTimeout(() => { ring.classList.remove('sl-on'); cursor.classList.remove('sl-on'); ringOn = null; }, 7000);
  await wait(800);
  if (click) {
    cursor.classList.add('sl-press');
    const rip = el('div', 'sl-ripple');
    Object.assign(rip.style, { left: `${x}px`, top: `${y}px` });
    document.body.append(rip);
    setTimeout(() => rip.remove(), 700);
    await wait(150);
    sashaActing++;
    try { (t.matches('a, button') ? t : t.querySelector<HTMLElement>('a, button') ?? t).click(); } finally { setTimeout(() => sashaActing--, 50); }
    cursor.classList.remove('sl-press');
  }
  return { ok: true, pointed_at: target, clicked: click || undefined };
}
// Keep the ring on its element while the page scrolls.
addEventListener('scroll', placeRing, { passive: true });

async function scrollPage(to: string) {
  sashaScrolls();
  if (to === 'top') scrollTo({ top: 0, behavior: 'smooth' });
  else if (to === 'bottom') scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  else if (to === 'down' || to === 'up') scrollBy({ top: (to === 'down' ? 1 : -1) * innerHeight * 0.7, behavior: 'smooth' });
  else {
    const t = findTarget(to);
    if (!t) return { ok: false, error: `Nothing called "${to}" on this page`, available: availableTargets() };
    t.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  await wait(600);
  const max = document.body.scrollHeight - innerHeight;
  return { ok: true, at: max > 0 ? `${Math.round((scrollY / max) * 100)}% down the page` : 'the whole page fits on screen' };
}

// ---- the picked outfit, on its own: his try-on (or the pieces until then), each piece with its price, the total ----
let pick: { name: string; items: { product_id: string; slot: string }[] } | null = null;
function showPick(a: { name: string; intro?: string; items: { product_id: string; slot: string }[]; total_usd?: number }) {
  pick = { name: a.name, items: a.items };
  const ps = a.items.map((it) => ({ ...it, p: byId[it.product_id] })).filter((x) => x.p);
  const total = a.total_usd ?? ps.reduce((s, x) => s + x.p.simulated.price, 0);
  main.innerHTML = `<div class="container"><a class="link sl-back" href="#/stylist">← All three outfits</a>
    <div class="sl-pick-grid"><figure class="sl-pick-photo" style="margin:0"><div class="sl-pick-collage">${ps.slice(0, 4).map((x) => `<img src="${img(x.p)}" alt="">`).join('')}</div></figure>
    <div class="sl-pick-info"><div class="brand">Your pick</div><h1>${esc(a.name)}</h1>${a.intro ? `<p class="sl-pick-intro">${esc(a.intro)}</p>` : ''}
    <ul class="board-items sl-pick-list">${ps.map((x) => `<li class="board-item sl-pick-item" data-id="${x.p.id}"><a class="board-pic" href="#/product/${x.p.id}"><img src="${img(x.p)}" alt=""></a>
      <div><div class="board-slot">${esc(x.slot)}</div><a class="board-title" href="#/product/${x.p.id}">${esc(title(x.p.title))}</a><div class="card-brand">${esc(x.p.brand)}</div><div class="sl-pick-size"></div></div>${priceHtml(x.p)}</li>`).join('')}</ul>
    <div class="sl-pick-total"><span>Outfit total</span><span>${money(Math.round(total * 100) / 100)}</span></div><p class="sl-pick-bag" aria-live="polite"></p></div></div></div>`;
  main.querySelector('.sl-back')!.addEventListener('click', (e) => { e.preventDefault(); pick = null; barn()?.showLooks(barn()?.lastLooks); });
  sashaScrolls();
  scrollTo({ top: 0, behavior: 'smooth' });
  return { ok: true, pieces: ps.length };
}
const pickShowing = () => !!pick && !!main.querySelector('.sl-pick-grid');
function pickPhoto(url: string | null) {
  const box = main.querySelector('.sl-pick-photo');
  if (!box) return false;
  box.innerHTML = url ? `<img src="${url}" alt="You wearing ${esc(pick?.name)}"><figcaption>A preview made by AI from your camera</figcaption>` : '<div class="sl-loading" style="width:100%;height:100%;border-radius:0"></div>';
  return true;
}
// Bag lines in the pick list: each piece shows the size it went in at.
addEventListener('barn:bag', (e: any) => {
  if (!pickShowing() || e.detail?.action !== 'add') return;
  const li = main.querySelector<HTMLElement>(`.sl-pick-item[data-id="${e.detail.id}"]`);
  if (li) { li.classList.add('sl-in-bag'); li.querySelector('.sl-pick-size')!.textContent = `In your bag, size ${e.detail.size}`; }
  const bag = barn()?.getBag();
  const note = main.querySelector('.sl-pick-bag');
  if (note && bag) note.textContent = `Bag: ${bag.count} ${bag.count === 1 ? 'item' : 'items'}, ${money(bag.total)}`;
});
addEventListener('hashchange', () => { pick = null; });

// ---- what he does on the page, sent to the agent's call log (and to Sasha as quiet context) ----
function report(kind: string, detail: string) {
  if (!room || sashaActing) return;
  room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify({ kind, detail, hash: location.hash })), { reliable: true, topic: 'shopper-activity' }).catch(() => {});
}
document.addEventListener('click', (e) => {
  const t = e.target as HTMLElement;
  if (!e.isTrusted || t.closest('.sl-stage, .sl-launch')) return;
  const a = t.closest<HTMLElement>('a, button, .chip, .card');
  const what = a ? (a.getAttribute('aria-label') || a.textContent || a.getAttribute('href') || '').replace(/\s+/g, ' ').trim().slice(0, 80) : t.tagName.toLowerCase();
  report('click', what || (a?.getAttribute('href') ?? ''));
}, true);
let scrollReport: ReturnType<typeof setTimeout> | undefined;
addEventListener('scroll', (e) => {
  if (!e.isTrusted || Date.now() < sashaScrollUntil) return;
  clearTimeout(scrollReport);
  scrollReport = setTimeout(() => { const max = document.body.scrollHeight - innerHeight; if (max > 0) report('scroll', `${Math.round((scrollY / max) * 100)}% down`); }, 1200);
}, { passive: true });
addEventListener('hashchange', () => report('page', location.hash || '#/'));

// ---- what the agent can do on the page (RPC method "barn") ----
type Action = { action: string; [k: string]: any };
const actions: Record<string, (a: Action) => unknown> = {
  show_products: (a) => { shrink(); hideReveal(); return barn()?.showIds(a.ids, a.heading); },
  open_product: (a) => { shrink(); hideReveal(); return barn()?.openProduct(a.id); },
  show_looks: (a) => { shrink(); hideReveal(); return barn()?.showLooks(a.result); },
  add_to_bag: (a) => barn()?.addToBag(a.id, a.size, a.color),
  get_bag: () => barn()?.getBag(),
  // The try-on goes into the picked outfit's page when that's showing; otherwise it pops up over the page.
  tryon_loading: (a) => { shrink(); if (!(pickShowing() && pick?.name === a.title && pickPhoto(null))) showReveal({ loading: true }); return { ok: true }; },
  tryon_show: (a) => {
    shrink();
    const url = `${SERVER}/tryon/${a.file}`;
    if (pickShowing() && pick?.name === a.title && pickPhoto(url)) { hideReveal(); scrollTo({ top: 0, behavior: 'smooth' }); } else showReveal({ url, title: a.title });
    return { ok: true };
  },
  tryon_hide: () => { hideReveal(); return { ok: true }; },
  show_pick: (a) => { shrink(); hideReveal(); return showPick(a as any); },
  point: (a) => { shrink(); return pointAt(String(a.target), !!a.click); },
  scroll: (a) => { shrink(); return scrollPage(String(a.to)); },
  open_bag: () => { if (document.getElementById('bag-drawer')?.hidden) document.getElementById('bag-open')?.click(); return { ok: true }; },
  hover_photo: (a) => hoverPhoto(a as any),
  where: () => ({ ok: true, page: location.hash || '#/', targets: availableTargets() }),
  // Flip the product page's gallery to one photo (clicks its thumbnail, waiting for the page to render).
  show_photo: async (a) => {
    shrink(); hideReveal(); lens.classList.remove('sl-on');
    for (let t = 0; t < 20; t++) {
      const b = document.querySelector<HTMLButtonElement>(`.thumbs button[data-i="${a.index}"]`);
      if (b) { b.click(); sashaScrolls(); document.querySelector('.gal')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); return { ok: true }; }
      await new Promise((r) => setTimeout(r, 100));
    }
    return { ok: false, error: 'The product page is not showing that photo' };
  },
};

// For testing in the browser with ?sasha_debug: run any of Sasha's page actions from the console.
if (params.has('sasha_debug')) (window as any).sashaDo = (action: string, args: Action = {} as Action) => actions[action]?.(args);

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
  faceToggle.hidden = true;
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
    const { url, token } = await (await fetch(`${SERVER}/token?avatar=${faceOn ? 'tavus' : 'none'}`)).json();
    room = new Room({ adaptiveStream: true, dynacast: true });
    room.registerRpcMethod('barn', onBarn);
    room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack) => {
      if (track.kind === Track.Kind.Audio) document.body.append(Object.assign(track.attach(), { className: 'sl-audio' }));
      // The Tavus face: its video takes the place of her photo in the call window.
      if (track.kind === Track.Kind.Video) {
        const face = stage?.querySelector('.sl-face');
        if (face) { face.querySelector('video')?.remove(); face.append(Object.assign(track.attach() as HTMLVideoElement, { muted: true, playsInline: true })); }
      }
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
  fetch(`${SERVER}/config`).then((r) => r.json()).then((c) => { faceToggle.hidden = !c.avatar_available; }).catch(() => {});
  document.body.classList.add('sl-nobar');
  shrunk = false;
}

launch.addEventListener('click', start);
window.SashaLive = { start, end, shrink, actions }; // actions: for testing the page without a call
