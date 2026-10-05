import { joinErrorMessage } from "@/lib/join";
import s from "./membership.module.css";

export default async function JoinHelp({ searchParams }: {
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  const error = joinErrorMessage((await searchParams).error);
  return (
    <>
      <p className={s.kicker}>Membership</p>
      <h1>Your coach<em>is in Messages.</em></h1>
      <p className={s.description}>Open your conversation with OVRMN to find your membership link or ask for help.</p>
      {error ? <p role="alert" className={s.error}>{error}</p> : null}
      <div className={s.priceRow}>
        <p className={s.price}>$29<span>/ month</span></p>
        <p className={s.renewal}>Renews monthly. Cancel anytime.</p>
      </div>
      <a href="sms:" className={s.button}>Open Messages</a>
    </>
  );
}
