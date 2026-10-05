import type { Metadata } from "next";
import { MembershipShell } from "../join/shell";
import s from "../join/membership.module.css";

// DRAFT for legal review (2026-10-05). Not legal advice. OVRMN processes health data (training,
// food, bodyweight, injuries), a special category under GDPR art. 9: explicit consent is the basis
// assumed here, so the product needs an explicit consent step before coaching starts. Confirm the
// processor list, transfer mechanisms and retention periods before publishing.
export const metadata: Metadata = { title: "OVRMN — Privacy", robots: { index: false, follow: false } };

export default function PrivacyPage() {
  return <MembershipShell><article className={s.policy}>
    <p className={s.kicker}>Legal</p>
    <h1>Privacy.</h1>
    <p className={s.updated}>Last updated October 5, 2026</p>

    <h2>Who we are</h2>
    <p>OVRMN is run by ELITE STUCK SINGLE MEMBER P.C., Charas 27, 14122 Athens, Greece (VAT [EL VAT number]), the controller of your personal data. Contact us about privacy at <a href="mailto:support@ovrmn.com">support@ovrmn.com</a> or in your Messages conversation.</p>

    <h2>What we collect</h2>
    <ul>
      <li>Your phone number and the messages, photos, videos and voice notes you send OVRMN.</li>
      <li>What coaching needs from them: your goals, training sessions, food and bodyweight logs, preferences, timezone, and anything you tell us about your health, injuries or how you feel. This is health data.</li>
      <li>Membership and billing details: your plan, payment status and the email you give Stripe. Stripe handles your card; we never see the full card number.</li>
      <li>On our website: basic analytics where you allow it. Membership pages don&apos;t load advertising or analytics trackers.</li>
    </ul>

    <h2>Why we use it, and on what basis</h2>
    <ul>
      <li>To coach you and run the service you asked for (our contract with you).</li>
      <li>To process your health information, because you explicitly agree to it so we can coach you. You can withdraw that consent anytime; coaching then stops.</li>
      <li>To bill you and keep records the law requires (contract and legal obligation).</li>
      <li>To keep OVRMN secure, prevent abuse and fix problems (our legitimate interests).</li>
    </ul>
    <p>We don&apos;t sell your data, and we don&apos;t use your health data for advertising.</p>

    <h2>Who helps us</h2>
    <p>We use service providers who process data for us under contract: hosting and databases (Google Cloud, Supabase, Vercel), AI models (OpenAI), Messages delivery (Linq, Photon), payments (Stripe), and website analytics (PostHog). Some are in the United States; transfers rely on the EU–US Data Privacy Framework or the European Commission&apos;s standard contractual clauses.</p>

    <h2>How long we keep it</h2>
    <p>We keep your coaching data while you use OVRMN. Ask us to forget something and OVRMN stops using it; ask us to delete your account and we delete your data, except billing records we must keep under Greek tax law.</p>

    <h2>Your rights</h2>
    <p>You can ask to access, correct, delete or export your data, to restrict or object to how we use it, and to withdraw consent at any time. Message OVRMN or email <a href="mailto:support@ovrmn.com">support@ovrmn.com</a>. You can also complain to the Hellenic Data Protection Authority (<a href="https://www.dpa.gr">dpa.gr</a>) or your local authority.</p>

    <h2>Adults only</h2>
    <p>OVRMN is for people aged 18 and over. If we learn we&apos;re coaching someone younger, we stop and delete their data.</p>
  </article></MembershipShell>;
}
