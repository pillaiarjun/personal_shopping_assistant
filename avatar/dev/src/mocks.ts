// Mocked `conversation.tool_call` app messages, shaped like the Tavus docs example.
import type { ToolCallMessage } from "../../router";

let n = 0;
export function toolCall(name: string, args: Record<string, unknown> | string): ToolCallMessage {
  n += 1;
  return {
    message_type: "conversation",
    event_type: "conversation.tool_call",
    conversation_id: "mock-conversation",
    properties: {
      name,
      arguments: typeof args === "string" ? args : JSON.stringify(args),
      tool_call_id: `call_mock_${Date.now()}_${n}`,
    },
  };
}

export const PRESETS: Array<{ label: string; make: () => ToolCallMessage }> = [
  { label: "search: linen under $80", make: () => toolCall("search_products", { query: "linen", max_price: 80 }) },
  { label: "search: navy", make: () => toolCall("search_products", { color: "navy" }) },
  { label: "search: jackets under $250", make: () => toolCall("search_products", { category: "jacket", max_price: 250 }) },
  { label: "show jkt-001", make: () => toolCall("show_product", { product_id: "jkt-001" }) },
  { label: "add jkt-001 size M", make: () => toolCall("add_to_cart", { product_id: "jkt-001", size: "M" }) },
  { label: "add bad size", make: () => toolCall("add_to_cart", { product_id: "jkt-001", size: "XXL" }) },
  {
    label: "style: Italy wedding $800",
    make: () =>
      toolCall("style_outfit", {
        occasion: "summer wedding in Italy",
        budget_usd: 800,
        response_to_user: "Let me pull some looks together.",
      }),
  },
  {
    label: "style rework: shoes too formal",
    make: () => toolCall("style_outfit", { occasion: "summer wedding in Italy", budget_usd: 800, notes: "the shoes are too formal" }),
  },
  { label: "style: backend fails", make: () => toolCall("style_outfit", { occasion: "office", notes: "fail" }) },
  { label: "bad args", make: () => toolCall("show_product", {}) },
  { label: "unknown tool", make: () => toolCall("checkout", {}) },
];
