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
- **Personality:** still a short stand-in. The real Sasha prompt in `pal/system-prompt.md` hasn't been ported yet.

`tests/` has the vision and voice tests. `casting/index.html` is the page used to compare voices; the audio clips are not in git.
