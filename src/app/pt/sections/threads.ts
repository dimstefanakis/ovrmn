import type { Message } from "./imessage";

/*
 * Real messages from the founder's own coaching with OVRMN (October 2026), used with his permission.
 * Wording is exactly as sent; long texts are only split where Messages would show separate bubbles,
 * and some lines are left out. Times are his local time (Athens). Never put a client's messages here.
 */

const BREAKFAST: Message = {
  kind: "photo",
  from: "me",
  src: "/pt/v2/breakfast.webp",
  width: 720,
  height: 960,
  alt: "A plate of three sliced boiled eggs on two slices of wholegrain bread with blocks of feta",
};

const PROTEIN_PAGE: Message = {
  kind: "link",
  from: "ov",
  title: "Protein without cooking",
  host: "files.ovrmn.com",
  image: "/pt/v2/protein-card.webp",
  alt: "The page OVRMN made: Protein without cooking, a supermarket list",
};

/** Sun Oct 11: OVRMN texts first with the day's session. */
export const SESSION: Message[] = [
  { kind: "time", label: "Sun 1:01 PM" },
  { kind: "text", from: "ov", text: "1pm. home upper, as promised 🏋️" },
  {
    kind: "text",
    from: "ov",
    text: "bench 62.5 kg 3×8 (drop to 60 if the last rep grinds), rows 22 kg 3×10/side, raises 4 kg 3×12, plank 3×30 s. about 30 min.",
  },
  {
    kind: "text",
    from: "ov",
    text: "one cue on the bench: feet planted, elbows ~45°, bar to lower chest. spotter or safeties.",
  },
];

/** Thu Oct 15: one photo, the numbers and the next step. */
export const FOOD: Message[] = [
  { kind: "time", label: "Thu 1:58 PM" },
  BREAKFAST,
  { kind: "text", from: "me", text: "wdyt?" },
  { kind: "text", from: "ov", text: "that's the best breakfast you've shown me so far." },
  {
    kind: "text",
    from: "ov",
    text: "3 eggs 19 g, 2 slices of that bread ~7 g, feta blocks ~8 g. so roughly 520 kcal and 34 g protein before you've done anything.",
  },
];

/** Thu Oct 15: a bad-stomach day, legs at home instead. */
export const HOME_LEGS: Message[] = [
  { kind: "time", label: "Thu 11:06 PM" },
  {
    kind: "text",
    from: "me",
    text: "didn’t go to PT but did legs at home and did this workout. 15kg on first set and 2x15 dumbbells on the latter 2",
  },
  {
    kind: "text",
    from: "ov",
    text: "good call. stomach like that the PT was never happening, and you still got legs in at home. that's the right trade, not a missed day.",
  },
  {
    kind: "text",
    from: "ov",
    text: "reading it as 4x10 goblet squat, 3x8 RDL with the bar, 3x8 walking lunges. logged.",
  },
];

/** Sun Oct 18: the week, summed up unprompted. */
export const RECAP: Message[] = [
  { kind: "time", label: "Sun 3:01 PM" },
  {
    kind: "text",
    from: "ov",
    text: "week's done. three sessions: upper PT monday, home legs wednesday, home upper last night. the leg PT got skipped for your stomach and nothing gets made up, that's right.",
  },
  {
    kind: "text",
    from: "ov",
    text: "the one that counts: bench 60 kg 10/10/8 and you finished the planks. that's a real session, not a token one.",
  },
];

/** Sat Oct 31: a buried chat answer becomes something to keep. */
export const PAGE: Message[] = [
  { kind: "time", label: "Sat 5:02 PM" },
  {
    kind: "text",
    from: "ov",
    text: "you asked about other protein snacks a week ago and i gave you a chat answer that's now buried. pulling it into one list you can keep, with the supermarket numbers checked rather than my memory. back in a bit.",
  },
  { kind: "time", label: "Sat 6:48 PM" },
  PROTEIN_PAGE,
];

/* The hero reel shows each feature quickly: the same messages, fewer of them. */
export const REEL_SESSION: Message[] = SESSION.slice(0, 3);
export const REEL_FOOD: Message[] = FOOD;
export const REEL_RECAP: Message[] = RECAP;
export const REEL_PAGE: Message[] = [PAGE[0], PAGE[1], PROTEIN_PAGE];
