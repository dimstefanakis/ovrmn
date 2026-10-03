"use client";

import Image from "next/image";
import { useState } from "react";
import s from "./explore.module.css";

const conversations = [
  {
    name: "Nutrition tracking",
    file: "meal-photo.png",
    title: "A photo. A practical next step.",
    description:
      "Feedback on what's on your plate, with a clear way to improve the next meal.",
    alt: "Real iMessage conversation: a meal photo of chicken strips and potatoes, followed by OVRMN suggesting a larger protein serving to support muscle growth.",
  },
  {
    name: "Form correction",
    file: "form-feedback.png",
    title: "See what to change.",
    description:
      "A frame from your workout video, paired with an edited illustration of the correction.",
    alt: "Real iMessage conversation: an original dumbbell-row video frame and an edited illustration with green arrows. OVRMN explains how to keep the shoulder facing the floor and clarifies that the edit is not a rep the user performed.",
  },
  {
    name: "Meal recommendations",
    file: "food-finds.png",
    title: "Find something that fits.",
    description:
      "Real menu options, with a recommendation that remembers your preferences.",
    alt: "Real iMessage conversation: OVRMN recommends breakfast options, shares a menu link and browser screenshot, and asks the user to check delivery availability because it could not verify the address.",
  },
  {
    name: "Accountability",
    file: "check-in.png",
    title: "A coach who checks in first.",
    description:
      "Follows up after training and keeps everyday choices connected to your goal.",
    alt: "Real iMessage conversation: OVRMN checks in about soreness and the next personal-training session, then points out the missing protein in a potatoes-only lunch.",
  },
];

export function Conversation({ assetBase }: { assetBase: string }) {
  const [active, setActive] = useState(0);
  const conversation = conversations[active];
  const src = `${assetBase}/${conversation.file}`;

  return (
    <div className={s.demo}>
      <div
        className={s.examples}
        role="group"
        aria-label="Conversation examples"
      >
        {conversations.map((example, i) => (
          <button
            key={example.name}
            type="button"
            aria-pressed={active === i}
            onClick={() => setActive(i)}
          >
            {example.name}
          </button>
        ))}
      </div>
      <figure className={s.example}>
        <figcaption
          className={s.exampleCaption}
          aria-live="polite"
          aria-atomic="true"
        >
          <h2>{conversation.title}</h2>
          <p>{conversation.description}</p>
        </figcaption>
        <div className={s.phone}>
          <Image
            key={src}
            src={src}
            alt={conversation.alt}
            width={1260}
            height={2736}
            sizes="(max-width: 360px) calc(100vw - 44px), (max-width: 420px) calc(100vw - 50px), 370px"
            loading="eager"
          />
        </div>
      </figure>
    </div>
  );
}
