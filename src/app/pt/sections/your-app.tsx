"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { trackLanding } from "@/lib/pt-analytics";
import { Phone, prefersReducedMotion, useInView } from "./imessage";
import s from "../landing.module.css";

/* ─────────────────────────────────────────────────────────
 * APP REEL STORYBOARD
 *
 * Starts when the phone is half on screen.
 *
 *      0ms   real simulator recording: the Home Screen with the OVRMN app
 *   1900ms   tap → the OVRMN app opens on the founder's own app → Train → Progress
 *   ~7.6s   video ends; the screen hands over to example apps (full-screen captures of
 *           the synthetic Maya and Sofia builds, iPhone 17 Pro simulator, 1206 × 2622)
 *   +2.0s   each next app slides in from the right (14%, drawer curve), the
 *           last one slides out left; no blur (one label per app)
 *     end   loops through the examples; Replay restarts from the video
 * ───────────────────────────────────────────────────────── */

const TIMING = {
  homeHold: 1900,   // the Home Screen, before the tap opens the app
  perApp:   2000,   // how long each example app holds
};

const REEL = {
  video:  "/pt/v2/app-open.mp4",
  poster: "/pt/v2/app-open-poster.webp",
  home: "OVRMN, on your Home Screen",
  founder: "Built for Dimitris · strength and visible abs",
  apps: [
    { src: "/pt/v2/demo-maya-home.webp", label: "Built for Maya · a sub-2:20 half marathon", alt: "Maya's app: 135 days to Brighton, next run Sunday with Priya, 2 of 3 runs this week" },
    { src: "/pt/v2/demo-sofia-home.webp", label: "Built for Sofia · deadlift her bodyweight", alt: "Sofia's app: deadlift 40 kg toward 62 kg, a 20 minute nap session, 2 of 4 sessions this week" },
    { src: "/pt/v2/demo-maya-win.webp", label: "Maya's wins · her first 10 km", alt: "Maya's wins: 10 km at 6:50 per km, a long-run chart climbing to 10" },
    { src: "/pt/v2/demo-sofia-food.webp", label: "Sofia's food · protein, with room for a nata", alt: "Sofia's food tab: 78 to 81 g protein, a week of bars, meals on her plate" },
  ],
};

export function AppReel() {
  const { ref, seen } = useInView<HTMLDivElement>(0.5);
  const [index, setIndex] = useState(-1); // -1: the founder's recording; 0…n: example apps
  const [run, setRun] = useState(0);

  // The recording mounts (autoplay, muted, inline) once the phone is in view, and remounts on replay:
  // iOS Safari reliably autoplays a fresh muted inline video, unlike a later play() call.
  const [reduce, setReduce] = useState(false);
  const [home, setHome] = useState(true); // the Home Screen part of the recording
  useEffect(() => {
    if (!seen) return;
    const timers = [
      setTimeout(() => {
        const reduced = prefersReducedMotion();
        setReduce(reduced);
        setIndex(reduced ? 0 : -1);
        setHome(!reduced);
      }, 0),
      setTimeout(() => setHome(false), TIMING.homeHold),
    ];
    return () => timers.forEach(clearTimeout);
  }, [seen, run]);

  useEffect(() => {
    if (index < 0 || prefersReducedMotion()) return;
    const timer = setTimeout(() => setIndex((i) => (i + 1) % REEL.apps.length), TIMING.perApp);
    return () => clearTimeout(timer);
  }, [index]);

  const label = index < 0 ? (home ? REEL.home : REEL.founder) : REEL.apps[index].label;

  return (
    <div ref={ref} className={s.reel}>
      <Phone label="A real recording: the OVRMN app on an iPhone Home Screen opening the founder's personal app, followed by example apps built for other people">
        {seen && !reduce ? (
          <video
            key={run}
            className={s.reelVideo}
            data-on={index < 0 || undefined}
            src={REEL.video}
            poster={REEL.poster}
            muted
            playsInline
            autoPlay
            preload="auto"
            onEnded={() => setIndex(0)}
            onError={() => setIndex(0)}
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img className={s.reelVideo} data-on={index < 0 || undefined} src={REEL.poster} alt="" />
        )}
        <div className={s.reelApps} data-on={index >= 0 || undefined}>
          {REEL.apps.map((app, i) => (
            <Image
              key={app.src}
              className={s.reelApp}
              data-on={i === index || undefined}
              data-past={(index >= 0 && i === (index - 1 + REEL.apps.length) % REEL.apps.length) || undefined}
              src={app.src}
              alt={app.alt}
              width={1206}
              height={2622}
              unoptimized
            />
          ))}
        </div>
      </Phone>
      <div className={s.reelFoot}>
        <p className={s.reelLabel} key={label} aria-live="polite">
          {label}
        </p>
        <button
          type="button"
          className={s.replay}
          data-visible={index >= 0 || undefined}
          onClick={() => {
            setRun((n) => n + 1);
            trackLanding("demo_replayed", { demo: "app" });
          }}
        >
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9M13.5 2.5v3h-3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Replay
        </button>
        <p className={s.footnote}>Maya and Sofia are example people. Their apps were built the same way.</p>
      </div>
    </div>
  );
}
