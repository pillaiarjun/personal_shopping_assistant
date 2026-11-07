# avatar/ (Soham) — Tavus video stylist layer
- Edit only avatar/. contracts/ = shared DRAFTS (need teammate OK). Never touch root files, app/, data/, agent/, pal/.
- Branch soham/avatar-skeleton. Small commits. No keys in git (avatar/.env, gitignored).
- Never start a live Tavus call (shared minutes); test with mocks; ask Soham first.
- Tavus API: PAL-era names (pal_id, face_id); tools via registry /v2/tools + /v2/pals/{id}/tools (inline layers.llm.tools is legacy, no on_call/on_resolve).
- Tests: `npm --prefix avatar/dev test`. Harness: `npm --prefix avatar/dev run dev` (port 5175).
- Resume state: avatar/RESTART.md. Decisions/log: avatar/HISTORY.md.
