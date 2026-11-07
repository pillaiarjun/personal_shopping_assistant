// Dev harness server: Vite + a few local API routes standing in for Jing's app/api/.
//   POST /api/conversation       -> creates a REAL Tavus conversation (uses minutes)
//   POST /api/conversation/end   -> ends it
//   POST /api/style-outfit       -> mock stylist, or proxied to STYLE_OUTFIT_URL if set
//   GET  /api/config             -> which env vars are present (never their values)

import react from "@vitejs/plugin-react";
import type { IncomingMessage, ServerResponse } from "node:http";
import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv, type Plugin } from "vite";
import { handleCreateConversation, handleEndConversation } from "../create-conversation";
import { mockStyleOutfit } from "../style-outfit";
import { STUB_PRODUCTS } from "./src/stub-products";

const avatarDir = fileURLToPath(new URL("..", import.meta.url));

async function toRequest(req: IncomingMessage): Promise<Request> {
  const chunks: Buffer[] = [];
  for await (const c of req) chunks.push(c as Buffer);
  return new Request(`http://localhost${req.url}`, {
    method: req.method,
    headers: { "content-type": req.headers["content-type"] ?? "application/json" },
    body: req.method === "GET" ? undefined : Buffer.concat(chunks),
  });
}

async function send(res: ServerResponse, response: Response) {
  res.statusCode = response.status;
  res.setHeader("content-type", response.headers.get("content-type") ?? "application/json");
  res.end(Buffer.from(await response.arrayBuffer()));
}

function avatarApi(): Plugin {
  const mock = mockStyleOutfit(STUB_PRODUCTS, 2500);
  return {
    name: "avatar-api",
    configureServer(server) {
      Object.assign(process.env, loadEnv("development", avatarDir, ""));
      server.middlewares.use(async (req, res, next) => {
        const path = req.url?.split("?")[0];
        try {
          if (path === "/api/config" && req.method === "GET") {
            return send(
              res,
              Response.json({
                tavus_api_key: !!process.env.TAVUS_API_KEY,
                tavus_pal_id: !!process.env.TAVUS_PAL_ID,
                style_outfit: process.env.STYLE_OUTFIT_URL || "mock",
              }),
            );
          }
          if (req.method !== "POST") return next();
          if (path === "/api/conversation") return send(res, await handleCreateConversation(await toRequest(req)));
          if (path === "/api/conversation/end") return send(res, await handleEndConversation(await toRequest(req)));
          if (path === "/api/style-outfit") {
            const r = await toRequest(req);
            const target = process.env.STYLE_OUTFIT_URL;
            if (target) return send(res, await fetch(target, { method: "POST", headers: r.headers, body: await r.text() }));
            const body = await r.json();
            if (body?.notes === "fail") return send(res, Response.json({ error: "mock failure" }, { status: 500 }));
            return send(res, Response.json(await mock(body)));
          }
        } catch (e) {
          return send(res, Response.json({ error: (e as Error).message }, { status: 500 }));
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), avatarApi()],
  // avatar/*.tsx lives outside this folder; resolve its react/daily imports from here.
  resolve: { dedupe: ["react", "react-dom", "@daily-co/daily-js"] },
  server: { port: 5175, fs: { allow: [fileURLToPath(new URL("../..", import.meta.url))] } },
});
