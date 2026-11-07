"use client";

// Joins a Tavus conversation with a Daily call object, renders the avatar's video and audio,
// and routes `conversation.tool_call` app messages through the tool router.
//
//   <AvatarCall conversationUrl={url} />                // drives window.shop, style_outfit -> /api/style-outfit
//   <AvatarCall conversationUrl={url} router={myRouter} onAppMessage={log} />
//
// Needs @daily-co/daily-js in the app's dependencies. The parent must give this a size.

import Daily, { type DailyCall, type DailyEventObjectAppMessage, type DailyParticipant } from "@daily-co/daily-js";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { createRouter, type ToolRouter } from "./router";
import { windowShop } from "./shop-bridge";
import { httpStyleOutfit } from "./style-outfit";

export type AvatarCallStatus = "joining" | "joined" | "left" | "error";

export interface AvatarCallProps {
  conversationUrl: string;
  /** Defaults to a router over window.shop with style_outfit POSTing to /api/style-outfit. */
  router?: ToolRouter;
  /** Every app message in both directions, for debug panels. */
  onAppMessage?: (dir: "in" | "out", data: unknown) => void;
  onStatus?: (status: AvatarCallStatus, detail?: string) => void;
  /** Send the shopper's camera to the avatar. Default true. */
  camera?: boolean;
  className?: string;
  style?: CSSProperties;
}

// Daily allows one call object per page. React StrictMode mounts effects twice, so every
// create/destroy goes through this queue to avoid overlapping instances.
let lifecycle: Promise<unknown> = Promise.resolve();

function isAvatar(p: DailyParticipant): boolean {
  return !p.local;
}

function playableTrack(p: DailyParticipant | undefined, kind: "video" | "audio"): MediaStreamTrack | undefined {
  const t = p?.tracks?.[kind];
  return t && t.state === "playable" ? t.persistentTrack : undefined;
}

export default function AvatarCall({
  conversationUrl,
  router,
  onAppMessage,
  onStatus,
  camera = true,
  className,
  style,
}: AvatarCallProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [status, setStatus] = useState<AvatarCallStatus>("joining");
  const [avatarPresent, setAvatarPresent] = useState(false);

  const defaultRouter = useMemo(() => createRouter({ bridge: windowShop, styleOutfit: httpStyleOutfit() }), []);
  // Read through refs so changing callbacks doesn't rejoin the call.
  const live = useRef({ router: router ?? defaultRouter, onAppMessage, onStatus });
  live.current = { router: router ?? defaultRouter, onAppMessage, onStatus };

  useEffect(() => {
    let cancelled = false;
    let call: DailyCall | undefined;

    const report = (s: AvatarCallStatus, detail?: string) => {
      if (cancelled) return;
      setStatus(s);
      live.current.onStatus?.(s, detail);
    };

    const syncMedia = () => {
      if (!call || cancelled) return;
      const avatar = Object.values(call.participants()).find(isAvatar);
      setAvatarPresent(!!avatar);
      const v = playableTrack(avatar, "video");
      const a = playableTrack(avatar, "audio");
      const vEl = videoRef.current;
      const aEl = audioRef.current;
      if (vEl) {
        const cur = (vEl.srcObject as MediaStream | null)?.getVideoTracks()[0];
        if (v && cur?.id !== v.id) vEl.srcObject = new MediaStream([v]);
        if (!v && cur) vEl.srcObject = null;
      }
      if (aEl) {
        const cur = (aEl.srcObject as MediaStream | null)?.getAudioTracks()[0];
        if (a && cur?.id !== a.id) {
          aEl.srcObject = new MediaStream([a]);
          aEl.play().catch(() => {});
        }
        if (!a && cur) aEl.srcObject = null;
      }
    };

    const onMessage = async (ev?: DailyEventObjectAppMessage) => {
      if (!ev || !call) return;
      live.current.onAppMessage?.("in", ev.data);
      const result = await live.current.router.handle(ev.data);
      if (!result || cancelled) return;
      live.current.onAppMessage?.("out", result);
      try {
        call.sendAppMessage(result, "*");
      } catch (e) {
        console.error("[avatar] sendAppMessage failed", e);
      }
    };

    lifecycle = lifecycle.then(async () => {
      if (cancelled) return;
      Daily.getCallInstance()?.destroy();
      call = Daily.createCallObject({ subscribeToTracksAutomatically: true });
      call
        .on("app-message", onMessage)
        .on("participant-joined", syncMedia)
        .on("participant-updated", syncMedia)
        .on("participant-left", syncMedia)
        .on("track-started", syncMedia)
        .on("track-stopped", syncMedia)
        .on("left-meeting", () => report("left"))
        .on("error", (e) => report("error", e?.errorMsg));
      try {
        report("joining");
        await call.join({ url: conversationUrl, startVideoOff: !camera, startAudioOff: false });
        report("joined");
        syncMedia();
      } catch (e) {
        report("error", (e as Error)?.message ?? String(e));
      }
    });

    return () => {
      cancelled = true;
      lifecycle = lifecycle.then(async () => {
        if (!call) return;
        try {
          await call.leave();
        } catch {}
        await call.destroy();
      });
    };
  }, [conversationUrl, camera]);

  return (
    <div className={className} style={{ position: "relative", background: "#111", overflow: "hidden", ...style }}>
      <video ref={videoRef} autoPlay playsInline muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      <audio ref={audioRef} autoPlay />
      {(status !== "joined" || !avatarPresent) && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            color: "#ddd",
            font: "14px system-ui, sans-serif",
          }}
        >
          {status === "joining" && "Connecting to your stylist…"}
          {status === "joined" && !avatarPresent && "Waiting for your stylist to join…"}
          {status === "left" && "Call ended."}
          {status === "error" && "Couldn't connect to the stylist."}
        </div>
      )}
    </div>
  );
}
