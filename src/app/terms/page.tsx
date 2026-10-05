import type { Metadata } from "next";
import { MembershipShell } from "../join/shell";
import s from "../join/membership.module.css";

// DRAFT for legal review (2026-10-05). Not legal advice. Fill in the [bracketed] company details
// and have a Greek lawyer/accountant confirm the withdrawal, liability and governing-law wording.
export const metadata: Metadata = { title: "OVRMN — Terms", robots: { index: false, follow: false } };

export default function TermsPage() {
  return <MembershipShell><article className={s.policy}>
    <p className={s.kicker}>Legal</p>
    <h1>Terms.</h1>
    <p className={s.updated}>Last updated October 5, 2026</p>

    <h2>The service</h2>
    <p>OVRMN is an AI personal trainer and nutrition coach that you text in Messages. It helps with your workouts, food and progress. OVRMN is an AI, not a human coach, doctor, dietitian or physiotherapist.</p>

    <h2>Not medical advice</h2>
    <p>OVRMN gives general fitness and nutrition guidance. It does not diagnose, treat or replace professional medical care. Check with a doctor before starting a new exercise or nutrition program, especially if you are pregnant, have a medical condition, an injury or a history of disordered eating. Stop and seek medical help if you feel pain, dizziness or anything that worries you. In an emergency, call your local emergency number.</p>

    <h2>Who can use it</h2>
    <p>You must be 18 or older. You are responsible for your phone and the conversation on it.</p>

    <h2>Free week and membership</h2>
    <p>Your first seven days of coaching are free, starting with your first message. No card is needed for the free week and it never turns into a paid plan on its own.</p>
    <p>To keep coaching after that, you can join the membership: $29 per month, including any tax, billed by our payment provider Stripe. It renews every month until you cancel. Stripe shows the exact first payment date before you subscribe. If you join during your free week, your first payment is no earlier than the end of that week.</p>
    <p>If you don&apos;t join, OVRMN still replies to you and can help with access or billing questions, but ongoing coaching stops.</p>

    <h2>Cancelling</h2>
    <p>Cancel anytime from the billing portal (ask OVRMN in Messages for the link) or by emailing <a href="mailto:support@ovrmn.com">support@ovrmn.com</a>. Cancelling stops future payments; you keep access until the end of the month you have paid for.</p>

    <h2>Your right to withdraw (EU and UK consumers)</h2>
    <p>You can withdraw from your membership within 14 days of subscribing, without giving a reason. Tell us by message or email. See <a href="/refunds">Cancellation &amp; refunds</a> for how refunds work, including during your first 14 days.</p>

    <h2>Using OVRMN fairly</h2>
    <p>Don&apos;t use OVRMN to harm anyone, to break the law, or to try to break, overload or misuse the service. We may pause or end access if you do.</p>

    <h2>Our responsibility</h2>
    <p>We provide OVRMN with reasonable care and skill, but AI can make mistakes: use your judgment and the advice above about medical care. Nothing in these terms limits your rights as a consumer or our liability where the law does not allow it to be limited, including for death or personal injury caused by negligence.</p>

    <h2>Changes</h2>
    <p>If we change these terms or the price, we&apos;ll tell you in Messages before the change applies to you, and you can cancel before it does.</p>

    <h2>Law and complaints</h2>
    <p>These terms are governed by Greek law. If you live in the EU, you also keep the protection of the mandatory consumer laws of your country and can bring a claim there. Talk to us first at <a href="mailto:support@ovrmn.com">support@ovrmn.com</a>; you can also turn to an approved consumer dispute resolution body in Greece.</p>

    <h2>Who provides OVRMN</h2>
    <p>OVRMN is operated by ELITE STUCK SINGLE MEMBER P.C., Charas 27, 14122 Athens, Greece. VAT number: [EL VAT number]. General Commercial Registry (GEMI) number: [GEMI number]. Contact: <a href="mailto:support@ovrmn.com">support@ovrmn.com</a>.</p>
  </article></MembershipShell>;
}
