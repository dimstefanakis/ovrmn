import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import localFont from "next/font/local";
import { EXPLORE_FIRST_TEXT, firstTextSmsUrl } from "./first-text";
import { Conversation } from "./studio";
import s from "./explore.module.css";

const sans = localFont({
  src: "../../../public/pt/manrope.ttf",
  variable: "--ov-sans",
  display: "swap",
});
const serif = localFont({
  src: "../../../public/pt/instrument-regular.ttf",
  variable: "--ov-serif",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ovrmn.com"),
  title: "OVRMN — Your personal trainer in iMessage",
  description:
    "An AI personal trainer for your workouts, food, and progress. Right in iMessage.",
  robots: { index: false, follow: false },
  alternates: { canonical: null },
  openGraph: {
    title: "OVRMN — Your personal trainer in iMessage",
    description:
      "An AI personal trainer for your workouts, food, and progress. Right in iMessage.",
    siteName: "OVRMN",
    images: ["/pt/stride.webp"],
  },
};

function MessageCTA() {
  const href = firstTextSmsUrl(
    process.env.DEMI_PUBLIC_IMESSAGE_NUMBER ?? null,
    EXPLORE_FIRST_TEXT,
  );
  const content = (
    <>
      <span className={s.messagesIcon} aria-hidden="true">
        <svg viewBox="0 0 32 32" fill="none">
          <path
            d="M16 6C9.4 6 4 10.1 4 15.2c0 3.1 2 5.8 5 7.5L7.8 27l5.5-2.7c.9.2 1.8.3 2.7.3 6.6 0 12-4.2 12-9.4S22.6 6 16 6Z"
            fill="white"
          />
        </svg>
      </span>
      Text OVRMN
    </>
  );
  return href ? (
    <a href={href} className={s.messageCta}>
      {content}
    </a>
  ) : (
    <button type="button" className={s.messageCta} aria-disabled="true">
      {content}
    </button>
  );
}

export default function PersonalTrainer() {
  return (
    <div className={`${s.world} ${sans.variable} ${serif.variable}`}>
      <a className={s.skip} href="#main">
        Skip to content
      </a>
      <header className={s.header}>
        <Link href="/" className={s.wordmark} aria-label="OVRMN home">
          OVRMN
        </Link>
      </header>
      <main id="main">
        <section className={s.hero} aria-labelledby="hero-title">
          <div className={s.heroCopy}>
            <h1 id="hero-title">
              Your personal trainer.
              <br />
              In iMessage.
            </h1>
            <p>An AI trainer for your workouts, food, and progress.</p>
            <MessageCTA />
          </div>
          <div className={s.productStage}>
            <div className={s.artwork} aria-hidden="true">
              <Image
                src="/pt/stride.webp"
                alt=""
                fill
                priority
                sizes="(max-width: 760px) 180vw, 1100px"
              />
            </div>
            <Conversation />
          </div>
        </section>
        <section
          className={s.details}
          aria-label="Personal training with OVRMN"
        >
          <div className={s.benefits}>
            <p>Workouts built around your goals, time, and equipment.</p>
            <p>Practical food guidance, a photo or a question away.</p>
            <p>A trainer that remembers your progress and checks in.</p>
          </div>
          <MessageCTA />
        </section>
      </main>
      <footer className={s.footer}>© OVRMN</footer>
    </div>
  );
}
