import type { Metadata } from "next";
import { MembershipShell } from "../join/shell";
import s from "../join/membership.module.css";

export const metadata: Metadata = { title: "OVRMN — Privacy", robots: { index: false, follow: false } };

export default function PrivacyPage() {
  return <MembershipShell><article className={s.policy}>
    <p className={s.kicker}>Legal</p>
    <h1>Privacy.</h1>
    <p className={s.updated}>Last updated October 5, 2026</p>

    <h2>Who we are</h2>
    <p>OVRMN is the controller of your personal data; the company behind it is named in our <a href="/terms">Terms</a>. Contact us about privacy at <a href="mailto:support@ovrmn.com">support@ovrmn.com</a> or in your Messages conversation.</p>

    <h2>What we collect</h2>
    <ul>
      <li>Your phone number and the messages, photos, videos and voice notes you send OVRMN.</li>
      <li>What coaching needs from them: your goals, training sessions, food and bodyweight logs, preferences, timezone, and anything else you choose to tell us.</li>
      <li>Membership and billing details: your plan, payment status and the email you give Stripe. Stripe handles your card; we never see the full card number.</li>
      <li>On our website: basic analytics where you allow it. Membership pages don&apos;t load advertising or analytics trackers.</li>
    </ul>

    <h2>Why we use it</h2>
    <ul>
      <li>To coach you and run the service you asked for.</li>
      <li>To bill you and keep records the law requires.</li>
      <li>To keep OVRMN secure, prevent abuse and fix problems.</li>
    </ul>
    <p>We don&apos;t sell your data, and we don&apos;t use it for advertising.</p>

    <h2>Who helps us</h2>
    <p>We use service providers who process data for us under contract: hosting and databases (Google Cloud, Supabase, Vercel), AI models (OpenAI), Messages delivery (Linq, Photon), payments (Stripe), and website analytics (PostHog). Some are in the United States; transfers rely on the EU–US Data Privacy Framework or the European Commission&apos;s standard contractual clauses.</p>

    <h2>How long we keep it</h2>
    <p>We keep your coaching data while you use OVRMN. Ask us to forget something and OVRMN stops using it; ask us to delete your account and we delete your data, except billing records we must keep under tax law.</p>

    <h2>Your rights</h2>
    <p>You can ask to access, correct, delete or export your data, or to restrict or object to how we use it. Message OVRMN or email <a href="mailto:support@ovrmn.com">support@ovrmn.com</a>. You can also complain to the Hellenic Data Protection Authority (<a href="https://www.dpa.gr">dpa.gr</a>) or your local authority.</p>

    <h2>Adults only</h2>
    <p>OVRMN is for people aged 18 and over. If we learn we&apos;re coaching someone younger, we stop and delete their data.</p>
  </article></MembershipShell>;
}
