import type { Metadata } from "next";
import { MembershipShell } from "../join/shell";
import s from "../join/membership.module.css";

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

    <h2>No refunds</h2>
    <p>Payments are non-refundable, including for a month you only partly use. If you think you were charged in error, write to us.</p>

    <h2>How to reach us</h2>
    <p>Message OVRMN in the same conversation or email <a href="mailto:support@ovrmn.com">support@ovrmn.com</a>.</p>
  </article></MembershipShell>;
}
