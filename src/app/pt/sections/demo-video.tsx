"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A muted demo recording with an animated-image fallback for blocked playback.
 *
 * - Mounts client-side (callers render it after hydration) and calls play() straight away.
 * - Callers remount it only for explicit scene selection/replay or the next automatic loop.
 * - When the browser refuses playback, it swaps in the same recording as an animated image.
 *   Its playback clock starts after the image loads, so slow downloads cannot skip the demo.
 */
export function DemoVideo({
  src,
  poster,
  fallback,
  durationMs,
  className,
  onEnded,
  onProgress,
}: {
  src: string;
  poster: string;
  fallback: string;
  durationMs: number;
  className?: string;
  onEnded?: () => void;
  onProgress?: (fraction: number) => void;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const [blocked, setBlocked] = useState(false);
  const ended = useRef(onEnded);
  const progress = useRef(onProgress);
  const hasProgress = onProgress !== undefined;
  useEffect(() => { progress.current = onProgress; }, [onProgress]);
  useEffect(() => {
    ended.current = onEnded;
  }, [onEnded]);

  useEffect(() => {
    const node = video.current;
    if (!node) return;
    node.muted = true;
    node.defaultMuted = true;
    node.playsInline = true;
    void node.play().catch((error: unknown) => {
      // Seeking or unmounting may abort a pending play. Those are not playback-policy failures.
      if (video.current !== node) return;
      if (error instanceof DOMException &&
          (error.name === "NotAllowedError" || error.name === "NotSupportedError")) setBlocked(true);
    });
  }, []);

  // Media timeupdate events may arrive only a few times per second. Paint the fill on
  // each display frame from the actual media clock, so it stays smooth and stops on stalls.
  useEffect(() => {
    const node = video.current;
    if (blocked || !hasProgress || !node) return;
    let frame: number;
    const tick = () => {
      if (Number.isFinite(node.duration) && node.duration > 0) {
        progress.current?.(node.currentTime / node.duration);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [blocked, hasProgress]);

  if (blocked)
    return (
      <AnimatedFallback
        className={className}
        src={fallback}
        poster={poster}
        durationMs={durationMs}
        onEnded={() => ended.current?.()}
        onProgress={onProgress}
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

function AnimatedFallback({ src, poster, durationMs, className, onEnded, onProgress }: {
  src: string;
  poster: string;
  durationMs: number;
  className?: string;
  onEnded: () => void;
  onProgress?: (fraction: number) => void;
}) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const ended = useRef(onEnded);
  const progress = useRef(onProgress);
  useEffect(() => { ended.current = onEnded; }, [onEnded]);
  useEffect(() => { progress.current = onProgress; }, [onProgress]);

  useEffect(() => {
    if (!loaded) return;
    const started = performance.now();
    let frame: number | undefined;
    const tick = () => {
      progress.current?.(Math.min(1, (performance.now() - started) / durationMs));
      frame = requestAnimationFrame(tick);
    };
    // The shared app reel has no chip, so only animate progress when a caller needs it.
    if (progress.current) tick();
    const timer = setTimeout(() => ended.current(), durationMs);
    return () => {
      clearTimeout(timer);
      if (frame !== undefined) cancelAnimationFrame(frame);
    };
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
