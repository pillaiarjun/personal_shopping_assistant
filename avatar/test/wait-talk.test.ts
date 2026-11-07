import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createWaitTalk, waitTalkText } from "../wait-talk";

function setup(quiet = 10_000) {
  const said: string[] = [];
  let quietMs = quiet;
  const talk = createWaitTalk({ say: (t) => said.push(t), quietMs: () => quietMs });
  return { said, talk, setQuiet: (q: number) => (quietMs = q) };
}

describe("wait talk", () => {
  it("stays silent before the first update is due", () => {
    const { said, talk } = setup();
    talk.start(0);
    talk.tick(14_000);
    assert.equal(said.length, 0);
  });

  it("passes on the latest step", () => {
    const { said, talk } = setup();
    talk.start(0);
    talk.step("Checking your closet");
    talk.step("Searching the catalog");
    talk.tick(15_000);
    assert.deepEqual(said, [waitTalkText("Searching the catalog")]);
  });

  it("spaces updates out and stops at the maximum", () => {
    const { said, talk } = setup();
    talk.start(0);
    for (let t = 0; t <= 200_000; t += 1_000) talk.tick(t);
    assert.equal(said.length, 4);
  });

  it("waits for a quiet moment", () => {
    const { said, talk, setQuiet } = setup(0);
    talk.start(0);
    talk.tick(15_000);
    assert.equal(said.length, 0);
    setQuiet(3_000);
    talk.tick(16_000);
    assert.equal(said.length, 1);
  });

  it("says nothing after the run stops", () => {
    const { said, talk } = setup();
    talk.start(0);
    talk.stop();
    talk.tick(60_000);
    assert.equal(said.length, 0);
  });

  it("never names products", () => {
    assert.match(waitTalkText(undefined), /Don't name products or prices/);
  });
});
