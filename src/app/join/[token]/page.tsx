import { joinErrorMessage, validJoinToken } from "@/lib/join";
import s from "../membership.module.css";

// Deliberately no membership lookup, checkout creation or redirect on GET.
export default async function JoinPage({ params, searchParams }: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  const { token } = await params;
  const error = joinErrorMessage((await searchParams).error);
  if (!validJoinToken(token)) return (
    <>
      <p className={s.kicker}>Membership</p>
      <h1>Let&apos;s get you<em>a new link.</em></h1>
      <p className={s.description}>Ask OVRMN in your Messages conversation for your membership link.</p>
    </>
  );
  return (
    <>
      <p className={s.kicker}>Membership</p>
      <h1>Keep your coach.<em>Still a message away.</em></h1>
      <p className={s.description}>Your workouts, food and progress, with the coach who already knows them.</p>
      <div className={s.priceRow}>
        <p className={s.price}>$29<span>/ month</span></p>
        <p className={s.renewal}>Includes tax. Renews monthly. Cancel anytime.</p>
      </div>
      {error ? <p role="alert" className={s.error}>{error}</p> : null}
      <form method="post" action="/api/join">
        <input type="hidden" name="token" value={token} />
        <button className={s.button} type="submit">Continue</button>
      </form>
      <p className={s.note}>You review your membership and payment details on Stripe before subscribing. Opening this page doesn&apos;t subscribe you.</p>
    </>
  );
}
