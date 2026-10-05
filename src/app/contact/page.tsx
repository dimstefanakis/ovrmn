import type { Metadata } from "next";
import { MembershipShell } from "../join/shell";
import s from "../join/membership.module.css";

export const metadata: Metadata = { title: "OVRMN — Contact", robots: { index: false, follow: false } };

export default function ContactPage() {
  return <MembershipShell><article className={s.policy}>
    <p className={s.kicker}>Contact</p>
    <h1>We&apos;re in<br /><em>Messages.</em></h1>
    <p>For membership, payment, cancellation or coaching questions, reply in your existing conversation with OVRMN or email <a href="mailto:support@ovrmn.com">support@ovrmn.com</a>.</p>
    <p>Keep your membership link private. You don&apos;t need to share it to ask for help.</p>
    <p>OVRMN is operated by ELITE STUCK SINGLE MEMBER P.C., Charas 27, 14122 Athens, Greece. VAT [EL VAT number].</p>
    <a href="sms:" className={s.button}>Open Messages</a>
  </article></MembershipShell>;
}
