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
