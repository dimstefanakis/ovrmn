# Membership website — implementation and release draft

Not deployed. Confirmed by the operator: OVRMN branding, support@ovrmn.com, a final tax-inclusive price of $29/month, and no refunds. Only `/terms` names the company (ELITE STUCK SINGLE MEMBER P.C., GEMI and VAT numbers); other public pages carry no company details, by the operator's choice. Stripe Tax collects VAT inside the price (Greek registration, EU small-seller option).

## Website contract

- `/join/<24-base62-token>` shows the same non-personal offer for every syntactically valid token. GET and metadata generation never call the coach backend or Stripe, and never redirect. Validation of token ownership happens only after the user presses Continue.
- The native POST form goes to `/api/join`. The route accepts urlencoded form data and JSON, enforces same-origin/public Host, a 4 KB streamed body limit, and a bounded HMAC-IP per-instance limiter (30 attempts/15 minutes, at most 1000 keys). This is not a distributed rate limit.
- `no-referrer` can make a browser's native form send `Origin: null` ([MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Referrer-Policy#effect_on_the_origin_header)). Only urlencoded requests with the exact browser-owned Fetch Metadata values `same-origin` / `navigate` / `document` receive this exception. Cross-site, sibling-site, opaque/sandboxed, missing-metadata and null-Origin JSON requests are rejected before backend work. Non-null Origin checks remain unchanged. For the exception's local redirects, the public authority is `Host` (never `x-forwarded-host`); `x-forwarded-proto` must be a single `http` or `https`, otherwise the request URL supplies the protocol. The hosting ingress must overwrite the protocol header. Invalid authorities and protocol chains fail closed.
- Server-only `DEMI_BILLING_API_URL` is the coach API origin. It falls back to `DEMI_API_URL`, preserving enrollment configuration. `DEMI_BILLING_KEY` must match the backend. Neither is exposed in the client bundle. No environment values are changed by this implementation.
- The backend receives `POST /billing/checkout`, bearer authorization and `{token}`. The website waits at most 13 seconds, allowing the backend's 11-second deadline plus network overhead; the hosting route allows 15 seconds. It forbids provider redirects and never logs tokens, raw IPs or provider messages.
- `{state:"checkout",url}` gets a 303 only to HTTPS `checkout.stripe.com`, without credentials/custom ports. `{state:"member"|"comped"}` gets a local done redirect. Unknown state, malformed URL, timeout or error gets sanitized feedback. A valid native-form retry keeps the token; invalid links ask for a fresh link in Messages.
- Backend 409 `subscription_exists` asks the client to manage the existing membership through support, and `payment_processing` asks them to check Messages while confirmation finishes. No second purchase or subscribed claim is inferred.
- `/join/<token>/done` is neutral regardless of query strings. A URL cannot prove payment. Only the backend's verified Stripe state can confirm membership and send a welcome. No client `subscribed` event is emitted from a spoofable return page.

## Privacy and analytics

Join pages have noindex/nofollow/noarchive, no-referrer metadata and response headers. The shared `/join/opengraph-image` is a static 1200×630 PNG generated at build time from local fonts, outside the token segment. Its metadata URL is `/join`; neither the image nor its route carries a token.

Before initialization, the private path excludes PostHog, Meta, LinkedIn and ChatGPT ads SDKs. PostHog's configured `before_send` also discards events while on a private join page and scrubs private URLs from later/nested payloads; replay stops before client navigation to a join page. Attribution storage and later Meta events scrub private referrers/landing paths. Marketing analytics remain enabled on `/pt` and the other public pages. This deliberately omits client `join_viewed`/`checkout_started`/`subscribed` tracking; conversion measurement should come from verified backend billing events without the bearer link.

Hosting request/access logs may still contain the original incoming path. Configure hosting log access and retention accordingly; application code does not log it.

## Policies

Confirmed facts: AI personal training in Messages; first seven days from the first message free without a card; $29/month including tax, monthly renewal, cancel anytime; payments are non-refundable, stated in the Terms only (no refund language on other pages, at Checkout or from the coach); payment review on Stripe; support through the existing Messages conversation or support@ovrmn.com; a secure billing portal for members. `/terms`, `/privacy`, `/refunds` and `/contact` state only these facts. Terms keep a general line that consumer rights the law doesn't allow us to limit still apply.

The configured portal cancels at the end of the paid period. Joining during the free week never charges before its end; Stripe's minimum trial window can extend the first charge when joining near that boundary. Checkout displays its actual charge date.

## Verification

Run `bun test src/lib/join.test.ts src/lib/join-pages.test.tsx src/lib/analytics-privacy.test.ts src/lib/pt-waitlist.test.ts src/app/pt/first-text.test.ts`, `bunx tsc --noEmit`, scoped ESLint and `bun run build`. Checkout tests use a mocked backend and never register a provider, charge a card, create an Airtable row or send a message. A real iMessage card, private-link GET without checkout side effects and Stripe test checkout/webhook still need separate acceptance checks.

### Local verification — October 5, 2026

- 37 tests passed: checkout contract/security/error cases, passive page rendering, URL privacy and existing PT/waitlist behavior. TypeScript, scoped ESLint and `git diff --check` passed.
- Next.js 16.2.0 production build passed. The sandboxed compiler stalled; the same build succeeded with network access. The OG renderer does not support the existing variable Manrope font, so the image uses the local house Instrument Serif and the renderer's bundled sans. The page retains both house fonts.
- Read-only HTTP checks against the production build: private join GET 200 with no-referrer and noindex/nofollow/noarchive headers and metadata; token-free shared OG image, valid PNG 1200×630 (43,895 bytes); a forged `done?state=member&subscribed=true` remains neutral; GET `/api/join` is 405; `/pt`, `/terms`, `/refunds` and `/contact` return 200. The private document contains no Meta/LinkedIn SDK embed.
- No browser/device visual validation, handset card rendering, real Stripe checkout/payment/webhook, environment update, commit, deployment or provider/Airtable mutation was performed. Policy seller details and Stripe live configuration remain release prerequisites.

### Native-form origin regression

The connected-browser QA run exposed a 403 on Continue because the no-referrer document sent `Origin: null`. The route now uses the narrow native-navigation exception above without adding browser JavaScript or weakening the referrer policy. Four additional mocked-backend tests cover the null-Origin form, negative metadata/content types, proxy-safe redirects, malformed authorities and protocol chains. All 41 website tests pass; TypeScript, scoped ESLint and diff checks pass. A fresh connected-browser retry is separate from these route tests and remains owned by the main QA session.

The fresh Chrome retry reached actual Stripe TEST Checkout. A fixture with 1.5 days left in its original free week shows $0 due today and $29/month starting after the extended two-day trial; the inclusive amount and required Terms box are visible. The account's shared Terms URL was set to https://www.ovrmn.com/terms with explicit approval. The original failed Stripe request remains cached under its idempotency key; a new synthetic client's attempt succeeds after setup is corrected. Do not bypass backend duplicate-payment guards to retry a provider setup failure. The final local production build also passed after these changes.

With explicit approval, the browser completed TEST Checkout using a fake card and synthetic email, with the Terms checkbox checked and optional saved checkout information unchecked. Actual signed Stripe events reached the local backend and established `trialing` / `member` access. The actual TEST portal then scheduled cancellation at the end of the trial; a third signed event synchronized `cancel_at_period_end=true` while retaining access. No live charge or live subscription was created.

The configured success URL returned a production 404 because these pages are not deployed; the local neutral done page works. The browser harness did not send messages or enqueue a welcome because its global membership flag was off; those behaviors passed separate runtime/model tests. Portal controls and cancellation were verified through a server-created TEST portal session, not through email-login delivery. Handset link previews, deployed return navigation, portal email delivery, receipts and live billing acceptance remain release checks. Screenshots are in the coach worktree's ignored `.local/stripe-test-checkout.png` and `.local/stripe-test-portal-canceled.png`.
