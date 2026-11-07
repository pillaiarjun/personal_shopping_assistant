// Tool router: turns a Tavus `conversation.tool_call` app message into a ShopBridge call
// and builds the `conversation.tool_result` app message to send back.
// No React and no Daily/Tavus SDK imports, so it runs in node tests as-is.

import type { Product } from "../contracts/product";
import type { AddToCartResult, SearchFilters, ShopBridge } from "../contracts/shop-bridge";
import type { StyleOutfitRequest, StylistResponse } from "../contracts/stylist";
import type { StyleOutfitFn } from "./style-outfit";
import { DEFAULT_STYLE_OUTFIT_TIMEOUT_MS } from "./style-outfit";

/** Tavus drops app messages over 4 KB silently, so results are trimmed below this. */
export const MAX_APP_MESSAGE_BYTES = 4096;
export const TRIM_THRESHOLD_BYTES = 3500;
export const MAX_SEARCH_RESULTS = 5;
const LINE_CHARS = 80;
const SHORT_NAME_CHARS = 40;

// ---- Tavus message shapes (docs.tavus.io: tool-calling examples, conversation.tool_result schema) ----

export interface ToolCallMessage {
  message_type: "conversation";
  event_type: "conversation.tool_call";
  conversation_id: string;
  /** Older examples put inference_id at the top level; newer ones omit it. */
  inference_id?: string;
  properties: {
    name: string;
    /** Tavus sends a JSON string; we also accept an object. */
    arguments: string | Record<string, unknown>;
    tool_call_id?: string;
    inference_id?: string;
  };
}

export interface ToolResultMessage {
  message_type: "conversation";
  event_type: "conversation.tool_result";
  conversation_id: string;
  properties: {
    tool_call_id: string;
    output: string | Record<string, unknown>;
    status: "success" | "error";
  };
}

export type RouterLogEntry =
  | { dir: "in"; tool: string; tool_call_id: string; args: unknown }
  | {
      dir: "out";
      tool: string;
      tool_call_id: string;
      status: "success" | "error";
      bytes: number;
      ms: number;
      trimmed: string[];
      output: unknown;
    }
  | { dir: "info"; text: string };

export interface RouterOptions {
  /** The page's bridge, or a getter (e.g. () => window.shop) so it can register late. */
  bridge: ShopBridge | (() => ShopBridge | undefined);
  styleOutfit: StyleOutfitFn;
  styleOutfitTimeoutMs?: number;
  /**
   * "await" (default): the tool_result waits for the styling run.
   * "background": reply at once, then push the looks as a conversation.respond message.
   * Fallback in case Tavus drops slow tool results (TEAM_PLAN risk table).
   */
  styleOutfitMode?: "await" | "background";
  trimThresholdBytes?: number;
  /** Structured log for the debug panel. */
  onLog?: (entry: RouterLogEntry) => void;
  /** Plain-text log; defaults to console.log. */
  logger?: (line: string) => void;
}

export function isToolCall(msg: unknown): msg is ToolCallMessage {
  const m = msg as ToolCallMessage | null;
  return (
    !!m &&
    typeof m === "object" &&
    m.event_type === "conversation.tool_call" &&
    !!m.properties &&
    typeof m.properties.name === "string"
  );
}

export function byteLength(value: unknown): number {
  return new TextEncoder().encode(typeof value === "string" ? value : JSON.stringify(value)).length;
}

// ---- argument validation ----

type ArgSpec = Record<string, { type: "string" | "number"; required?: boolean }>;
type Validated = { ok: true; args: Record<string, string | number> } | { ok: false; error: string };

function validate(raw: unknown, spec: ArgSpec): Validated {
  const input = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const args: Record<string, string | number> = {};
  for (const [key, { type, required }] of Object.entries(spec)) {
    let v = input[key];
    if (v === "" || v === null) v = undefined;
    if (v === undefined) {
      if (required) return { ok: false, error: `I need a ${key.replace(/_/g, " ")} to do that.` };
      continue;
    }
    if (type === "number") {
      const n = typeof v === "string" ? Number(v.replace(/[$,\s]/g, "")) : v;
      if (typeof n !== "number" || !Number.isFinite(n) || n < 0) {
        return { ok: false, error: `${key.replace(/_/g, " ")} should be a number.` };
      }
      args[key] = n;
    } else {
      if (typeof v !== "string" && typeof v !== "number") {
        return { ok: false, error: `${key.replace(/_/g, " ")} should be text.` };
      }
      args[key] = String(v).trim();
    }
  }
  // Extra keys (e.g. response_to_user, injected by on_call: generate_filler) are ignored.
  return { ok: true, args };
}

function parseArguments(raw: ToolCallMessage["properties"]["arguments"]): unknown {
  if (typeof raw !== "string") return raw ?? {};
  if (raw.trim() === "") return {};
  return JSON.parse(raw);
}

// ---- compact shapes sent to the avatar ----

function clip(s: string, n: number): string {
  return s.length <= n ? s : s.slice(0, n - 1).trimEnd() + "…";
}

interface CompactProduct {
  id: string;
  name: string;
  price_usd: number;
  line?: string;
}

function compact(p: Product): CompactProduct {
  const firstSentence = (p.description ?? "").split(/(?<=[.!?])\s/)[0] ?? "";
  return { id: p.id, name: p.name, price_usd: p.price_usd, line: clip(firstSentence, LINE_CHARS) || undefined };
}

// ---- handlers ----

type HandlerResult = {
  status: "success" | "error";
  output: string | Record<string, unknown>;
  /** Successive trims to apply while the message is too big. Each returns a smaller output. */
  trims?: Array<{ label: string; apply: (o: any) => any }>;
};

interface HandlerContext {
  conversationId: string;
  /** Sends a later, unsolicited app message (background style_outfit). */
  send?: (msg: RespondMessage) => void;
}

type Handler = (args: Record<string, unknown>, bridge: ShopBridge, ctx: HandlerContext) => Promise<HandlerResult>;

const err = (output: string): HandlerResult => ({ status: "error", output });

function listTrims(listKey: string, minKeep = 1) {
  const trims: NonNullable<HandlerResult["trims"]> = [
    {
      label: "drop lines",
      apply: (o) => ({ ...o, [listKey]: o[listKey].map(({ line, ...rest }: any) => rest) }),
    },
    {
      label: "short names",
      apply: (o) => ({
        ...o,
        [listKey]: o[listKey].map((p: any) => (p.name ? { ...p, name: clip(p.name, SHORT_NAME_CHARS) } : p)),
      }),
    },
  ];
  for (let i = 0; i < 20; i++) {
    trims.push({
      label: "cut list",
      apply: (o) => (o[listKey].length > minKeep ? { ...o, [listKey]: o[listKey].slice(0, -1) } : o),
    });
  }
  return trims;
}

function makeHandlers(opts: RouterOptions): Record<string, Handler> {
  const styleTimeout = opts.styleOutfitTimeoutMs ?? DEFAULT_STYLE_OUTFIT_TIMEOUT_MS;
  const styleMode = opts.styleOutfitMode ?? "await";
  const log = opts.logger ?? ((line: string) => console.log(line));
  const threshold = opts.trimThresholdBytes ?? TRIM_THRESHOLD_BYTES;

  return {
    async search_products(raw, bridge) {
      const v = validate(raw, {
        query: { type: "string" },
        category: { type: "string" },
        max_price: { type: "number" },
        color: { type: "string" },
      });
      if (!v.ok) return err(v.error);
      const results = (await bridge.searchProducts(v.args as SearchFilters)) ?? [];
      const products = results.slice(0, MAX_SEARCH_RESULTS).map(compact);
      return {
        status: "success",
        output: {
          total_matches: results.length,
          products,
          ...(results.length === 0 ? { hint: "No matches. Suggest loosening a filter." } : {}),
        },
        trims: listTrims("products"),
      };
    },

    async show_product(raw, bridge) {
      const v = validate(raw, { product_id: { type: "string", required: true } });
      if (!v.ok) return err(v.error);
      const p = await bridge.showProduct(v.args.product_id as string);
      if (!p) return err(`I couldn't find product ${v.args.product_id}. Search again to get a valid id.`);
      return {
        status: "success",
        output: { shown: true, ...compact(p), sizes: p.sizes, colors: p.colors },
        trims: [
          { label: "drop line", apply: ({ line, ...rest }) => rest },
          { label: "short name", apply: (o) => ({ ...o, name: clip(o.name, SHORT_NAME_CHARS) }) },
          { label: "cut colors/sizes", apply: (o) => ({ ...o, colors: o.colors.slice(0, 3), sizes: o.sizes.slice(0, 8) }) },
        ],
      };
    },

    async add_to_cart(raw, bridge) {
      const v = validate(raw, {
        product_id: { type: "string", required: true },
        size: { type: "string", required: true },
      });
      if (!v.ok) return err(v.error);
      const r: AddToCartResult = await bridge.addToCart(v.args.product_id as string, v.args.size as string);
      if (!r.ok) return err(clip(r.reason || "That couldn't be added to the cart.", 200));
      return {
        status: "success",
        output: {
          added: { product_id: v.args.product_id, size: v.args.size },
          cart_count: r.cart_count,
          cart_total_usd: r.cart_total_usd,
        },
      };
    },

    async style_outfit(raw, bridge, ctx) {
      const v = validate(raw, {
        occasion: { type: "string", required: true },
        budget_usd: { type: "number" },
        notes: { type: "string" },
      });
      if (!v.ok) return err(v.error);
      const req: StyleOutfitRequest = {
        ...(v.args as Omit<StyleOutfitRequest, "conversation_id">),
        ...(ctx.conversationId ? { conversation_id: ctx.conversationId } : {}),
      };

      const run = async (): Promise<HandlerResult> => {
        let res: StylistResponse;
        try {
          res = await withTimeout(opts.styleOutfit(req), styleTimeout);
        } catch (e) {
          opts.onLog?.({ dir: "info", text: `style_outfit backend failed: ${(e as Error).message}` });
          return err(
            "The stylist couldn't finish those looks right now. Apologise briefly and offer to build it piece by piece with search instead.",
          );
        }
        if (!res || !Array.isArray(res.looks) || res.looks.length === 0) {
          return err("The stylist sent back no looks. Offer to try again.");
        }
        try {
          await bridge.showOutfit(res);
        } catch (e) {
          opts.onLog?.({ dir: "info", text: `showOutfit threw: ${(e as Error).message}` });
        }
        return { status: "success", output: compactStylist(res), trims: stylistTrims };
      };

      if (styleMode === "await" || !ctx.send) {
        if (styleMode === "background") log("[tool] style_outfit background mode needs a send function; awaiting instead");
        return run();
      }

      // Background mode: answer at once so Tavus never waits on a slow run, then push the
      // looks as a conversation.respond message when the run finishes.
      const send = ctx.send;
      void run().then((r) => {
        const text =
          r.status === "success"
            ? `[Stylist result, not said by the shopper] The looks are now on the outfit board: ${JSON.stringify(r.output)}. Tell the shopper about them using spoken_summary.`
            : `[Stylist result, not said by the shopper] ${r.output}`;
        const msg = fitRespond(ctx.conversationId, text, threshold);
        log(`[tool] style_outfit background result ${byteLength(msg)}B`);
        opts.onLog?.({ dir: "info", text: `style_outfit pushed ${r.status} via conversation.respond (${byteLength(msg)}B)` });
        try {
          send(msg);
        } catch (e) {
          log(`[tool] style_outfit background send failed: ${(e as Error).message}`);
        }
      });
      return {
        status: "success",
        output: "The stylist has started building three looks; this takes up to a minute. Keep chatting and do not call style_outfit again. The looks will arrive as a new message.",
      };
    },
  };
}

// ---- stylist result compaction ----

function compactStylist(res: StylistResponse) {
  return {
    spoken_summary: res.spoken_summary,
    looks: res.looks.map((l) => ({
      outfit_name: l.outfit_name,
      total_usd: l.total_usd,
      items: (l.items ?? []).map((it) =>
        it.product_id ? { product_id: it.product_id, slot: it.slot } : { closet_item: clip(it.closet_item ?? "", SHORT_NAME_CHARS), slot: it.slot },
      ),
    })),
  };
}

const stylistTrims: NonNullable<HandlerResult["trims"]> = [
  { label: "short summary", apply: (o) => ({ ...o, spoken_summary: clip(o.spoken_summary ?? "", 300) }) },
  {
    label: "short names",
    apply: (o) => ({ ...o, looks: o.looks.map((l: any) => ({ ...l, outfit_name: clip(l.outfit_name, SHORT_NAME_CHARS) })) }),
  },
  ...Array.from({ length: 10 }, () => ({
    label: "cut looks",
    apply: (o: any) => (o.looks.length > 1 ? { ...o, looks: o.looks.slice(0, -1) } : o),
  })),
  {
    label: "drop items",
    apply: (o) => ({ ...o, looks: o.looks.map(({ items, ...l }: any) => l) }),
  },
];

/** Tavus "respond" interaction: the avatar replies to `text` as if it were a user turn. */
export interface RespondMessage {
  message_type: "conversation";
  event_type: "conversation.respond";
  conversation_id: string;
  properties: { text: string };
}

function fitRespond(conversationId: string, text: string, threshold: number): RespondMessage {
  const make = (t: string): RespondMessage => ({
    message_type: "conversation",
    event_type: "conversation.respond",
    conversation_id: conversationId,
    properties: { text: t },
  });
  let msg = make(text);
  while (byteLength(msg) > threshold && text.length > 200) {
    text = text.slice(0, Math.floor(text.length * 0.8));
    msg = make(text + "…");
  }
  return msg;
}

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  let t: ReturnType<typeof setTimeout>;
  return Promise.race([
    p,
    new Promise<T>((_, reject) => {
      t = setTimeout(() => reject(new Error(`timed out after ${ms}ms`)), ms);
    }),
  ]).finally(() => clearTimeout(t));
}

// ---- router ----

export function createRouter(opts: RouterOptions) {
  const handlers = makeHandlers(opts);
  const log = opts.logger ?? ((line: string) => console.log(line));
  const threshold = opts.trimThresholdBytes ?? TRIM_THRESHOLD_BYTES;
  const getBridge = typeof opts.bridge === "function" ? opts.bridge : () => opts.bridge as ShopBridge;
  const seen = new Set<string>();

  /**
   * Returns the tool_result message to send back, or null if `msg` isn't a tool call
   * (or is a duplicate). Never throws.
   */
  async function handle(msg: unknown, send?: (msg: RespondMessage) => void): Promise<ToolResultMessage | null> {
    if (!isToolCall(msg)) return null;
    const started = Date.now();
    const { name } = msg.properties;
    const toolCallId = msg.properties.tool_call_id ?? msg.properties.inference_id ?? msg.inference_id ?? "";
    if (!msg.properties.tool_call_id) log(`[tool] ${name} WARNING: no tool_call_id on incoming call`);
    if (toolCallId && seen.has(toolCallId)) {
      log(`[tool] ${name} duplicate ${toolCallId} ignored`);
      return null;
    }
    if (toolCallId) seen.add(toolCallId);

    let result: HandlerResult;
    let args: unknown = msg.properties.arguments;
    try {
      args = parseArguments(msg.properties.arguments);
      opts.onLog?.({ dir: "in", tool: name, tool_call_id: toolCallId, args });
      const handler = Object.hasOwn(handlers, name) ? handlers[name] : undefined;
      const bridge = getBridge();
      if (!handler) result = err(`Unknown tool ${name}.`);
      else if (!bridge) result = err("The shop page isn't ready yet. Try again in a moment.");
      else result = await handler(args as Record<string, unknown>, bridge, { conversationId: msg.conversation_id, send });
    } catch (e) {
      if (e instanceof SyntaxError && typeof msg.properties.arguments === "string") {
        opts.onLog?.({ dir: "in", tool: name, tool_call_id: toolCallId, args });
        result = err("I couldn't read those tool arguments. Try again.");
      } else {
        log(`[tool] ${name} handler error: ${(e as Error)?.message ?? e}`);
        result = err(`Something went wrong with ${name.replace(/_/g, " ")}. Try once more.`);
      }
    }

    const make = (output: HandlerResult["output"]): ToolResultMessage => ({
      message_type: "conversation",
      event_type: "conversation.tool_result",
      conversation_id: msg.conversation_id,
      properties: { tool_call_id: toolCallId, output, status: result.status },
    });

    let message = make(result.output);
    let bytes = byteLength(message);
    const trimmed: string[] = [];
    const originalBytes = bytes;
    for (const step of result.trims ?? []) {
      if (bytes <= threshold) break;
      const next = make(step.apply(message.properties.output));
      const nextBytes = byteLength(next);
      if (nextBytes < bytes) {
        message = next;
        bytes = nextBytes;
        if (trimmed[trimmed.length - 1] !== step.label) trimmed.push(step.label);
      }
    }
    if (bytes > threshold) {
      // Last resort: still too big after every trim. Never send a message Tavus would drop.
      message = make("Done. The details were too long to send; describe what is on screen instead.");
      bytes = byteLength(message);
      trimmed.push("replaced output");
    }

    const ms = Date.now() - started;
    if (trimmed.length) log(`[tool] ${name} trimmed ${originalBytes}B -> ${bytes}B (${trimmed.join(", ")})`);
    log(`[tool] ${name} ${bytes}B ${ms}ms${result.status === "error" ? " error" : ""}`);
    opts.onLog?.({
      dir: "out",
      tool: name,
      tool_call_id: toolCallId,
      status: result.status,
      bytes,
      ms,
      trimmed,
      output: message.properties.output,
    });
    return message;
  }

  return { handle };
}

export type ToolRouter = ReturnType<typeof createRouter>;
