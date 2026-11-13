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

`tests/` has the vision and voice tests, plus the try-on tests: `node tests/try-on-outfits.ts [photo] [outfits] [model] [studio|room]` puts several full outfits on a photo at the same time (`snapshot.jpg` is saved during a call). The agent log now shows both sides of the conversation (`YOU:` / `SASHA:`). `casting/index.html` is the page used to compare voices; the audio clips are not in git.

## Agreed for the hackathon build (2026-11-12)

- **Opening:** Sasha starts full screen. The shopper's camera turns on right away and they see themselves in a small preview, so it's obvious she can see them. The first time she puts products on screen, she shrinks into the corner for the rest of the session.
- **First read:** after "Hi, I'm Mike," she says what she sees ("navy track jacket over a white tee, very off-duty"), pulls up pieces in that lane, then asks: "Is that the vibe today, or are we dressing you for something?" Camera off: she skips the read and asks the question.
- **Just In:** 116 items (about 1 in 9, spread across every department) are marked `simulated.just_in`, shown as "Just in" pills in the store, with a Just In page and filter. `search_products` takes `just_in: true`, so when she says something just came in, it's true.
- **Try-on reveal:** Sasha pulls up three outfits and says one line about each and how they differ. The shopper picks one, she explains how the pieces work together, then asks "Want to see it on you?" and the try-on appears. All three try-ons start as soon as the outfits are on screen, so the reveal is instant. Use Nano Banana 2 (`gemini-3.1-flash-image`) in studio mode: the shopper head to toe on a white photo set. Three outfits at once took 7.4 s in testing. Lite was faster but copied the product photo and cut off the face. Needs our own call page to show the image, since the LiveKit console can't.
- **Catalog knowledge:** no RAG. A one-page cheat sheet in her prompt, a fast search tool over Gemini embeddings of the enriched catalog, and about 100 to 150 pre-built outfits with "complete the look" matches.

## Enriched catalog

`catalog/enriched.json` adds stylist fields to all 1,046 products, keyed by product id: outfit `slot`, `photo_color` and `color_family` (what the photo shows; `listed_colors` has every color sold), `pattern`, `fabric`, `fit`, `formality` (1 gym to 5 black tie), `seasons`, `occasions`, a factual `visual_description` for search, a `sasha_line` in her voice, and `pairs_with`.

Made by `node catalog/enrich.ts` (Gemini 3.5 Flash Lite reads each product photo and text; re-runs skip finished items), then `node catalog/cleanup.ts` (photo vs listed colors, tuxedos and gowns to formality 5, rewrites repeated Sasha lines). Three items have photos that don't match their title (WW-0256, WW-0316, WW-0349), marked `photo_matches_title: false`.
