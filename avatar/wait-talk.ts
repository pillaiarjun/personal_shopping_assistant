// Keeps Sasha talking during a style_outfit run, so the shopper isn't left in silence.
// Every so often it passes the latest agent step to her as a [Stylist update] message.
// It only speaks up in a quiet moment, so she never talks over the shopper or herself.

export interface WaitTalkOptions {
  /** Sends the text to Sasha, e.g. as a conversation.respond message. */
  say: (text: string) => void;
  /** Milliseconds since anyone last spoke. 0 while someone is speaking. */
  quietMs: (now: number) => number;
  firstMs?: number; // wait before the first update; her filler line covers the start
  everyMs?: number; // gap between updates
  maxUpdates?: number; // per run
  quietNeededMs?: number; // silence needed before an update goes out
}

export function waitTalkText(step: string | undefined): string {
  const doing = step ? `The styling agent is on this step: "${step}".` : "The styling agent is still working.";
  return `[Stylist update, not said by the shopper] ${doing} Keep him company in one or two short sentences. Don't name products or prices.`;
}

export function createWaitTalk(opts: WaitTalkOptions) {
  const firstMs = opts.firstMs ?? 12_000;
  const everyMs = opts.everyMs ?? 14_000;
  const maxUpdates = opts.maxUpdates ?? 4;
  const quietNeededMs = opts.quietNeededMs ?? 2_500;
  let running = false;
  let nextAt = 0;
  let sent = 0;
  let step: string | undefined;

  return {
    start(now: number) {
      running = true;
      nextAt = now + firstMs;
      sent = 0;
      step = undefined;
    },
    step(label: string | undefined) {
      if (label) step = label;
    },
    stop() {
      running = false;
    },
    /** Call about once a second while a run is going. */
    tick(now: number) {
      if (!running || sent >= maxUpdates || now < nextAt) return;
      if (opts.quietMs(now) < quietNeededMs) return;
      opts.say(waitTalkText(step));
      sent += 1;
      nextAt = now + everyMs;
    },
  };
}
