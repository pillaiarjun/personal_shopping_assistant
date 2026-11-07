import { useEffect, useMemo, useState } from "react";
import AvatarCall from "../../AvatarCall";
import { createRouter, type RouterLogEntry } from "../../router";
import { windowShop } from "../../shop-bridge";
import { httpStyleOutfit } from "../../style-outfit";
import type { Product } from "../../../contracts/product";
import { createFakeShop, type ShopView } from "./fake-shop";
import { PRESETS, toolCall } from "./mocks";
import { STUB_PRODUCTS } from "./stub-products";

type LogRow = RouterLogEntry & { at: string };

const swatch = (p: Product) => {
  let h = 0;
  for (const c of p.id + p.colors[0]) h = (h * 31 + c.charCodeAt(0)) % 360;
  return `hsl(${h} 25% 78%)`;
};

export default function App() {
  const [view, setView] = useState<ShopView>({ filters: {}, results: STUB_PRODUCTS, shown: null, cart: [], outfit: null });
  const [log, setLog] = useState<LogRow[]>([]);
  const [config, setConfig] = useState<{ tavus_api_key: boolean; tavus_pal_id: boolean; style_outfit: string }>();
  const [conv, setConv] = useState<{ conversation_id: string; conversation_url: string } | null>(null);
  const [callState, setCallState] = useState("idle");
  const [custom, setCustom] = useState(() => JSON.stringify(toolCall("search_products", { query: "boots" }), null, 2));

  // Fake shop on window.shop, exactly where Arjun's page will put the real one.
  useEffect(() => {
    window.shop = createFakeShop(STUB_PRODUCTS, setView);
    fetch("/api/config").then((r) => r.json()).then(setConfig).catch(() => {});
    return () => void (window.shop = undefined);
  }, []);

  const router = useMemo(
    () =>
      createRouter({
        bridge: windowShop,
        styleOutfit: httpStyleOutfit("/api/style-outfit"),
        onLog: (e) => setLog((l) => [{ ...e, at: new Date().toLocaleTimeString() }, ...l].slice(0, 200)),
      }),
    [],
  );

  const runMock = async (msg: unknown) => {
    const result = await router.handle(msg);
    console.log("[harness] tool_result", result);
  };

  const startCall = async () => {
    if (!confirm("Start a LIVE Tavus call? This uses shared call minutes.")) return;
    setCallState("creating");
    const r = await fetch("/api/conversation", { method: "POST", body: "{}" });
    const data = await r.json();
    if (!r.ok) {
      setCallState(`error: ${data.error}`);
      return;
    }
    setConv(data);
  };

  const endCall = async () => {
    if (conv) await fetch("/api/conversation/end", { method: "POST", body: JSON.stringify({ conversation_id: conv.conversation_id }) });
    setConv(null);
    setCallState("ended");
  };

  const byId = (id: string) => STUB_PRODUCTS.find((p) => p.id === id);
  const cartTotal = view.cart.reduce((s, l) => s + l.product.price_usd, 0);
  const activeFilters = Object.entries(view.filters).filter(([, v]) => v !== undefined && v !== "");

  return (
    <div className="layout">
      <main className="shop">
        <header className="shop-head">
          <h1>Fake shop</h1>
          <span className="cart">
            Cart: {view.cart.length} item{view.cart.length === 1 ? "" : "s"} · ${cartTotal}
          </span>
        </header>

        <div className="filters">
          {activeFilters.length === 0 ? (
            <span className="muted">No filters</span>
          ) : (
            activeFilters.map(([k, v]) => (
              <span key={k} className="chip">
                {k}: {String(v)}
              </span>
            ))
          )}
          <span className="muted">· {view.results.length} results</span>
        </div>

        {view.outfit && (
          <section className="outfit">
            <h2>
              {view.outfit.outfit_name} <span className="muted">${view.outfit.total_usd}</span>
            </h2>
            <p>{view.outfit.spoken_summary}</p>
            <div className="outfit-items">
              {view.outfit.items.map((it) => {
                const p = byId(it.product_id);
                return (
                  <div key={it.product_id} className="outfit-item">
                    <b>{it.slot}</b> {p?.name ?? it.product_id}
                    <div className="muted">{it.why}</div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {view.shown && (
          <section className="detail">
            <div className="tile big" style={{ background: swatch(view.shown) }} />
            <div>
              <h2>{view.shown.name}</h2>
              <div className="muted">
                {view.shown.brand} · ${view.shown.price_usd} · {view.shown.id}
              </div>
              <p>{view.shown.description}</p>
              <div>Sizes: {view.shown.sizes.join(", ")}</div>
              <div>Colors: {view.shown.colors.join(", ")}</div>
            </div>
          </section>
        )}

        <div className="grid">
          {view.results.map((p) => (
            <div key={p.id} className={`card ${view.shown?.id === p.id ? "active" : ""}`}>
              <div className="tile" style={{ background: swatch(p) }} />
              <div className="name">{p.name}</div>
              <div className="muted">
                {p.brand} · ${p.price_usd}
              </div>
              <div className="muted small">{p.id}</div>
            </div>
          ))}
        </div>
      </main>

      <aside className="side">
        <section className="panel">
          <h3>Avatar</h3>
          <div className="muted small">
            key {config?.tavus_api_key ? "✓" : "✗"} · PAL {config?.tavus_pal_id ? "✓" : "✗"} · style_outfit:{" "}
            {config?.style_outfit ?? "?"} · {callState}
          </div>
          {conv ? (
            <>
              <AvatarCall
                conversationUrl={conv.conversation_url}
                router={router}
                onStatus={(s, d) => setCallState(d ? `${s}: ${d}` : s)}
                onAppMessage={(dir, data) => console.log(`[harness] app-message ${dir}`, data)}
                style={{ width: "100%", aspectRatio: "16 / 9", borderRadius: 8, marginTop: 8 }}
              />
              <button onClick={endCall}>End call</button>
            </>
          ) : (
            <button disabled={!config?.tavus_api_key || !config?.tavus_pal_id} onClick={startCall}>
              Start live call (uses minutes)
            </button>
          )}
        </section>

        <section className="panel">
          <h3>Mock tool calls</h3>
          <div className="presets">
            {PRESETS.map((p) => (
              <button key={p.label} onClick={() => runMock(p.make())}>
                {p.label}
              </button>
            ))}
          </div>
          <textarea value={custom} onChange={(e) => setCustom(e.target.value)} rows={8} spellCheck={false} />
          <button
            onClick={() => {
              try {
                runMock(JSON.parse(custom));
              } catch (e) {
                alert(`Invalid JSON: ${(e as Error).message}`);
              }
            }}
          >
            Send custom message
          </button>
        </section>

        <section className="panel log">
          <h3>
            Tool log <button onClick={() => setLog([])}>clear</button>
          </h3>
          {log.map((e, i) => (
            <div key={i} className={`row ${e.dir} ${e.dir === "out" ? e.status : ""}`}>
              <span className="muted">{e.at}</span>{" "}
              {e.dir === "in" && (
                <>
                  → <b>{e.tool}</b> <code>{JSON.stringify(e.args)}</code>
                </>
              )}
              {e.dir === "out" && (
                <>
                  ← <b>{e.tool}</b> {e.status} {e.bytes}B {e.ms}ms
                  {e.trimmed.length > 0 && <span className="warn"> trimmed: {e.trimmed.join(", ")}</span>}
                  <code>{JSON.stringify(e.output)}</code>
                </>
              )}
              {e.dir === "info" && <>ℹ {e.text}</>}
            </div>
          ))}
        </section>
      </aside>
    </div>
  );
}
