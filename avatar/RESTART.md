# Restart here

Resume prompt: "Read avatar/RESTART.md, avatar/HISTORY.md and avatar/TEAM_PLAN.md, then continue the avatar work."

## Done (committed on soham/avatar-skeleton)
- contracts/ drafts: product.ts, stylist.ts, shop-bridge.ts (window.shop). All need sign-off.
- avatar/: tools.json, router.ts, shop-bridge.ts, style-outfit.ts (http client + mock), create-conversation.ts (Fetch-API handlers for Jing), register-tools.ts (registry + attach, `--dry`), AvatarCall.tsx (daily-js), .env.example, .gitignore.
- avatar/dev/ harness written: package.json, tsconfig, vite.config.ts (local /api routes), src/App.tsx, fake-shop.ts, mocks.ts, stub-products.ts, styles.css.
  - **Not yet installed, built or run.**

## Done in session 2 (2026-11-07)
- Step 0: switched to the TEAM_PLAN stylist shape (`looks[]`, `closet_item`, `lookbook_artifact`). Updated contracts/stylist.ts (it also adds an optional `conversation_id` to the request), the router, the mock (three looks, demo closet), the fake-shop board, the stub catalog (`jkt-001` ids, singular categories) and tools.json descriptions.
- Router `styleOutfitMode: "background"`: replies at once, then pushes the looks as a `conversation.respond` app message. This is the fallback if Tavus drops slow results. `handle(msg, send)`: AvatarCall passes send. The harness has a checkbox for it.
- The style_outfit timeout went from 45 s to 90 s (the plan's target run is < 60 s).
- Steps 1–3: install, typecheck and tests are all green (21 tests in avatar/test/router.test.ts).
- Step 4 (partial): the dev server runs on :5175. /api/config and the mock /api/style-outfit respond. The Vite dedupe resolves react and daily-js for ../AvatarCall.tsx. **The browser click-through is still not done.**

## Next steps
4. Open http://localhost:5175 and click every preset, including the background-mode checkbox. Check the outfit board and the log.
5. Before a live call: get the PAL ID and key from Mike, run `register-tools -- --dry`, then the real register-tools. **Ask Soham before the first live call.**
6. Push the branch only after Mike's main exists (see HISTORY.md), then rebase onto main.
7. Final report must list: files, doc uncertainties, contracts drafts, and asks for Mike (PAL ID, key, does the PAL have a default face?, put "don't call style_outfit twice" plus the filler behaviour in the PAL prompt), Jing (route path, one-line import of handleCreateConversation, style-outfit request body incl. conversation_id for Session keying, and confirm the route returns the plan's looks[] shape) and Arjun (window.shop per contracts/shop-bridge.ts).
8. Before the live 60–90 s test, verify the `conversation.respond` event name and its `properties.text` field in the Tavus docs ("Interactions protocol"). Background mode relies on them, and they are unverified.
