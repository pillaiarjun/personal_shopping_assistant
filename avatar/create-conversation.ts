// Server-only. Creates and ends Tavus conversations; the API key never reaches the browser.
//
// Next.js App Router (Jing), one line in app/api/conversation/route.ts:
//   export { handleCreateConversation as POST } from "@/avatar/create-conversation";
// and optionally app/api/conversation/end/route.ts:
//   export { handleEndConversation as POST } from "@/avatar/create-conversation";
//
// Env: TAVUS_API_KEY (required), TAVUS_PAL_ID (required), TAVUS_FACE_ID (optional, overrides the PAL's default face).

const TAVUS_API = "https://tavusapi.com/v2";

export interface CreateConversationOptions {
  apiKey?: string;
  palId?: string;
  faceId?: string;
  conversationName?: string;
  /** Appended to the PAL's own context. */
  conversationalContext?: string;
  customGreeting?: string;
  /** Hard cap per call; minutes are shared, so keep it short. Default 600s. */
  maxCallDurationSec?: number;
}

export interface CreatedConversation {
  conversation_id: string;
  conversation_url: string;
}

function env(name: string): string | undefined {
  return typeof process !== "undefined" ? process.env[name] : undefined;
}

export async function createConversation(opts: CreateConversationOptions = {}): Promise<CreatedConversation> {
  const apiKey = opts.apiKey ?? env("TAVUS_API_KEY");
  const palId = opts.palId ?? env("TAVUS_PAL_ID");
  const faceId = opts.faceId ?? env("TAVUS_FACE_ID");
  if (!apiKey) throw new Error("TAVUS_API_KEY is not set");
  if (!palId) throw new Error("TAVUS_PAL_ID is not set");

  const body: Record<string, unknown> = {
    pal_id: palId,
    conversation_name: opts.conversationName ?? `shop-${new Date().toISOString()}`,
    properties: {
      max_call_duration: opts.maxCallDurationSec ?? 600,
      // End quickly when the shopper closes the tab, to save shared minutes.
      participant_left_timeout: 10,
      participant_absent_timeout: 60,
    },
  };
  if (faceId) body.face_id = faceId;
  if (opts.conversationalContext) body.conversational_context = opts.conversationalContext;
  if (opts.customGreeting) body.custom_greeting = opts.customGreeting;

  const res = await fetch(`${TAVUS_API}/conversations`, {
    method: "POST",
    headers: { "x-api-key": apiKey, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Tavus create conversation ${res.status}: ${text.slice(0, 300)}`);
  const data = JSON.parse(text);
  return { conversation_id: data.conversation_id, conversation_url: data.conversation_url };
}

export async function endConversation(conversationId: string, apiKey = env("TAVUS_API_KEY")): Promise<void> {
  if (!apiKey) throw new Error("TAVUS_API_KEY is not set");
  const res = await fetch(`${TAVUS_API}/conversations/${encodeURIComponent(conversationId)}/end`, {
    method: "POST",
    headers: { "x-api-key": apiKey },
  });
  if (!res.ok) throw new Error(`Tavus end conversation ${res.status}: ${(await res.text()).slice(0, 300)}`);
}

// ---- Fetch-API handlers (Request -> Response): work as Next.js route handlers or behind any server ----

/** POST, optional JSON body { conversational_context?, custom_greeting? } -> { conversation_id, conversation_url } */
export async function handleCreateConversation(req: Request): Promise<Response> {
  try {
    const input = await req.json().catch(() => ({}));
    const created = await createConversation({
      conversationalContext: typeof input?.conversational_context === "string" ? input.conversational_context : undefined,
      customGreeting: typeof input?.custom_greeting === "string" ? input.custom_greeting : undefined,
    });
    return Response.json(created);
  } catch (e) {
    console.error("[avatar] create conversation failed:", e);
    return Response.json({ error: (e as Error).message }, { status: 502 });
  }
}

/** POST { conversation_id } -> { ok: true } */
export async function handleEndConversation(req: Request): Promise<Response> {
  try {
    const { conversation_id } = await req.json();
    if (typeof conversation_id !== "string") return Response.json({ error: "conversation_id required" }, { status: 400 });
    await endConversation(conversation_id);
    return Response.json({ ok: true });
  } catch (e) {
    console.error("[avatar] end conversation failed:", e);
    return Response.json({ error: (e as Error).message }, { status: 502 });
  }
}
