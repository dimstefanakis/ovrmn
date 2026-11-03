"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import s from "./imessage.module.css";

/* ─────────────────────────────────────────────────────────
 * iMESSAGE, DARK MODE, IN THE DOM
 *
 * Ported from the ad's Remotion Chat.tsx (shapes and colours follow real
 * dark-mode Messages screenshots). Sizes are iOS points: 1pt = 100cqw / 393,
 * so the whole screen scales with the phone.
 *
 * Playback: rows reveal one at a time. A coach text that answers you is
 * preceded by the typing bubble. Each new row grows from 0fr → 1fr, which
 * pushes earlier rows up and out of the top, as in Messages.
 * ───────────────────────────────────────────────────────── */

export type Message =
  | { kind: "time"; label: string }
  | { kind: "text"; from: "me" | "ov"; text: string }
  | { kind: "photo"; from: "me" | "ov"; src: string; width: number; height: number; alt: string }
  | { kind: "link"; from: "ov"; title: string; host: string; image: string; alt: string };

export type Pace = {
  firstRow: number;      // after play starts, before the first row
  typing: number;        // typing bubble shown before a coach reply
  perCharMe: number;     // reading time per character of your own text
  perCharCoach: number;  // reading time per character of a coach text
  minGap: number;        // shortest pause between rows
  maxGap: number;        // longest pause between rows
  photo: number;         // pause after a photo or link
};

export const PACE: Pace = {
  firstRow:      450,
  typing:        950,
  perCharMe:      22,
  perCharCoach:   15,
  minGap:        420,
  maxGap:       1500,
  photo:        1100,
};

/** The hero reel: brisk, so every feature gets its turn. */
export const BRISK: Pace = {
  firstRow:      250,
  typing:        600,
  perCharMe:      10,
  perCharCoach:    7,
  minGap:        300,
  maxGap:        900,
  photo:         700,
};

type Step = { show: number; typing: boolean; at: number };

/** The schedule: which row appears when, and where the typing bubble shows. */
function schedule(messages: Message[], PACE: Pace): Step[] {
  const steps: Step[] = [];
  let at = PACE.firstRow;
  messages.forEach((message, i) => {
    const previous = messages[i - 1];
    const answers =
      message.kind !== "time" &&
      message.from === "ov" &&
      (!previous || previous.kind === "time" || previous.from === "me");
    if (answers) {
      steps.push({ show: i, typing: true, at });
      at += PACE.typing;
    }
    steps.push({ show: i + 1, typing: false, at });
    const length = message.kind === "text" ? message.text.length : 0;
    at += message.kind === "time"
      ? 250
      : message.kind === "photo" || message.kind === "link"
        ? PACE.photo
        : Math.min(PACE.maxGap, Math.max(PACE.minGap,
            length * (message.from === "me" ? PACE.perCharMe : PACE.perCharCoach)));
  });
  return steps;
}

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Plays a thread once when `play` turns true and holds the final frame.
 * Bumping `replay` starts it again. Reduced motion shows the final thread at once.
 */
/** How long a thread takes to play with a pace, so a reel knows when to move on. */
export function threadDuration(messages: Message[], pace: Pace = PACE) {
  return (schedule(messages, pace).at(-1)?.at ?? 0) + 600;
}

export function useThread(messages: Message[], play: boolean, replay = 0, pace: Pace = PACE) {
  const [shown, setShown] = useState(0);
  const [typing, setTyping] = useState(false);
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!play) return;
    if (prefersReducedMotion()) {
      const timer = setTimeout(() => {
        setShown(messages.length);
        setTyping(false);
        setDone(true);
      }, 0);
      return () => clearTimeout(timer);
    }
    const steps = schedule(messages, pace);
    const reset = setTimeout(() => {
      setShown(0);
      setTyping(false);
      setDone(false);
    }, 0);
    const timers = steps.map((step) =>
      setTimeout(() => {
        setShown(step.show);
        setTyping(step.typing);
      }, step.at),
    );
    const last = steps.at(-1)?.at ?? 0;
    timers.push(reset, setTimeout(() => setDone(true), last + 600));
    return () => timers.forEach(clearTimeout);
  }, [messages, play, replay, pace]);
  return { shown, typing, done };
}

/** Starts once the element is mostly on screen; never again unless replayed. */
export function useInView<T extends Element>(threshold = 0.45) {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node || seen) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          observer.disconnect();
        }
      },
      { threshold },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [seen, threshold]);
  return { ref, seen };
}

/* ---------- The phone ---------- */

export function Phone({
  children,
  label,
  className = "",
}: {
  children: ReactNode;
  label?: string;
  className?: string;
}) {
  return (
    <div className={`${s.phone} ${className}`} role={label ? "img" : undefined} aria-label={label}>
      <div className={s.screen}>
        {children}
        <div className={s.island} aria-hidden="true" />
      </div>
    </div>
  );
}

export function StatusBar({ time = "9:41" }: { time?: string }) {
  return (
    <div className={s.status} aria-hidden="true">
      <span>{time}</span>
      <span className={s.statusIcons}>
        <svg viewBox="0 0 18 12"><rect x="0" y="8" width="3" height="4" rx="1" /><rect x="5" y="5.5" width="3" height="6.5" rx="1" /><rect x="10" y="3" width="3" height="9" rx="1" /><rect x="15" y="0" width="3" height="12" rx="1" /></svg>
        <svg viewBox="0 0 16 12"><path d="M8 2.2c2.3 0 4.4.9 6 2.4l1.2-1.2A10.2 10.2 0 0 0 8 .5C5.2.5 2.7 1.6.8 3.4L2 4.6a8.5 8.5 0 0 1 6-2.4Zm0 3.4c1.4 0 2.6.5 3.6 1.4l1.2-1.2A6.8 6.8 0 0 0 8 3.9c-1.8 0-3.5.7-4.8 1.9L4.4 7c1-.9 2.2-1.4 3.6-1.4Zm0 3.4c-.6 0-1.1.2-1.4.6L8 11.5l1.4-1.9c-.3-.4-.8-.6-1.4-.6Z" /></svg>
        <svg viewBox="0 0 27 12"><rect x="0.5" y="0.5" width="22" height="11" rx="3.5" fill="none" stroke="currentColor" opacity="0.45" /><rect x="2" y="2" width="19" height="8" rx="2" /><rect x="24" y="4" width="2" height="4" rx="1" opacity="0.45" /></svg>
      </span>
    </div>
  );
}

/* ---------- Messages ---------- */

export function MessagesScreen({
  messages,
  shown,
  typing,
}: {
  messages: Message[];
  shown: number;
  typing: boolean;
}) {
  return (
    <div className={s.messages}>
      <StatusBar />
      <header className={s.nav} aria-hidden="true">
        <span className={s.glass}>
          <svg viewBox="0 0 12 20"><path d="M10 2 2 10l8 8" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </span>
        <span className={s.contact}>
          <Image className={s.avatar} src="/pt/v2/avatar.webp" alt="" width={150} height={150} />
          <span className={s.name}>
            OVRMN
            <svg viewBox="0 0 8 12"><path d="m2 2 4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
          </span>
        </span>
        <span className={s.glass}>
          <svg viewBox="0 0 22 14"><rect x="1" y="1" width="14" height="12" rx="3" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="m16 5.5 5-3v9l-5-3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>
        </span>
      </header>
      <ThreadViewport>
        {messages.map((message, i) => (
          <Row
            key={i}
            message={message}
            on={i < shown}
            tail={tailAt(messages, i)}
            gap={gapBefore(messages, i)}
          />
        ))}
        <li className={s.row} data-on={typing || undefined} data-gap="group">
          <div>
            <div className={`${s.bubble} ${s.coach} ${s.typing}`} aria-hidden="true">
              <span />
              <span />
              <span />
              <Tail from="ov" />
            </div>
          </div>
        </li>
      </ThreadViewport>
      <div className={s.compose} aria-hidden="true">
        <span className={s.glass}>
          <svg viewBox="0 0 14 14"><path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
        </span>
        <span className={s.field}>
          iMessage
          <svg viewBox="0 0 12 18"><rect x="3" y="1" width="6" height="10" rx="3" fill="none" stroke="currentColor" strokeWidth="1.6" /><path d="M1 8.5a5 5 0 0 0 10 0M6 13.5V17" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
        </span>
      </div>
    </div>
  );
}

/**
 * Like Messages: a short thread sits under the contact header; once it overflows, the newest row
 * stays in view. A ResizeObserver follows the rows as they grow, so the lift is frame-accurate.
 */
function ThreadViewport({ children }: { children: ReactNode }) {
  const viewport = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLOListElement>(null);
  useEffect(() => {
    const outer = viewport.current;
    const inner = list.current;
    if (!outer || !inner) return;
    const follow = () => {
      const overflow = inner.offsetHeight - outer.clientHeight;
      inner.style.transform = overflow > 0 ? `translateY(${-overflow}px)` : "";
    };
    const observer = new ResizeObserver(follow);
    observer.observe(inner);
    observer.observe(outer);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={viewport} className={s.viewport}>
      <ol ref={list} className={s.thread}>
        {children}
      </ol>
    </div>
  );
}

/** Bubbles without the phone, for the timeline. Same shapes; 1pt scales with the column width. */
export function MiniThread({ messages, shown }: { messages: Message[]; shown: number }) {
  return (
    <div className={s.mini}>
      <div className={s.miniInner}>
        <ol className={s.thread}>
          {messages.map((message, i) => (
            <Row key={i} message={message} on={i < shown} tail={tailAt(messages, i)} gap={gapBefore(messages, i)} />
          ))}
        </ol>
      </div>
    </div>
  );
}

function sender(message: Message | undefined) {
  return message && message.kind !== "time" ? message.from : null;
}
function tailAt(messages: Message[], i: number) {
  const from = sender(messages[i]);
  return from !== null && sender(messages[i + 1]) !== from;
}
function gapBefore(messages: Message[], i: number): "none" | "same" | "group" {
  if (i === 0) return "none";
  return sender(messages[i]) !== null && sender(messages[i]) === sender(messages[i - 1]) ? "same" : "group";
}

function Row({
  message,
  on,
  tail,
  gap,
}: {
  message: Message;
  on: boolean;
  tail: boolean;
  gap: "none" | "same" | "group";
}) {
  if (message.kind === "time")
    return (
      <li className={s.row} data-on={on || undefined} data-gap={gap}>
        <div>
          <p className={s.time}>{message.label}</p>
        </div>
      </li>
    );
  const me = message.from === "me";
  return (
    <li className={s.row} data-on={on || undefined} data-gap={gap} data-me={me || undefined}>
      <div>
        {message.kind === "text" ? (
          <p className={`${s.bubble} ${me ? s.me : s.coach}`}>
            {message.text}
            {tail ? <Tail from={message.from} /> : null}
          </p>
        ) : message.kind === "photo" ? (
          <div className={`${s.media} ${me ? s.mediaMe : ""}`}>
            <Image
              src={message.src}
              alt={message.alt}
              width={message.width}
              height={message.height}
              sizes="(max-width: 760px) 50vw, 220px"
            />
          </div>
        ) : (
          <div className={s.link}>
            <Image src={message.image} alt={message.alt} width={390} height={250} sizes="240px" />
            <span className={s.linkText}>
              <strong>{message.title}</strong>
              <span>{message.host}</span>
            </span>
          </div>
        )}
      </div>
    </li>
  );
}

function Tail({ from }: { from: "me" | "ov" }) {
  return (
    <svg className={from === "me" ? s.tailMe : s.tailCoach} viewBox="0 0 11 17" aria-hidden="true">
      <path d="M0 0 C0 9 2.5 14.5 11 17 C5 17.3 1.6 15.6 0 13.6 Z" />
    </svg>
  );
}

/** A full-screen screenshot inside the phone (a real capture already carries its own status bar). */
export function ScreenImage({ src, alt, eager = false }: { src: string; alt: string; eager?: boolean }) {
  return (
    // Served as-is: these are full-resolution captures already compressed for the web, and
    // re-encoding them at a smaller width is what made screenshots look soft.
    <Image
      className={s.shot}
      src={src}
      alt={alt}
      width={1260}
      height={2736}
      unoptimized
      loading={eager ? "eager" : "lazy"}
    />
  );
}
