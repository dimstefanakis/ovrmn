"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A muted demo recording with an animated-image fallback for blocked playback.
 *
 * - Mounts client-side (callers render it after hydration) and calls play() straight away.
 * - `restart` bumping replays it from the first frame (e.g. the first time it's properly in view).
 * - When the browser refuses playback, it swaps in the same recording as an animated image.
 *   Its playback clock starts after the image loads, so slow downloads cannot skip the demo.
 */
export function DemoVideo({
  src,
  poster,
  fallback,
  durationMs,
  restart = 0,
  className,
  onEnded,
}: {
  src: string;
  poster: string;
  fallback: string;
  durationMs: number;
  restart?: number;
  className?: string;
  onEnded?: () => void;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const [blocked, setBlocked] = useState(false);
  const ended = useRef(onEnded);
  useEffect(() => {
    ended.current = onEnded;
  }, [onEnded]);

  useEffect(() => {
    const node = video.current;
    if (!node) return;
    node.muted = true;
    node.defaultMuted = true;
    node.playsInline = true;
    if (restart) node.currentTime = 0;
    void node.play().catch((error: unknown) => {
      // Seeking or unmounting may abort a pending play. Those are not playback-policy failures.
      if (video.current !== node) return;
      if (error instanceof DOMException &&
          (error.name === "NotAllowedError" || error.name === "NotSupportedError")) setBlocked(true);
    });
  }, [restart]);

  if (blocked)
    return (
      <AnimatedFallback
        key={restart}
        className={className}
        src={fallback}
        poster={poster}
        durationMs={durationMs}
        onEnded={() => ended.current?.()}
      />
    );
  return (
    <video
      ref={video}
      className={className}
      src={src}
      poster={poster}
      muted
      playsInline
      autoPlay
      preload="auto"
      onEnded={() => ended.current?.()}
      onError={() => setBlocked(true)}
    />
  );
}

function AnimatedFallback({ src, poster, durationMs, className, onEnded }: {
  src: string;
  poster: string;
  durationMs: number;
  className?: string;
  onEnded: () => void;
}) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const ended = useRef(onEnded);
  useEffect(() => { ended.current = onEnded; }, [onEnded]);

  useEffect(() => {
    if (!loaded) return;
    const timer = setTimeout(() => ended.current(), durationMs);
    return () => clearTimeout(timer);
  }, [loaded, durationMs]);

  // Keep a still if both media formats fail, and let the app reel reach its examples.
  if (failed) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img className={className} src={poster} alt="" />;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={className}
      src={src}
      alt=""
      onLoad={() => setLoaded(true)}
      onError={() => { setFailed(true); ended.current(); }}
    />
  );
}
