# avatar/ history and decisions

## 2026-11-07, session 1
- Repo state at start: main had no commits and the remote had no refs, so Mike's scaffold wasn't there yet. Created branch soham/avatar-skeleton from the empty main. Its history is unrelated, so rebase onto main once Mike pushes. It only touches avatar/ and contracts/, so the rebase should be clean.
- The original prompt mentioned a pasted team plan, but it never arrived. Worked from the tool contract in the prompt.
- Tavus docs findings (docs.tavus.io; "persona" is now "PAL"):
  - Create conversation: `POST https://tavusapi.com/v2/conversations` with header `x-api-key`.
    - Body: `pal_id`; `face_id` (replaces replica_id; required unless the PAL has a default face); `conversation_name`, `conversational_context`, `custom_greeting`; `properties.{max_call_duration, participant_left_timeout, participant_absent_timeout}`.
    - Returns `conversation_id`, `conversation_url`, `status`, and more.
  - End conversation: `POST /v2/conversations/{id}/end`.
  - Embed: the docs recommend `@tavus/cvi-ui`, a CLI that copies files into the app (CVIProvider, Conversation, useObservableEvent, useSendAppMessage). We use `@daily-co/daily-js` directly instead (callObject, `app-message`, `sendAppMessage(msg,'*')`), so no generated files land in app/.
  - Tools: use the registry. `POST /v2/tools` takes a flat object {name, description, parameters, origin, on_call, on_resolve, delivery:{app_message:true}}. Attach with `POST /v2/pals/{pal_id}/tools` and body {tool_ids}, which is idempotent. Update with `PATCH /v2/tools/{id}` (partial object). List with `GET /v2/tools?name_or_uuid=`, which returns {data,total_count}.
  - on_call values: generate_filler (the default; it injects a `response_to_user` arg), static_filler, silent, passthrough.
  - on_resolve values: generate_response, response_in_result, add_to_context, fire_and_forget. **fire_and_forget is the default**, so always set on_resolve.
  - Incoming tool call: {message_type:"conversation", event_type:"conversation.tool_call", conversation_id, properties:{name, arguments (JSON string), tool_call_id}}.
    - The schema page is empty. The shape comes from the onboarding example.
    - The older example repo puts `inference_id` at the top level and has no tool_call_id.
  - Result: {message_type:"conversation", event_type:"conversation.tool_result", conversation_id, properties:{tool_call_id, output (string|object), status:"success"|"error"}}.
  - App messages are capped at 4 KB. Oversized messages are dropped silently.
- Design choices:
  - The router returns the full tool_result message and measures bytes on the whole message.
  - Trimming goes in this order: drop lines, shorten names, cut the list. If it's still too big, a short fallback string replaces the output.
  - Duplicate tool_call_ids are ignored.
  - `response_to_user` and other extra args are ignored.
  - style_outfit times out after 45 s, then returns a speakable fallback error.
- Not pushed yet: pushing the first branch to an empty GitHub repo would make it the default branch. Wait until Mike's main exists.

## Team plan received (saved as avatar/TEAM_PLAN.md). Differences from what's built so far
- **The stylist response shape changed.** The plan's shape is `{ looks: [{ outfit_name, items: [{ product_id? | closet_item?, slot, why }], total_usd }], spoken_summary, lookbook_artifact }`. contracts/stylist.ts, router style_outfit, mockStyleOutfit, fake-shop showOutfit and the harness outfit board all still use the old single-outfit shape. They need updating.
- Products use ids like "jkt-001", and the category is singular ("jacket"). The slots are jacket, shirt, trousers and shoes. The stub catalog and mock slot map should follow this.
- The pairing gate with Arjun is **12:30 PM** (the prompt said 1:15).
- The "shoes too formal" rework is the same style_outfit tool with notes. Jing keeps one ZooWork Session per video call, so the style-outfit request may need conversation_id to key the session. Ask Jing.
- Risk: Tavus may drop a slow tool result. The fallback is to return the style_outfit result immediately ("working on it") and push the looks later as a new message. Probably via conversation.respond or append-context; check the docs. Make it a router option, and test a 60–90 s call early.
- Soham also owns: portal registration and submission form, scripted tests, a text-box fallback if video fails, the recording and the pitch.
- The plan says to keep the contracts in a CLAUDE.md. Soham wants CLAUDE.md minimal, so the contracts stay in contracts/*.ts and TEAM_PLAN.md.

## 2026-11-07, session 2
- Switched everything to the TEAM_PLAN stylist shape. In the result sent to the avatar, the router drops each item's `why` (the page shows it) and keeps slot plus product_id or closet_item. Trim order: summary, then names, then whole looks, then item lists.
- Added background mode for style_outfit. It's unverified against the docs: `conversation.respond` with `properties.text` is from memory of the Tavus Interactions protocol. Default stays "await".
- The timeout is 90 s. The team plan says "no hard timeout" on the Tavus side; ours is only a backend safety net.
- The remote still had no refs at session start, so nothing was pushed.
