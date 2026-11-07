// Router tests: node:test via tsx. Run with `npm --prefix avatar/dev test`.
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Product } from "../../contracts/product";
import type { ShopBridge } from "../../contracts/shop-bridge";
import type { StylistResponse } from "../../contracts/stylist";
import { createFakeShop } from "../dev/src/fake-shop";
import { STUB_PRODUCTS } from "../dev/src/stub-products";
import {
  byteLength,
  createRouter,
  MAX_APP_MESSAGE_BYTES,
  type RespondMessage,
  type RouterOptions,
  type ToolCallMessage,
  type ToolResultMessage,
} from "../router";
import { mockStyleOutfit, type StyleOutfitFn } from "../style-outfit";

let n = 0;
function call(name: string, args: Record<string, unknown> | string, conversation_id = "conv-1"): ToolCallMessage {
  return {
    message_type: "conversation",
    event_type: "conversation.tool_call",
    conversation_id,
    properties: { name, arguments: typeof args === "string" ? args : JSON.stringify(args), tool_call_id: `call_${++n}` },
  };
}

/** Wraps the fake shop and records every bridge call. */
function spyShop(catalog: Product[] = STUB_PRODUCTS) {
  const calls: Array<[string, unknown[]]> = [];
  const inner = createFakeShop(catalog, () => {});
  const bridge = new Proxy(inner, {
    get(target, key: keyof ShopBridge) {
      const fn = target[key] as (...a: unknown[]) => unknown;
      return (...args: unknown[]) => {
        calls.push([key, args]);
        return fn.apply(target, args);
      };
    },
  }) as ShopBridge;
  return { bridge, calls };
}

function setup(over: Partial<RouterOptions> = {}, catalog?: Product[]) {
  const shop = spyShop(catalog);
  const lines: string[] = [];
  const router = createRouter({
    bridge: shop.bridge,
    styleOutfit: mockStyleOutfit(STUB_PRODUCTS, 0),
    logger: (l) => lines.push(l),
    ...over,
  });
  return { ...shop, router, lines };
}

function assertWellFormed(r: ToolResultMessage | null, id?: string): asserts r is ToolResultMessage {
  assert.ok(r, "expected a tool_result");
  assert.equal(r.message_type, "conversation");
  assert.equal(r.event_type, "conversation.tool_result");
  assert.equal(r.conversation_id, "conv-1");
  if (id) assert.equal(r.properties.tool_call_id, id);
  assert.ok(byteLength(r) < MAX_APP_MESSAGE_BYTES, `result is ${byteLength(r)}B`);
}

describe("search_products", () => {
  it("filters through the bridge and returns at most 5 compact products", async () => {
    const { router, calls } = setup();
    const msg = call("search_products", { category: "shirt", max_price: "$80" });
    const r = await router.handle(msg);
    assertWellFormed(r, msg.properties.tool_call_id);
    assert.deepEqual(calls[0], ["searchProducts", [{ category: "shirt", max_price: 80 }]]);
    const out = r.properties.output as any;
    assert.equal(r.properties.status, "success");
    assert.ok(out.products.length > 0 && out.products.length <= 5);
    for (const p of out.products) {
      assert.deepEqual(Object.keys(p).sort(), ["id", "line", "name", "price_usd"]);
      assert.ok(p.price_usd <= 80);
    }
  });

  it("adds a hint when nothing matches", async () => {
    const { router } = setup();
    const r = await router.handle(call("search_products", { query: "tuxedo kilt" }));
    assertWellFormed(r);
    assert.equal((r.properties.output as any).total_matches, 0);
    assert.match((r.properties.output as any).hint, /loosening/);
  });

  it("trims an oversized search below the threshold", async () => {
    const huge: Product[] = Array.from({ length: 30 }, (_, i) => ({
      ...STUB_PRODUCTS[0],
      id: `big-${String(i).padStart(3, "0")}-${"x".repeat(200)}`,
      name: "Very ".repeat(200) + "long name",
      description: "word ".repeat(400) + ".",
    }));
    const { router, lines } = setup({}, huge);
    const r = await router.handle(call("search_products", {}));
    assertWellFormed(r);
    assert.ok(byteLength(r) <= 3500);
    assert.ok(lines.some((l) => l.includes("trimmed")), lines.join("\n"));
  });
});

describe("show_product", () => {
  it("opens the product and returns sizes", async () => {
    const { router, calls } = setup();
    const r = await router.handle(call("show_product", { product_id: "jkt-001" }));
    assertWellFormed(r);
    assert.deepEqual(calls[0], ["showProduct", ["jkt-001"]]);
    const out = r.properties.output as any;
    assert.equal(out.shown, true);
    assert.equal(out.id, "jkt-001");
    assert.deepEqual(out.sizes, ["S", "M", "L", "XL"]);
  });

  it("returns an error for an unknown id", async () => {
    const { router } = setup();
    const r = await router.handle(call("show_product", { product_id: "nope-999" }));
    assertWellFormed(r);
    assert.equal(r.properties.status, "error");
  });
});

describe("add_to_cart", () => {
  it("adds and returns cart totals", async () => {
    const { router, calls } = setup();
    const r = await router.handle(call("add_to_cart", { product_id: "jkt-001", size: "M" }));
    assertWellFormed(r);
    assert.deepEqual(calls[0], ["addToCart", ["jkt-001", "M"]]);
    assert.deepEqual(r.properties.output, {
      added: { product_id: "jkt-001", size: "M" },
      cart_count: 1,
      cart_total_usd: 240,
    });
  });

  it("passes the shop's reason back for a bad size", async () => {
    const { router } = setup();
    const r = await router.handle(call("add_to_cart", { product_id: "jkt-001", size: "XXL" }));
    assertWellFormed(r);
    assert.equal(r.properties.status, "error");
    assert.match(String(r.properties.output), /XXL/);
  });
});

describe("style_outfit", () => {
  it("sends looks to the outfit board and a compact result to the avatar", async () => {
    let seen: unknown;
    const { router, calls } = setup({
      styleOutfit: async (req) => {
        seen = req;
        return mockStyleOutfit(STUB_PRODUCTS, 0)(req);
      },
    });
    const r = await router.handle(
      call("style_outfit", { occasion: "summer wedding in Italy", budget_usd: 800, response_to_user: "One moment." }),
    );
    assertWellFormed(r);
    assert.deepEqual(seen, { occasion: "summer wedding in Italy", budget_usd: 800, conversation_id: "conv-1" });
    assert.equal(calls[0][0], "showOutfit");
    const board = calls[0][1][0] as StylistResponse;
    assert.equal(board.looks.length, 3);
    const out = r.properties.output as any;
    assert.equal(r.properties.status, "success");
    assert.equal(out.looks.length, 3);
    assert.ok(out.spoken_summary);
    for (const look of out.looks) {
      for (const it of look.items) {
        assert.ok(it.slot);
        assert.ok(it.product_id || it.closet_item);
        assert.equal(it.why, undefined, "why stays on the page, not in the avatar result");
      }
    }
    assert.ok(out.looks.some((l: any) => l.items.some((it: any) => it.closet_item)), "reuses a closet item");
  });

  it("passes rework notes through", async () => {
    let seen: any;
    const { router } = setup({
      styleOutfit: async (req) => ((seen = req), mockStyleOutfit(STUB_PRODUCTS, 0)(req)),
    });
    await router.handle(call("style_outfit", { occasion: "wedding", notes: "the shoes are too formal" }));
    assert.equal(seen.notes, "the shoes are too formal");
  });

  it("trims a huge stylist response", async () => {
    const bigLook = {
      outfit_name: "Name ".repeat(100),
      total_usd: 999,
      items: Array.from({ length: 20 }, (_, i) => ({ product_id: `id-${i}-${"z".repeat(60)}`, slot: "jacket", why: "x" })),
    };
    const { router } = setup({
      styleOutfit: async () => ({ looks: Array(6).fill(bigLook), spoken_summary: "s".repeat(2000), lookbook_artifact: "a" }),
    });
    const r = await router.handle(call("style_outfit", { occasion: "x" }));
    assertWellFormed(r);
    assert.equal(r.properties.status, "success");
    assert.ok(byteLength(r) <= 3500);
  });

  it("returns an error for an empty response", async () => {
    const { router } = setup({ styleOutfit: async () => ({ looks: [], spoken_summary: "" }) });
    const r = await router.handle(call("style_outfit", { occasion: "x" }));
    assertWellFormed(r);
    assert.equal(r.properties.status, "error");
  });

  it("returns a speakable error on timeout", async () => {
    const { router } = setup({
      styleOutfit: () => new Promise(() => {}),
      styleOutfitTimeoutMs: 30,
    });
    const r = await router.handle(call("style_outfit", { occasion: "x" }));
    assertWellFormed(r);
    assert.equal(r.properties.status, "error");
    assert.match(String(r.properties.output), /couldn't finish/);
  });

  it("background mode replies at once and pushes the looks later", async () => {
    let release!: () => void;
    const gate = new Promise<void>((r) => (release = r));
    const pushed: RespondMessage[] = [];
    const { router, calls } = setup({
      styleOutfitMode: "background",
      styleOutfit: async (req) => {
        await gate;
        return mockStyleOutfit(STUB_PRODUCTS, 0)(req);
      },
    });
    const r = await router.handle(call("style_outfit", { occasion: "wedding" }), (m) => pushed.push(m));
    assertWellFormed(r);
    assert.equal(r.properties.status, "success");
    assert.match(String(r.properties.output), /started/);
    assert.equal(pushed.length, 0);
    release();
    await new Promise((r) => setTimeout(r, 20));
    assert.equal(pushed.length, 1);
    assert.equal(pushed[0].event_type, "conversation.respond");
    assert.equal(pushed[0].conversation_id, "conv-1");
    assert.ok(byteLength(pushed[0]) < MAX_APP_MESSAGE_BYTES);
    assert.equal(calls[0][0], "showOutfit");
  });
});

describe("errors never throw", () => {
  it("bad args", async () => {
    const { router, calls } = setup();
    const r = await router.handle(call("show_product", {}));
    assertWellFormed(r);
    assert.equal(r.properties.status, "error");
    assert.equal(calls.length, 0);
  });

  it("non-number price", async () => {
    const { router } = setup();
    const r = await router.handle(call("search_products", { max_price: "cheap" }));
    assertWellFormed(r);
    assert.equal(r.properties.status, "error");
  });

  it("malformed JSON arguments", async () => {
    const { router } = setup();
    const r = await router.handle(call("search_products", "{not json"));
    assertWellFormed(r);
    assert.equal(r.properties.status, "error");
  });

  it("unknown tool", async () => {
    const { router } = setup();
    const r = await router.handle(call("checkout", {}));
    assertWellFormed(r);
    assert.equal(r.properties.status, "error");
    assert.match(String(r.properties.output), /Unknown tool/);
  });

  it("missing bridge", async () => {
    const router = createRouter({ bridge: () => undefined, styleOutfit: mockStyleOutfit([], 0), logger: () => {} });
    const r = await router.handle(call("search_products", {}));
    assertWellFormed(r);
    assert.equal(r.properties.status, "error");
  });

  it("bridge that throws", async () => {
    const bridge = { searchProducts: () => { throw new Error("boom"); } } as unknown as ShopBridge;
    const router = createRouter({ bridge, styleOutfit: mockStyleOutfit([], 0), logger: () => {} });
    const r = await router.handle(call("search_products", {}));
    assertWellFormed(r);
    assert.equal(r.properties.status, "error");
  });

  it("ignores non-tool messages and duplicates", async () => {
    const { router } = setup();
    assert.equal(await router.handle({ event_type: "conversation.utterance" }), null);
    assert.equal(await router.handle(null), null);
    const msg = call("search_products", {});
    assert.ok(await router.handle(msg));
    assert.equal(await router.handle(msg), null);
  });
});

describe("tools.json", () => {
  it("matches the team plan's on_call / on_resolve table", async () => {
    const { readFileSync } = await import("node:fs");
    const tools = JSON.parse(readFileSync(new URL("../tools.json", import.meta.url), "utf8"));
    const want: Record<string, [string, string]> = {
      search_products: ["silent", "generate_response"],
      show_product: ["silent", "generate_response"],
      add_to_cart: ["silent", "generate_response"],
      style_outfit: ["generate_filler", "generate_response"],
    };
    assert.deepEqual(tools.map((t: any) => t.name).sort(), Object.keys(want).sort());
    for (const t of tools) {
      assert.deepEqual([t.on_call, t.on_resolve], want[t.name], t.name);
      assert.deepEqual(t.delivery, { app_message: true });
    }
  });
});

// Keep the StyleOutfitFn import used for type-checking the mock signature.
const _typecheck: StyleOutfitFn = mockStyleOutfit(STUB_PRODUCTS, 0);
void _typecheck;
