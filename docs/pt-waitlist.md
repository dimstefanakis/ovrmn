# PT waitlist

`/pt-waitlist` shares the `/pt` landing page, but both **Text OVRMN** buttons open a phone-only access dialog. The request is saved to Airtable, then the backend registers the person with Photon's shared pool and returns their assigned number. They tap **Text OVRMN** to open a draft and send the first message themselves. `/pt` keeps its existing direct iMessage link. This flow does not enroll a Linq contact or send a message.

## Airtable setup

Use the separate **PT** table, not the website's demo-leads table:

| Field                | Type             |
| -------------------- | ---------------- |
| Phone (primary)      | Single line text |
| Consent version      | Single line text |
| Source path          | Single line text |
| utm_source           | Single line text |
| utm_medium           | Single line text |
| utm_campaign         | Single line text |
| utm_content          | Single line text |
| utm_term             | Single line text |
| Joined at (optional) | Created time     |

Configure server-only environment variables locally and in Vercel:

For the existing OVRMN base, reuse `AIRTABLE_API_KEY` and `AIRTABLE_BASE_ID` and add only `AIRTABLE_WAITLIST_TABLE_ID=tblmACYnfO0gUxHbR`. Leave `AIRTABLE_TABLE_NAME` unchanged for the demo form. The overrides below are optional.

- `AIRTABLE_WAITLIST_API_KEY`: a personal access token with `data.records:write` and access to the chosen base. Falls back to `AIRTABLE_API_KEY` if absent. Use the dedicated variable to avoid replacing the demo form's token.
- `AIRTABLE_WAITLIST_BASE_ID`: waitlist base ID. If absent, uses existing `AIRTABLE_BASE_ID`.
- `AIRTABLE_WAITLIST_TABLE_ID`: required waitlist table ID. No fallback to `AIRTABLE_TABLE_NAME`.

Schema inspection/creation additionally requires `schema.bases:read` / `schema.bases:write`. Runtime does not need schema access. Never put the token in a public environment variable or paste it into chat.

Instant access additionally requires these server-only production variables:

- `DEMI_API_URL`: the deployed coach API origin, currently `https://35.207.114.37`.
- `DEMI_ENROLLMENT_KEY`: the website enrollment bearer secret, stored as a Vercel Secret. It must match the backend. Never expose it in a `NEXT_PUBLIC_` variable.

Enrollment calls `POST /enroll` with `{ phone, timezone, consent: true, provider: "photon" }`. Success must echo the submitted phone and a valid E.164 `number`. The backend is idempotent for an existing user and does not change their preferences or timezone. A real inbound message starts coaching, not the web form.

## Behavior

- Native country picker (Greece initially), flag, calling code and country-specific mobile example. The client accepts national numbers using the selected country; a full international number switches the picker automatically. The server still requires a normalized international number. No OTP: ownership is **not verified**.
- The action is **Request access**. Confirmed enrollment shows **You’re in** and the assigned iMessage line. The draft is Greek on Greek-language devices, English otherwise. If enrollment is unavailable or the browser has no valid timezone, the saved request stays on the waitlist. Country names/examples are generated server-side and serialized to avoid differences between browser and server locale data.
- A single Airtable PATCH with `performUpsert.fieldsToMergeOn: ["Phone"]` handles repeated submissions. Supplied campaign tags are latest-touch; omitted tags and Airtable's original created time are preserved. Manually introducing duplicate Phone rows causes Airtable to reject ambiguous upserts rather than claim success.
- Confirm only after Airtable returns the expected saved record. A retry after a lost response targets the same normalized Phone.
- Store only the phone, consent version (`pt-waitlist-v2`), fixed source path and five bounded UTM tags in Airtable. The browser timezone goes to the coach backend for new-user check-in timing. Do not emit a new ad conversion or pass the phone to analytics. Existing site-wide analytics are unchanged.
- Same-origin requests, 4 KB body limit, honeypot and bounded per-instance throttling (30 attempts / 15 minutes / IP hash). This is basic abuse resistance, not a distributed limiter or proof of human/phone ownership. Airtable throttling fails safely; there is no durable background signup queue.
- Airtable has a 10-second deadline, followed by a 15-second enrollment deadline. The route allows 30 seconds and the browser waits up to 35 seconds, so it cannot time out before the server finishes its normal work.
- For waitlisted requests without confirmed enrollment, follow-up remains manual; this change does not implement outbound automation.

## Verification

Run `bun test src/lib/pt-waitlist.test.ts src/app/pt/first-text.test.ts`, `bunx tsc --noEmit`, and `bun run build`.

Provider tests mock Airtable, including duplicate upsert payloads and provider failures. Before deploying, configure the real table and verify a reserved test number saves once on repeated submission; remove only that test record afterward. Do not mistake a mocked test for live Airtable acceptance.

API contract: [Airtable upserts](https://airtable.com/developers/web/api/update-multiple-records).

### Production release: October 3, 2026

- Source `7465857` on `pt-waitlist-instant`, committed and pushed. Deployed to the existing Vercel project `team-rockets-team/ovrmn`, then promoted after verification. Deployment: `dpl_HeXbaMmq8sj7GJuFBFBDUGMuuHER` (`ovrmn-qibltsx2i-team-rockets-team.vercel.app`). Public page: `https://www.ovrmn.com/pt-waitlist`.
- Production `DEMI_API_URL` and `DEMI_ENROLLMENT_KEY` configured server-side. An authenticated invalid-payload request to the coach API returns 400, verifying the private key without enrolling anyone.
- 18 focused tests, TypeScript, scoped ESLint, local production build and Vercel build passed. Tests cover exact-phone response validation, idempotent retry identity, storage-before-enrollment, failure fallback, validation and timeout budgets.
- Browser checks on the built source used a local-only response fixture: checking/success with the assigned-line SMS draft, invalid-number feedback, retry after failure with number retained, and saved-waitlist fallback. These are **mocked provider checks**, not live enrollment acceptance.
- After promotion, `/`, `/pt` and `/pt-waitlist` return 200; the public signup route rejects invalid details with 400 and cross-origin requests with 403. Live desktop/mobile form opens with Greece, flag/calling code and the country-specific placeholder; the 390px form has no horizontal overflow.
- No real signup was submitted, no Airtable rows or Photon contacts were created for QA, and no texts were sent. First real registration is still the final provider acceptance check.
- Rollback: promote the previous production deployment `dpl_2JodGkEoQdyJzKSCskkEzSVuXZhZ` (`ovrmn-d3udvll0r-team-rockets-team.vercel.app`, source `1ab4ffa`). The added server variables are unused by that older code.

### Verified 2026-09-23 (not deployed)

- Created `PT` in the existing OVRMN base: `appYWOqZ5dffRvdRY` / `tblmACYnfO0gUxHbR`.
- 12 focused tests passed, along with TypeScript, scoped ESLint and a production build.
- Actual local Next HTTP requests to live Airtable saved one reserved number twice in different formats, returning the same record ID. A separate mobile browser signup saved its expected phone, consent and UTM tags. Both test records were removed afterward; no Linq contacts or messages were created.
- Browser checks: 390px mobile, 1440px desktop, 320px narrow screen, both CTAs, invalid-number feedback, pending state, real saved confirmation, simulated provider failure with number retained/retry enabled, Escape/focus return, and no horizontal overflow.
- The real HTTP test caught and fixed a proxy-origin mismatch not covered by the original mocks; a regression test now covers public Host vs internal Next URL.
- Existing local website token returned 403. The separately supplied setup token succeeded and was used only in memory for testing. Production can reuse its existing `AIRTABLE_API_KEY` and `AIRTABLE_BASE_ID` if the token has write access; only the separate waitlist table variable is required. Local acceptance alone does not verify the production token.
- No production website deployment or analytics conversion integration was performed.
- Country-picker refinement: 14 focused tests passed. Browser checks covered UK selection/local-number submission, automatic US selection from an international number, updated flags/placeholders, and 320px/390px/1440px layouts. These additional submissions used a browser-only API mock, not live Airtable.
