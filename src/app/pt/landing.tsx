import type { Metadata } from "next";
import Image from "next/image";
import localFont from "next/font/local";
import {
  BellRing,
  Camera,
  Dumbbell,
  EyeOff,
  FileText,
  Languages,
  Mic,
  ScanLine,
  Search,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { FirstTextLink } from "./first-text-link";
import { FeatureReel, FeatureSentence, ReelProvider } from "./sections/feature-reel";
import { Week } from "./sections/week";
import { AppReel } from "./sections/your-app";
import { Reveals, StickyCta } from "./sections/motion";
import { Phone, ScreenImage } from "./sections/imessage";
import s from "./landing.module.css";
import { PhoneForm, WaitlistButton, WaitlistProvider } from "../pt-waitlist/waitlist";
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

const REAL_MESSAGES = [
  { src: "/pt/v2/real-meal-photo.webp", title: "A photo, a practical next step.", alt: "Real iMessage conversation: a meal photo of chicken strips and potatoes, followed by OVRMN suggesting a larger protein serving to support muscle growth." },
  { src: "/pt/v2/real-food-finds.webp", title: "Real menus, remembered preferences.", alt: "Real iMessage conversation: OVRMN recommends breakfast options, shares a menu link and browser screenshot, and asks the user to check delivery availability because it could not verify the address." },
  { src: "/pt/v2/real-check-in.webp", title: "Follows up after training.", alt: "Real iMessage conversation: OVRMN checks in about soreness and the next personal-training session, then points out the missing protein in a potatoes-only lunch." },
];

const FEATURES = [
  { icon: Dumbbell, title: "Workouts", text: "Built for your goal, your time and the equipment you have." },
  { icon: Camera, title: "Food from a photo", text: "Send your plate. Get the numbers and the next step." },
  { icon: ScanLine, title: "Form checks", text: "The fix, drawn on a frame of your set." },
  { icon: BellRing, title: "Check-ins", text: "OVRMN texts first, follows up and sums up your week." },
  { icon: Search, title: "Finds", text: "Real menus, orders and products that fit your goal." },
  { icon: FileText, title: "Pages", text: "Plans, lists and recaps you can keep." },
  { icon: Mic, title: "Voice notes", text: "Talk instead of typing. Photos and videos work too." },
  { icon: Languages, title: "Your language", text: "Text in yours. OVRMN answers in it." },
];

const TRUST = [
  { icon: ShieldCheck, title: "Never sold", text: "We don’t sell your data or use it for advertising." },
  { icon: EyeOff, title: "Forgotten on request", text: "Ask OVRMN to forget something and it’s no longer used." },
  { icon: Trash2, title: "Deleted when you ask", text: "Delete your account anytime. We keep only the billing records tax law requires." },
];

const STEPS = [
  { title: "Leave your number.", text: "We’re opening access to a few people at a time." },
  { title: "Text OVRMN.", text: "You send the first text. Say what you want to change." },
  { title: "Get your first session.", text: "Built for your goal, your time and the equipment you have." },
];

const FAQ = [
  { q: "Do I need an iPhone?", a: "OVRMN lives in iMessage, so you’ll need an iPhone, iPad or Mac." },
  { q: "Do I need a gym?", a: "No. OVRMN builds sessions for home, a hotel room or any gym, around the equipment you actually have." },
  { q: "How accurate are the food numbers?", a: "They’re estimates from your photo and what you tell OVRMN. Give a weight or show the label and OVRMN uses that instead." },
  { q: "Can I send voice notes and videos?", a: "Yes. Photos, videos and voice notes all work, alongside plain texts." },
  { q: "Is OVRMN a real person?", a: "No. OVRMN is an AI personal trainer, made by a small team, and never pretends otherwise." },
  { q: "Can I make OVRMN quieter, or stop?", a: "Just say so. Quiet hours, fewer check-ins or a full stop, and OVRMN sticks to it." },
  { q: "What does it cost?", a: "Your first week is free and needs no card. After that, you work out a price with your coach, right in the chat." },
  { q: "Which languages does OVRMN speak?", a: "Whichever one you text in." },
  { q: "What happens to my data?", a: "It’s used to coach you. We don’t sell it or use it for advertising, and you can ask OVRMN to forget something or delete your account at any time." },
];

function MessagesGlyph() {
  return (
    <span className={s.messagesIcon} aria-hidden="true">
      <svg viewBox="0 0 32 32" fill="none">
        <path
          d="M16 6C9.4 6 4 10.1 4 15.2c0 3.1 2 5.8 5 7.5L7.8 27l5.5-2.7c.9.2 1.8.3 2.7.3 6.6 0 12-4.2 12-9.4S22.6 6 16 6Z"
          fill="white"
        />
      </svg>
    </span>
  );
}

/** On /pt-waitlist the form sits on the page; on /pt the button opens a Messages draft. */
function Signup({ waitlist, placement }: { waitlist: boolean; placement: "hero" | "final" }) {
  if (waitlist) return <PhoneForm placement={placement} />;
  return (
    <FirstTextLink number={process.env.DEMI_PUBLIC_IMESSAGE_NUMBER ?? null} className={s.messageCta}>
      <MessagesGlyph />
      Text OVRMN
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
        <section id="hero" className={s.hero} aria-labelledby="hero-title" data-section="hero">
          <ReelProvider>
            <div className={s.heroCopy}>
              <p className={s.badge}>
                <MessagesGlyph />
                Personal training in iMessage
              </p>
              <h1 id="hero-title">
                Your personal trainer.
                <br />
                In iMessage.
              </h1>
              <FeatureSentence />
              <div id="hero-signup" className={s.heroSignup}>
                <Signup waitlist={waitlist} placement="hero" />
              </div>
            </div>
            <div className={s.heroStage}>
              <FeatureReel />
            </div>
          </ReelProvider>
        </section>

        <section className={s.features} aria-labelledby="features-title" data-section="features">
          <div className={s.sectionHead} data-reveal>
            <p className={s.kicker}>What OVRMN does</p>
            <h2 id="features-title">Everything a trainer does.<br />In one thread.</h2>
          </div>
          <ul className={s.featureGrid}>
            {FEATURES.map(({ icon: Icon, title, text }, i) => (
              <li key={title} data-reveal style={{ ["--i" as string]: i % 4 }}>
                <Icon aria-hidden="true" />
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className={s.week} aria-labelledby="week-title">
          <div className={s.sectionHead} data-reveal>
            <p className={s.kicker}>A week with OVRMN</p>
            <h2 id="week-title">One thread, all week.</h2>
            <p>Real messages from our founder’s own coaching with OVRMN, word for word.</p>
          </div>
          <Week />
        </section>

        <section className={s.app} aria-labelledby="app-title" data-section="app">
          <div className={s.appInner}>
            <div className={s.appCopy} data-reveal>
              <p className={s.kicker}>Your app</p>
              <h2 id="app-title">An app built<br />just for you.</h2>
              <p>
                OVRMN builds you your own app around your goal, filled in from your texts. Open it from the chat or keep it on your Home Screen.
              </p>
              <ul className={s.appList}>
                <li><strong>Food</strong>what you’ve eaten, against your targets</li>
                <li><strong>Training</strong>this week’s sessions and your lifts</li>
                <li><strong>Progress</strong>the trend, not one bad day</li>
              </ul>
            </div>
            <div className={s.appStage} data-reveal style={{ ["--i" as string]: 1 }}>
              <AppReel />
            </div>
          </div>
        </section>

        <section className={s.real} aria-labelledby="real-title" data-section="real-messages">
          <div className={s.sectionHead} data-reveal>
            <p className={s.kicker}>Real messages</p>
            <h2 id="real-title">Screenshots, not mockups.</h2>
            <p>Straight from our own coaching with OVRMN.</p>
          </div>
          <ul className={s.realRow}>
            {REAL_MESSAGES.map((shot, i) => (
              <li key={shot.src} data-reveal style={{ ["--i" as string]: i }}>
                <Phone label={shot.alt}>
                  <ScreenImage src={shot.src} alt={shot.alt} />
                </Phone>
                <p>{shot.title}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className={s.trust} aria-labelledby="trust-title" data-section="trust">
          <div className={s.sectionHead} data-reveal>
            <p className={s.kicker}>Your data</p>
            <h2 id="trust-title">Your data stays yours.</h2>
          </div>
          <ul className={s.trustGrid}>
            {TRUST.map(({ icon: Icon, title, text }, i) => (
              <li key={title} data-reveal style={{ ["--i" as string]: i }}>
                <Icon aria-hidden="true" />
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className={s.start} aria-labelledby="start-title" data-section="steps">
          <div className={s.sectionHead} data-reveal>
            <p className={s.kicker}>How it starts</p>
            <h2 id="start-title">Start tonight.</h2>
          </div>
          <ol className={s.steps}>
            {STEPS.map((step, i) => (
              <li key={step.title} data-reveal style={{ ["--i" as string]: i }}>
                <span>{i + 1}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className={s.priceLine} data-reveal>
            First week free, no card. After that, you can work it out with your coach 👀
          </p>
        </section>

        <section className={s.faq} aria-labelledby="faq-title" data-section="faq">
          <div className={s.sectionHead} data-reveal>
            <p className={s.kicker}>Questions</p>
            <h2 id="faq-title">Good to know.</h2>
          </div>
          <div className={s.faqList}>
            {FAQ.map((item) => (
              <details key={item.q} className={s.faqItem}>
                <summary>
                  {item.q}
                  <svg viewBox="0 0 12 12" aria-hidden="true">
                    <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className={s.final} aria-labelledby="final-title" data-section="final">
          <div className={s.finalArt} data-reveal>
            <Image
              src="/pt/stride.webp"
              alt=""
              fill
              sizes="(max-width: 760px) 100vw, 1100px"
            />
          </div>
          <div className={s.finalCopy} data-reveal style={{ ["--i" as string]: 1 }}>
            <h2 id="final-title">Your first workout is one text away.</h2>
            <div id="final-signup" className={s.finalSignup}>
              <Signup waitlist={waitlist} placement="final" />
            </div>
          </div>
        </section>
      </main>
      <footer className={s.footer}>
        <span>© OVRMN</span>
        <nav aria-label="Legal"><a href="/privacy">Privacy</a><a href="/terms">Terms</a></nav>
      </footer>
      {waitlist ? (
        <StickyCta>
          <span className={s.wordmark} aria-hidden="true">OVRMN</span>
          <WaitlistButton className={s.stickyButton} placement="sticky">
            <MessagesGlyph />
            Text OVRMN
          </WaitlistButton>
        </StickyCta>
      ) : null}
      <Reveals />
    </>
  );
  return (
    <div className={`${s.world} ${sans.variable} ${serif.variable}`} data-landing>
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
