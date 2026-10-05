import s from "../../membership.module.css";

// A return URL is not payment proof. Stripe webhooks confirm membership to the coach.
export default function JoinDone() {
  return (
    <>
      <p className={s.kicker}>Membership</p>
      <h1>Back to<em>your coach.</em></h1>
      <p className={s.description}>If you completed checkout, OVRMN is confirming your membership. Check your Messages conversation for confirmation.</p>
      <a href="sms:" className={s.button}>Open Messages</a>
      <p className={s.note}>Already a member or have access included? You can carry on in your existing conversation. Ask there if you need help.</p>
    </>
  );
}
