"use client";

import Image from "next/image";
import {
  BellRing,
  Camera,
  Dumbbell,
  MessageCircle,
  ScanLine,
  Search,
  Smartphone,
  type LucideIcon,
} from "lucide-react";
import {
  createContext,
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { trackLanding } from "@/lib/pt-analytics";
import {
  BRISK,
  MessagesScreen,
  Phone,
  prefersReducedMotion,
  threadDuration,
  useThread,
  type Message,
} from "./imessage";
import { REEL_FOOD, REEL_PAGE, REEL_RECAP, REEL_SESSION } from "./threads";
import { DemoVideo } from "./demo-video";
import s from "../landing.module.css";

/* ─────────────────────────────────────────────────────────
 * HERO: ONE SENTENCE, ONE PHONE
 *
 * The hero sentence names the features as underlined phrases; each phrase is a
 * control for the phone below it, as are the chips above the phone, a swipe on
 * the phone. Scenes advance automatically and loop; the controls can jump ahead.
 * Each scene remounts on entry, so its recording or conversation plays from the start.
 *
 *   Texts first   real lock screen recording, OVRMN notifications arrive;
 *                 on leaving, the lock screen lifts away (drawer curve)
 *   Workouts      the day's session, texted first          (brisk thread)
 *   Food          a plate photo → the numbers               (brisk thread)
 *   Form          real screenshot: the fix drawn on a frame
 *   Finds         real screenshot: menus that fit the goal
 *   Check-ins     the week, summed up unprompted            (brisk thread)
 *   Pages         an answer turned into a page to keep      (brisk thread)
 *   Your app      real recording: Home Screen → the OVRMN app → its tabs
 *
 * Transitions: a short sideways slide (10%, drawer curve) with an opacity fade, no
 * blur, so screens stay sharp mid-transition; @starting-style covers remounts.
 * The opening clip starts on load and replays from its first frame the first time the phone is
 * 55% on screen (on phones it only peeks at the fold, and the lock screen's notifications land on
 * its lower half). If iOS blocks video (Low Power Mode), an animated-image copy plays instead.
 * Reduced motion: static threads and transitions; the demo still advances automatically.
 * ───────────────────────────────────────────────────────── */

const TIMING = {
  threadHold:  1800,   // hold a thread's final frame before advancing
  image:       4000,   // reading time for a screenshot scene
  lock:        5300,   // the lock screen recording (last notification lands ~4.6s)
  app:         8000,   // the app recording (7.6s) plus a beat
  swipe:         40,   // px of horizontal travel that counts as a swipe on the phone
  scrollGap:     16,   // px left above the chips when a phrase brings the demo into view
  visible:     0.55,   // share of the phone on screen before the first scene starts playing
};

type Scene = { key: string; chip: string; caption: string } & (
  | { kind: "thread"; messages: Message[] }
  | { kind: "image"; src: string; alt: string }
  | { kind: "video"; src: string; poster: string; fallback: string; ms: number }
);

const SCENES: Scene[] = [
  { key: "first", chip: "Texts first", caption: "OVRMN texts first. Nothing to remember.", kind: "video", src: "/pt/v2/lock.mp4", poster: "/pt/v2/lock-poster.webp", fallback: "/pt/v2/lock-anim.webp", ms: TIMING.lock },
  { key: "workouts", chip: "Workouts", caption: "Today’s session, built around your week.", kind: "thread", messages: REEL_SESSION },
  { key: "food", chip: "Food", caption: "One photo. The numbers and the next step.", kind: "thread", messages: REEL_FOOD },
  { key: "form", chip: "Form", caption: "A frame from your set, with the fix drawn on.", kind: "image", src: "/pt/v2/real-form-feedback.webp", alt: "Real conversation: a dumbbell-row video frame and an edited illustration with arrows showing how to keep the shoulder facing the floor" },
  { key: "finds", chip: "Finds", caption: "Real menus and orders that fit your goal.", kind: "image", src: "/pt/v2/real-food-finds.webp", alt: "Real conversation: OVRMN recommends breakfast options from a real menu and shares the link" },
  { key: "check-ins", chip: "Check-ins", caption: "Your week, summed up before you ask.", kind: "thread", messages: REEL_RECAP },
  { key: "pages", chip: "Pages", caption: "Plans and lists you can keep.", kind: "thread", messages: REEL_PAGE },
  { key: "app", chip: "Your app", caption: "Your own app, built from your texts.", kind: "video", src: "/pt/v2/app-open.mp4", poster: "/pt/v2/app-open-poster.webp", fallback: "/pt/v2/app-open-anim.webp", ms: TIMING.app },
];

/* The hero sentence. Plain strings are text; tuples are [phrase, scene, icon]. */
const SENTENCE: (string | [string, string, LucideIcon])[] = [
  "OVRMN ",
  ["texts you first", "first", MessageCircle],
  " with ",
  ["your workout for today", "workouts", Dumbbell],
  ", reads ",
  ["a photo of your plate", "food", Camera],
  ", fixes ",
  ["your form from one frame", "form", ScanLine],
  ", finds ",
  ["what to order", "finds", Search],
  ", sums up ",
  ["your week", "check-ins", BellRing],
  " and builds ",
  ["an app just for you", "app", Smartphone],
  ".",
];

function duration(scene: Scene) {
  if (scene.kind === "thread") return threadDuration(scene.messages, BRISK) + TIMING.threadHold;
  if (scene.kind === "image") return TIMING.image;
  return scene.ms;
}

type Via = "chip" | "swipe" | "phrase" | "auto";
type Reel = {
  client: boolean;
  seen: boolean; // the phone has been mostly on screen (or the visitor picked a scene)
  markSeen: () => void;
  index: number;
  previous: number | null;
  visits: number[];
  complete: () => void;
  still: boolean;
  go: (next: number, via: Via) => void;
  stage: React.RefObject<HTMLDivElement | null>;
};

const ReelContext = createContext<Reel | null>(null);

export function ReelProvider({ children }: { children: ReactNode }) {
  const stage = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [previous, setPrevious] = useState<number | null>(null);
  // Bumped when a scene is picked, so it remounts and plays from the start every time.
  const [visits, setVisits] = useState<number[]>(() => SCENES.map(() => 0));
  const [still, setStill] = useState(false);
  // Render posters on the server, then mount videos with their muted/inline playback setup
  // after hydration. DemoVideo handles browsers that refuse autoplay.
  const [client, setClient] = useState(false);
  // The automatic sequence waits until the phone is mostly visible. The opening video
  // starts at the fold, then restarts once its lower half and notifications are in view.
  const [seen, setSeen] = useState(false);
  const markSeen = useCallback(() => setSeen(true), []);
  const durations = useMemo(() => SCENES.map(duration), []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStill(prefersReducedMotion());
      setClient(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const go = useCallback((next: number, via: Via) => {
    const target = (next + SCENES.length) % SCENES.length;
    setPrevious(target === index ? previous : index);
    setIndex(target);
    setVisits((all) => all.map((n, i) => (i === target ? n + 1 : n)));
    setSeen(true);
    // Keep automatic progression out of the manual-selection funnel.
    if (via !== "auto") trackLanding("demo_feature_selected", { feature: SCENES[target].key, via });
  }, [index, previous]);

  const complete = useCallback(() => {
    if (seen) go(index + 1, "auto");
  }, [seen, index, go]);

  // Recordings advance on their real ended event (or the loaded fallback's completion).
  // Conversations get their full typing schedule plus reading time; screenshots hold still.
  // Choosing any scene resets its timer, then automatic progression continues from there.
  useEffect(() => {
    if (!seen || SCENES[index].kind === "video") return;
    const timer = setTimeout(complete, durations[index]);
    return () => clearTimeout(timer);
  }, [index, visits, seen, durations, complete]);

  return (
    <ReelContext.Provider value={{ client, seen, markSeen, index, previous, visits, complete, still, go, stage }}>
      {children}
    </ReelContext.Provider>
  );
}

function useReel() {
  const reel = useContext(ReelContext);
  if (!reel) throw new Error("FeatureReel parts must sit inside ReelProvider");
  return reel;
}

/** The hero sentence, with each feature phrase playing its scene on the phone. */
export function FeatureSentence() {
  const { index, go, stage, still } = useReel();
  return (
    <p className={s.sentence}>
      {SENTENCE.map((part, i) => {
        if (typeof part === "string") return <Fragment key={i}>{part}</Fragment>;
        const [phrase, key, Icon] = part;
        const target = SCENES.findIndex((scene) => scene.key === key);
        return (
          <button
            key={key}
            type="button"
            className={s.phrase}
            aria-pressed={target === index}
            onClick={() => {
              go(target, "phrase");
              // On a phone the demo sits below the sentence: bring it up with its chips in view.
              const box = stage.current?.getBoundingClientRect();
              if (box && (box.top > window.innerHeight * 0.45 || box.bottom < 120)) {
                window.scrollTo({ top: window.scrollY + box.top - TIMING.scrollGap, behavior: still ? "auto" : "smooth" });
              }
            }}
          >
            {phrase}
            <Icon aria-hidden="true" />
          </button>
        );
      })}
    </p>
  );
}

export function FeatureReel() {
  const { client, seen, markSeen, index, previous, visits, complete, still, go, stage } = useReel();
  const chips = useRef<HTMLDivElement>(null);
  const phone = useRef<HTMLDivElement>(null);
  const swipe = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const node = phone.current;
    if (!node || seen) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= TIMING.visible) markSeen();
      },
      { threshold: [TIMING.visible] },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [seen, markSeen]);

  // Keep the active chip in view in the scrolling row, without moving the page.
  useEffect(() => {
    const row = chips.current;
    const chip = row?.children[index] as HTMLElement | undefined;
    if (!row || !chip) return;
    const left = chip.offsetLeft - row.clientWidth / 2 + chip.clientWidth / 2;
    row.scrollTo({ left, behavior: "instant" });
  }, [index]);

  const scene = SCENES[index];
  return (
    <div ref={stage} className={s.reelHero}>
      <div ref={chips} className={s.chips} role="tablist" aria-label="What OVRMN does">
        {SCENES.map((item, i) => (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={i === index}
            className={s.chip}
            onClick={() => go(i, "chip")}
          >
            {item.chip}
          </button>
        ))}
      </div>
      <div
        ref={phone}
        className={s.swipeArea}
        onPointerDown={(event) => {
          swipe.current = { x: event.clientX, y: event.clientY };
        }}
        onPointerUp={(event) => {
          const start = swipe.current;
          swipe.current = null;
          if (!start) return;
          const dx = event.clientX - start.x;
          const dy = event.clientY - start.y;
          if (Math.abs(dx) > TIMING.swipe && Math.abs(dx) > Math.abs(dy) * 1.3) go(index + (dx < 0 ? 1 : -1), "swipe");
        }}
        onPointerCancel={() => {
          swipe.current = null;
        }}
      >
        <Phone label={`${scene.chip}: ${scene.caption}`}>
          {SCENES.map((item, i) => (
            <SceneLayer
              key={`${item.key}-${visits[i]}`}
              scene={item}
              state={i === index ? "active" : i === previous ? "past" : "idle"}
              play={i === index && seen}
              still={still}
              live={client}
              restart={seen ? 1 : 0}
              onEnded={i === index ? complete : undefined}
            />
          ))}
        </Phone>
      </div>
      <p key={scene.key} className={s.reelCaption} aria-live="polite">
        {scene.caption}
      </p>
    </div>
  );
}

function SceneLayer({
  scene,
  state,
  play,
  still,
  live,
  restart,
  onEnded,
}: {
  scene: Scene;
  state: "active" | "past" | "idle";
  play: boolean;
  still: boolean;
  live: boolean; // hydrated: videos may mount
  restart: number; // bumps once the phone is properly in view: replay from the first frame
  onEnded?: () => void;
}) {
  return (
    <div className={s.scene} data-state={state} data-key={scene.key} aria-hidden={state !== "active"}>
      {scene.kind === "thread" ? (
        <ReelThread messages={scene.messages} play={play} still={still} />
      ) : scene.kind === "image" ? (
        <Image className={s.sceneShot} src={scene.src} alt={scene.alt} width={1260} height={2736} unoptimized />
      ) : // Videos start as soon as the page is live (also with Reduce Motion: they're short, muted
      // recordings of the product) and replay from the start the first time the phone is in view.
      // One decoder at a time: the lock video stays through its own lift, the others only while active.
      live && (state === "active" || (state === "past" && scene.key === "first")) ? (
        <DemoVideo
          className={s.sceneShot}
          src={scene.src}
          poster={scene.poster}
          fallback={scene.fallback}
          durationMs={scene.ms}
          restart={state === "active" ? restart : 0}
          onEnded={onEnded}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img className={s.sceneShot} src={scene.poster} alt="" />
      )}
    </div>
  );
}

function ReelThread({ messages, play, still }: { messages: Message[]; play: boolean; still: boolean }) {
  const { shown, typing } = useThread(messages, play || still, 0, BRISK);
  return <MessagesScreen messages={messages} shown={shown} typing={typing} />;
}
