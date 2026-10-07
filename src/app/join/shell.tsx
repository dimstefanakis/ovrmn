import s from "./membership.module.css";

// Fonts come from the root layout (Playfair Display, IBM Plex Mono, Geist), the house look.
export function MembershipShell({ children }: { children: React.ReactNode }) {
  return (
    <div className={s.world}>
      <header className={s.header}><span className={s.wordmark}>OVRMN</span></header>
      <main className={s.main}>{children}</main>
      <footer className={s.footer}>
        <span>© OVRMN</span>
        <nav aria-label="Membership help">
          <a href="mailto:support@ovrmn.com">Contact</a>
          <a href="/terms">Terms</a>
          <a href="/privacy">Privacy</a>
          <a href="/refunds">Cancellation</a>
        </nav>
      </footer>
    </div>
  );
}
