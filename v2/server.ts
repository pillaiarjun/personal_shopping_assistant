// Small local server for the V2 call page (run next to the agent):  node server.ts
//   GET /token       a LiveKit token for a new shopper room (the agent joins it on its own)
//   GET /config      { avatar_available, avatar_default } for the widget's video-face switch
//   GET /tryon/<f>   try-on images the agent made during the call
//   GET /            the store page (site/) with Sasha, for a hosted server (Easypanel): one address for everything
import dotenv from 'dotenv';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { basename, extname, normalize } from 'node:path';
import { AccessToken } from 'livekit-server-sdk';
dotenv.config({ path: '.env.local', quiet: true });

const PORT = Number(process.env.V2_PORT ?? 8790);
const LOCAL = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
const PAGES = ['https://pillaiarjun.github.io'];
const TYPES: Record<string, string> = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.csv': 'text/csv' };

createServer(async (req, res) => {
  const origin = req.headers.origin ?? '';
  if (LOCAL.test(origin) || PAGES.includes(origin)) res.setHeader('Access-Control-Allow-Origin', origin);
  const url = new URL(req.url ?? '/', 'http://x');
  try {
    if (url.pathname === '/token') {
      const room = `sasha-${Date.now().toString(36)}`;
      // His video-face choice rides along on his token; the agent reads it when he joins.
      const avatar = url.searchParams.get('avatar') === 'tavus' && process.env.TAVUS_API_KEY ? 'tavus' : 'none';
      const at = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, { identity: `shopper-${room}`, ttl: '1h', attributes: { avatar } });
      at.addGrant({ room, roomJoin: true, canPublish: true, canSubscribe: true, canPublishData: true, canUpdateOwnMetadata: true });
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ url: process.env.LIVEKIT_URL, token: await at.toJwt(), room }));
    }
    // What the Sasha widget needs before a call: can the video face run, and does it start on?
    if (url.pathname === '/config') {
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ avatar_available: !!process.env.TAVUS_API_KEY, avatar_default: process.env.AVATAR === 'tavus' }));
    }
    if (url.pathname.startsWith('/tryon/')) {
      const file = await readFile(new URL(`./tryon/${basename(url.pathname)}`, import.meta.url));
      res.setHeader('Content-Type', 'image/jpeg');
      return res.end(file);
    }
    // The store page and what it loads, straight from the repo (site/ and data/ belong to the main site).
    if (url.pathname === '/' || url.pathname === '/site' ) {
      // Tell the page's Sasha script to use this same server for tokens and try-on pictures.
      const host = req.headers['x-forwarded-host'] ?? req.headers.host;
      const proto = req.headers['x-forwarded-proto'] ?? (LOCAL.test(`http://${host}`) ? 'http' : 'https');
      res.writeHead(302, { Location: `/site/index.html?v2_server=${encodeURIComponent(`${proto}://${host}`)}` });
      return res.end();
    }
    const STATIC = ['/site/', '/data/catalog/', '/v2/web/dist/'];
    const path = normalize(decodeURIComponent(url.pathname));
    if (STATIC.some((p) => path.startsWith(p)) && !path.includes('..')) {
      const file = await readFile(new URL(`..${path}`, import.meta.url));
      res.setHeader('Content-Type', TYPES[extname(path)] ?? 'application/octet-stream');
      return res.end(file);
    }
    res.statusCode = 404;
    res.end('not found');
  } catch (e) {
    res.statusCode = (e as any).code === "ENOENT" ? 404 : 500;
    res.end(String((e as Error).message));
  }
}).listen(PORT, () => console.log(`Sasha V2 server on http://localhost:${PORT}`));
