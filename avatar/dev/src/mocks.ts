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
  { label: "show p_009", make: () => toolCall("show_product", { product_id: "p_009" }) },
  { label: "add p_009 size 10", make: () => toolCall("add_to_cart", { product_id: "p_009", size: "10" }) },
  { label: "add bad size", make: () => toolCall("add_to_cart", { product_id: "p_009", size: "XXL" }) },
  {
    label: "style: summer wedding $400",
    make: () =>
      toolCall("style_outfit", { occasion: "summer wedding guest", budget_usd: 400, response_to_user: "Let me pull a look together." }),
  },
  { label: "style: backend fails", make: () => toolCall("style_outfit", { occasion: "office", notes: "fail" }) },
  { label: "bad args", make: () => toolCall("show_product", {}) },
  { label: "unknown tool", make: () => toolCall("checkout", {}) },
];
