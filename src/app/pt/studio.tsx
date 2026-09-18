"use client";

import { useState } from "react";
import { ArrowUp, ChevronLeft, Plus } from "lucide-react";
import s from "./explore.module.css";

const conversations = [
  {
    name: "Workouts",
    messages: [
      { who: "you", text: "only have 25 mins today. still worth going?" },
      {
        who: "trainer",
        text: "Yes. Goblet squats, rows, push-ups. Three rounds.",
      },
      {
        who: "trainer",
        text: "Use the weights from last time. Leave a couple of reps in reserve.",
      },
      { who: "you", text: "okay, heading there now" },
      { who: "trainer", text: "Text me when you’re done." },
    ],
  },
  {
    name: "Food",
    messages: [
      { who: "you", text: "late workout tonight. dinner before or after?" },
      {
        who: "trainer",
        text: "When are you training, and when did you last eat?",
      },
      { who: "you", text: "8ish. lunch was at 1" },
      {
        who: "trainer",
        text: "Have something easy now. Yogurt and a banana would work, then dinner after.",
      },
    ],
  },
  {
    name: "Check-ins",
    messages: [
      { who: "trainer", text: "How did the rows feel today?" },
      { who: "you", text: "easier. got all 3 sets of 10" },
      { who: "trainer", text: "Same 12kg as last time?" },
      { who: "you", text: "yep" },
      {
        who: "trainer",
        text: "Good progress. Let’s aim for one more clean rep next session.",
      },
    ],
  },
];

export function Conversation() {
  const [active, setActive] = useState(0);
  return (
    <div className={s.demo}>
      <div className={s.phone} aria-label="Example iMessage conversation">
        <div className={s.statusBar} aria-hidden="true">
          <span>9:41</span>
          <div className={s.island} />
          <svg viewBox="0 0 48 12" fill="currentColor">
            <rect x="0" y="8" width="3" height="4" rx=".6" />
            <rect x="5" y="5" width="3" height="7" rx=".6" />
            <rect x="10" y="2" width="3" height="10" rx=".6" />
            <path d="M18 4Q24-1 30 4L28 6Q24 3 20 6ZM21 7Q24 4.5 27 7L24 11Z" />
            <rect x="34" y="2" width="12" height="8" rx="2" />
            <rect x="47" y="4" width="1" height="4" rx=".5" />
          </svg>
        </div>
        <div className={s.contact}>
          <ChevronLeft size={24} aria-hidden="true" />
          <div>
            <span className={s.avatar} aria-hidden="true">
              o
            </span>
            <strong>
              OVRMN <span aria-hidden="true">›</span>
            </strong>
          </div>
          <span />
        </div>
        <div className={s.messages} aria-live="polite" aria-atomic="true">
          <p>iMessage</p>
          {conversations[active].messages.map((m, i) => (
            <div
              key={`${active}-${i}`}
              className={`${s.bubble} ${m.who === "you" ? s.outgoing : s.incoming}`}
            >
              {m.text}
            </div>
          ))}
        </div>
        <div className={s.composer} aria-hidden="true">
          <Plus size={22} />
          <span>
            iMessage
            <ArrowUp size={19} />
          </span>
        </div>
        <div className={s.homeIndicator} aria-hidden="true" />
      </div>
      <div
        className={s.examples}
        role="group"
        aria-label="Conversation examples"
      >
        {conversations.map((conversation, i) => (
          <button
            key={conversation.name}
            type="button"
            aria-pressed={active === i}
            onClick={() => setActive(i)}
          >
            {conversation.name}
          </button>
        ))}
      </div>
      <p className={s.exampleNote}>Example conversation</p>
    </div>
  );
}
