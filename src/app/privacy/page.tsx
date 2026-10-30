import type { Metadata } from "next";
import { MembershipShell } from "../join/shell";
import s from "../join/membership.module.css";

export const metadata: Metadata = { title: "OVRMN — Privacy", robots: { index: false, follow: false } };

export default function PrivacyPage() {
  return <MembershipShell><article className={s.policy}>
    <p className={s.kicker}>Legal</p>
    <h1>Privacy.</h1>
    <p className={s.updated}>Last updated October 30, 2026</p>

    <h2>Who we are</h2>
    <p>OVRMN is the controller of your personal data; the company behind it is named in our <a href="/terms">Terms</a>. Contact us about privacy at <a href="mailto:support@ovrmn.com">support@ovrmn.com</a> or in your Messages conversation.</p>

    <h2>What we collect</h2>
    <ul>
      <li>Your phone number and the messages, photos, videos and voice notes you send OVRMN.</li>
      <li>What coaching needs from them: your goals, training sessions, food and bodyweight logs, preferences, timezone, and anything else you choose to tell us.</li>
      <li>Membership and billing details: your plan, payment status and the email you give Stripe. Stripe handles your card; we never see the full card number.</li>
      <li>On our website: basic analytics where you allow it. Membership pages don&apos;t load advertising or analytics trackers.</li>
    </ul>

    <h2>Optional Apple Health connection</h2>
    <p>If you connect Apple Health in the OVRMN iPhone app, we read only the categories you allow. Depending on your choices and the records available, these can include workouts and workout details; steps, activity and energy use; sleep; weight and other body measurements; heart and respiratory measures; blood oxygen, glucose and pressure; nutrition and water; mindfulness and menstrual-flow records; and date of birth, biological sex and height.</p>
    <p>The initial import can include the previous 90 days. New and updated records can sync in the background. The app sends imported records to your OVRMN account so your AI coach can use them for your fitness and nutrition coaching. Relevant information can be processed by the AI and hosting providers that run that service. We do not sell Health data or use it for advertising.</p>
    <p>You can skip Health access, choose individual categories, or revoke permission in iOS Settings. Revoking permission stops new reads but does not by itself erase records already sent. In the app, <strong>You → Delete my Health data</strong> removes imported Health records and disconnects this iPhone. Your chat and other coaching records remain.</p>

    <h2>Optional location sharing</h2>
    <p>If you choose nearby help, the app sends your location, capture time and accuracy to your OVRMN account so your coach can answer nearby questions. Background location updates and proactive nearby suggestions are separate choices. If enabled, background location can update while you use other apps. We keep a latest-location record rather than a location-history document; information about places discussed with your coach can also remain in your chat and coaching records.</p>
    <p>Use <strong>You → Nearby help → Stop sharing and delete latest location</strong> to stop app sharing and delete that record, or revoke permission in iOS Settings. After a Settings change, deletion from OVRMN depends on the app next contacting our server; interrupted deletions are retried. Sharing through Messages or Find My is controlled separately on your phone. We do not use location for advertising.</p>

    <h2>Sample account for app review</h2>
    <p>The app offers a fictional sample account for exploring its screens without a Messages login. Each sign-in creates an independent temporary session with sample training content. Health imports and location coordinates submitted in that session are discarded; they are not attached to a real client account or sent to a coach. The session expires after 24 hours or a server restart, and disconnecting ends it immediately.</p>

    <h2>Why we use it</h2>
    <ul>
      <li>To coach you and run the service you asked for.</li>
      <li>To bill you and keep records the law requires.</li>
      <li>To keep OVRMN secure, prevent abuse and fix problems.</li>
    </ul>
    <p>We don&apos;t sell your data, and we don&apos;t use it for advertising.</p>

    <h2>Who helps us</h2>
    <p>We use service providers who process data for us under contract to provide hosting and databases, third-party AI processing, Messages delivery, payments, and website analytics. Relevant coaching information, including Health or location information you choose to share, can be processed by the third-party AI service providers used to answer your requests. Some providers are in the United States; transfers rely on the EU–US Data Privacy Framework or the European Commission&apos;s standard contractual clauses.</p>

    <h2>How long we keep it</h2>
    <p>We keep your coaching data while you use OVRMN. Ask us to forget something and OVRMN stops using it; ask us to delete your account and we delete your data, except billing records we must keep under tax law.</p>

    <h2>Your rights</h2>
    <p>You can ask to access, correct, delete or export your data, or to restrict or object to how we use it. Message OVRMN or email <a href="mailto:support@ovrmn.com">support@ovrmn.com</a>. You can also complain to the Hellenic Data Protection Authority (<a href="https://www.dpa.gr">dpa.gr</a>) or your local authority.</p>

    <h2>Adults only</h2>
    <p>OVRMN is for people aged 18 and over. If we learn we&apos;re coaching someone younger, we stop and delete their data.</p>
  </article></MembershipShell>;
}
