import type { Metadata } from "next";
import Image from "next/image";
import localFont from "next/font/local";
import { FirstTextLink } from "./first-text-link";
import { Conversation } from "./studio";
import s from "./explore.module.css";
import { WaitlistButton, WaitlistProvider } from "../pt-waitlist/waitlist";
import { phoneCountries } from "../pt-waitlist/phone-countries";

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

export const ptMetadata: Metadata = {
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

function MessageCTA({ waitlist }: { waitlist: boolean }) {
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
  if (waitlist)
    return <WaitlistButton className={s.messageCta}>{content}</WaitlistButton>;
  return (
    <FirstTextLink
      number={process.env.DEMI_PUBLIC_IMESSAGE_NUMBER ?? null}
      className={s.messageCta}
    >
      {content}
    </FirstTextLink>
  );
}

export default function PersonalTrainerLanding({
  waitlist = false,
}: {
  waitlist?: boolean;
}) {
  const content = (
    <>
      <a className={s.skip} href="#main">
        Skip to content
      </a>
      <header className={s.header}>
        <span className={s.wordmark}>OVRMN</span>
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
            <MessageCTA waitlist={waitlist} />
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
            <Conversation assetBase="/pt/examples" />
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
          <MessageCTA waitlist={waitlist} />
        </section>
      </main>
      <footer className={s.footer}>© OVRMN</footer>
    </>
  );
  return (
    <div className={`${s.world} ${sans.variable} ${serif.variable}`}>
      {waitlist ? (
        <WaitlistProvider countries={phoneCountries}>
          {content}
        </WaitlistProvider>
      ) : (
        content
      )}
    </div>
  );
}
