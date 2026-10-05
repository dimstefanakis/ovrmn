import type { Metadata } from "next";
import { MembershipShell } from "../join/shell";
import s from "../join/membership.module.css";

// DRAFT for legal review (2026-10-05). Not legal advice. The 14-day full refund on the first payment
// is a business choice that keeps EU withdrawal simple; confirm it before publishing.
export const metadata: Metadata = { title: "OVRMN — Cancellation & refunds", robots: { index: false, follow: false } };

export default function BillingHelpPage() {
  return <MembershipShell><article className={s.policy}>
    <p className={s.kicker}>Billing</p>
    <h1>Cancellation<br />&amp; refunds.</h1>
    <p className={s.updated}>Last updated October 5, 2026</p>

    <h2>The membership</h2>
    <p>$29 per month, including any tax. It renews monthly until you cancel. Your first week of coaching is free and needs no card.</p>

    <h2>Cancel anytime</h2>
    <p>Ask OVRMN in your Messages conversation for the billing portal link, or email <a href="mailto:support@ovrmn.com">support@ovrmn.com</a>. In the portal you can cancel or update your payment method. Cancelling stops future payments, and you keep access until the end of the month you have paid for.</p>

    <h2>Your first 14 days</h2>
    <p>You can withdraw within 14 days of subscribing. If you&apos;ve already been charged, tell us within 14 days of your first payment and we&apos;ll refund it in full, to the card you paid with.</p>

    <h2>Later payments</h2>
    <p>Monthly payments after your first one aren&apos;t refunded when you cancel; you keep access until that month ends. If something went wrong, like a charge you didn&apos;t expect or a technical problem, write to us and we&apos;ll put it right.</p>

    <h2>How to reach us</h2>
    <p>Message OVRMN in the same conversation or email <a href="mailto:support@ovrmn.com">support@ovrmn.com</a>. Refunds are processed by Stripe and usually reach your account within 5–10 business days.</p>
  </article></MembershipShell>;
}
