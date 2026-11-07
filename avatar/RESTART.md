# Restart here

Resume prompt: "Read avatar/RESTART.md and avatar/HISTORY.md, then continue the avatar work."

## Done (committed on soham/avatar-skeleton)
- contracts/ drafts: product.ts, stylist.ts, shop-bridge.ts (window.shop). All need sign-off.
- avatar/: tools.json, router.ts, shop-bridge.ts, style-outfit.ts (http client + mock), create-conversation.ts (Fetch-API handlers for Jing), register-tools.ts (registry + attach, `--dry`), AvatarCall.tsx (daily-js), .env.example, .gitignore.
- avatar/dev/ harness written: package.json, tsconfig, vite.config.ts (local /api routes), src/App.tsx, fake-shop.ts, mocks.ts, stub-products.ts, styles.css.
  - **Not yet installed, built or run.**

## Next steps
1. `npm --prefix avatar/dev install`, then `npm --prefix avatar/dev run typecheck`, and fix errors.
2. Write avatar/test/router.test.ts using node:test via tsx. Feed mocks for all 4 tools and assert:
   - the right bridge call
   - the result is under 4 KB
   - the reply shape is right
   - an oversized search gets trimmed
   - bad args, an unknown tool, a missing bridge and a style_outfit timeout each return an error and never throw
3. Run `npm --prefix avatar/dev test`.
4. Run `npm --prefix avatar/dev run dev`, open http://localhost:5175, click the mock presets, and check the fake shop and the log. Verify that the Vite `resolve.dedupe` resolves react and daily-js for ../AvatarCall.tsx.
5. Before a live call: get the PAL ID and key from Mike, run `register-tools -- --dry`, then the real register-tools. **Ask Soham before the first live call.**
6. Push the branch only after Mike's main exists (see HISTORY.md), then rebase onto main.
7. Final report must list: files, doc uncertainties, contracts drafts, and asks for Mike (PAL ID, key, does the PAL have a default face?), Jing (route path, one-line import of handleCreateConversation, style-outfit request body) and Arjun (window.shop per contracts/shop-bridge.ts).
