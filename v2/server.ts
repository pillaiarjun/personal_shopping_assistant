// Small local server for the V2 call page (run next to the agent):  node server.ts
//   GET /token       a LiveKit token for a new shopper room (the agent joins it on its own)
//   GET /tryon/<f>   try-on images the agent made during the call
import dotenv from 'dotenv';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';
import { AccessToken } from 'livekit-server-sdk';
dotenv.config({ path: '.env.local', quiet: true });

const PORT = Number(process.env.V2_PORT ?? 8790);
const LOCAL = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
const PAGES = ['https://pillaiarjun.github.io'];

createServer(async (req, res) => {
  const origin = req.headers.origin ?? '';
  if (LOCAL.test(origin) || PAGES.includes(origin)) res.setHeader('Access-Control-Allow-Origin', origin);
  const url = new URL(req.url ?? '/', 'http://x');
  try {
    if (url.pathname === '/token') {
      const room = `sasha-${Date.now().toString(36)}`;
      const at = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, { identity: `shopper-${room}`, ttl: '1h' });
      at.addGrant({ room, roomJoin: true, canPublish: true, canSubscribe: true, canPublishData: true });
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ url: process.env.LIVEKIT_URL, token: await at.toJwt(), room }));
    }
    if (url.pathname.startsWith('/tryon/')) {
      const file = await readFile(new URL(`./tryon/${basename(url.pathname)}`, import.meta.url));
      res.setHeader('Content-Type', 'image/jpeg');
      return res.end(file);
    }
    res.statusCode = 404;
    res.end('not found');
  } catch (e) {
    res.statusCode = 500;
    res.end(String((e as Error).message));
  }
}).listen(PORT, () => console.log(`Sasha V2 server on http://localhost:${PORT}`));
