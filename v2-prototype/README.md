# Sasha V2 prototype

A small test of the Gemini hackathon setup: Gemini Live is Sasha's voice, brain and eyes, and a Tavus face (Olivia) lip-syncs to her. Built on LiveKit Agents (Node).

## Run it

1. `npm install`
2. Copy `.env.local.example` to `.env.local` and add your keys.
3. `node agent.ts dev`
4. Talk to her in the LiveKit Agent Console (cloud.livekit.io → Agents → Launch Console). Turn on your camera, and wear headphones so her voice doesn't echo into the mic.

## What we learned

- **Voice and look:** the Tavus Olivia face with the Gemini Aoede voice.
- **Vision:** camera frames have to go into Gemini Live's `video` input. The LiveKit Node plugin sends them as `media`, which gemini-3.8-live ignores, so `agent.ts` patches that. LiveKit Inference drops images, so use your own Google key (`GEMINI=google`).
- **Speed:** Gemini starts answering in about 0.2–1.2 s. The long pauses came from turn-taking and from speaker echo making her interrupt herself. Set to low start sensitivity, high end sensitivity and 500 ms of silence.
- **Google free tier:** it limits how many live sessions can run at once. Turn on billing before the hackathon.
- **Personality:** `sasha-prompt.md` is the real Sasha prompt from `pal/system-prompt.md`, adapted for Gemini: same attitude at a calmer pace, store tools taken out for now, camera review rules kept.

`tests/` has the vision and voice tests. `casting/index.html` is the page used to compare voices; the audio clips are not in git.

## Agreed for the hackathon build (2026-11-12)

- **Opening:** Sasha starts full screen. The shopper's camera turns on right away and they see themselves in a small preview, so it's obvious she can see them. The first time she puts products on screen, she shrinks into the corner for the rest of the session.
- **First read:** after "Hi, I'm Mike," she says what she sees ("navy track jacket over a white tee, very off-duty"), pulls up pieces in that lane, then asks: "Is that the vibe today, or are we dressing you for something?" Camera off: she skips the read and asks the question.
- **Just In:** 116 items (about 1 in 9, spread across every department) are marked `simulated.just_in`, shown as "Just in" pills in the store, with a Just In page and filter. `search_products` takes `just_in: true`, so when she says something just came in, it's true.
- **Catalog knowledge:** no RAG. A one-page cheat sheet in her prompt, a fast search tool over Gemini embeddings of the enriched catalog, and about 100 to 150 pre-built outfits with "complete the look" matches.
