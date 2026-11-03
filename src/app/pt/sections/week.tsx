"use client";

import { MiniThread, useInView, useThread, type Message, type Pace } from "./imessage";
import { FOOD, HOME_LEGS, PAGE, RECAP, SESSION } from "./threads";
import s from "../landing.module.css";

/* A week in one thread, from the founder's own coaching. Each moment's bubbles play once as it
 * scrolls into view (quick pace, no typing pause, so the page never waits on it). */

const SCROLL_PACE: Pace = {
  firstRow:      150,
  typing:          0,
  perCharMe:       4,
  perCharCoach:    3,
  minGap:        180,
  maxGap:        420,
  photo:         300,
};

type Moment = { key: string; when: string; title: string; text: string; messages: Message[] };

const MOMENTS: Moment[] = [
  {
    key: "session",
    when: "Sunday, 1:01 PM",
    title: "Your session lands on time.",
    text: "No app to open. OVRMN sends the plan when it’s time to train, with the cue that matters.",
    messages: SESSION.slice(1),
  },
  {
    key: "food",
    when: "Thursday, 1:58 PM",
    title: "A photo is the log.",
    text: "Send your plate. OVRMN does the math and tells you what’s working.",
    messages: FOOD.slice(1),
  },
  {
    key: "adjust",
    when: "Thursday, 11:06 PM",
    title: "Plans bend. Nothing gets lost.",
    text: "Skipped the gym? Do what you can. OVRMN logs it and reworks the week.",
    messages: HOME_LEGS.slice(1),
  },
  {
    key: "recap",
    when: "Sunday, 3:01 PM",
    title: "Your week, before you ask.",
    text: "OVRMN remembers every set and every meal, and sums them up for you.",
    messages: RECAP.slice(1),
  },
  {
    key: "page",
    when: "Saturday, 5:02 PM",
    title: "Answers become things to keep.",
    text: "Plans, lists and recaps turn into pages that OVRMN keeps up to date.",
    messages: PAGE.filter((message) => message.kind !== "time"),
  },
];

export function Week() {
  return (
    <ol className={s.timeline}>
      {MOMENTS.map((moment) => (
        <MomentRow key={moment.key} moment={moment} />
      ))}
    </ol>
  );
}

function MomentRow({ moment }: { moment: Moment }) {
  const { ref, seen } = useInView<HTMLLIElement>(0.3);
  const { shown } = useThread(moment.messages, seen, 0, SCROLL_PACE);
  return (
    <li ref={ref} className={s.moment} data-section={`week-${moment.key}`}>
      <div className={s.momentCopy} data-reveal>
        <p className={s.when}>{moment.when}</p>
        <h3>{moment.title}</h3>
        <p>{moment.text}</p>
      </div>
      <div className={s.momentChat} role="group" aria-label={`A real exchange with OVRMN: ${moment.title}`}>
        <MiniThread messages={moment.messages} shown={shown} />
      </div>
    </li>
  );
}
