# PT waitlist

`/pt-waitlist` shares the `/pt` landing page, but both **Text OVRMN** buttons open a phone-only waitlist dialog. `/pt` still opens iMessage. This flow never enrolls a Linq contact or sends a message.

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

## Behavior

- Native country picker (Greece initially), flag, calling code and country-specific mobile example. The client accepts national numbers using the selected country; a full international number switches the picker automatically. The server still requires a normalized international number. No OTP: ownership is **not verified**.
- The action is **Request access**, followed by a saved-request confirmation. This does not imply immediate access. Country names/examples are generated server-side and serialized to avoid differences between browser and server locale data.
- A single Airtable PATCH with `performUpsert.fieldsToMergeOn: ["Phone"]` handles repeated submissions. Supplied campaign tags are latest-touch; omitted tags and Airtable's original created time are preserved. Manually introducing duplicate Phone rows causes Airtable to reject ambiguous upserts rather than claim success.
- Confirm only after Airtable returns the expected saved record. A retry after a lost response targets the same normalized Phone.
- Store only the phone, consent version, fixed source path and five bounded UTM tags. Do not emit a new ad conversion or pass the phone to analytics. Existing site-wide analytics are unchanged.
- Same-origin requests, 4 KB body limit, honeypot and bounded per-instance throttling (30 attempts / 15 minutes / IP hash). This is basic abuse resistance, not a distributed limiter or proof of human/phone ownership. Airtable throttling fails safely; there is no durable background signup queue.
- Notification when a spot opens is manual; this change does not implement outbound automation.

## Verification

Run `bun test src/lib/pt-waitlist.test.ts src/app/pt/first-text.test.ts`, `bunx tsc --noEmit`, and `bun run build`.

Provider tests mock Airtable, including duplicate upsert payloads and provider failures. Before deploying, configure the real table and verify a reserved test number saves once on repeated submission; remove only that test record afterward. Do not mistake a mocked test for live Airtable acceptance.

API contract: [Airtable upserts](https://airtable.com/developers/web/api/update-multiple-records).

### Verified 2026-09-23 (not deployed)

- Created `PT` in the existing OVRMN base: `appYWOqZ5dffRvdRY` / `tblmACYnfO0gUxHbR`.
- 12 focused tests passed, along with TypeScript, scoped ESLint and a production build.
- Actual local Next HTTP requests to live Airtable saved one reserved number twice in different formats, returning the same record ID. A separate mobile browser signup saved its expected phone, consent and UTM tags. Both test records were removed afterward; no Linq contacts or messages were created.
- Browser checks: 390px mobile, 1440px desktop, 320px narrow screen, both CTAs, invalid-number feedback, pending state, real saved confirmation, simulated provider failure with number retained/retry enabled, Escape/focus return, and no horizontal overflow.
- The real HTTP test caught and fixed a proxy-origin mismatch not covered by the original mocks; a regression test now covers public Host vs internal Next URL.
- Existing local website token returned 403. The separately supplied setup token succeeded and was used only in memory for testing. Production can reuse its existing `AIRTABLE_API_KEY` and `AIRTABLE_BASE_ID` if the token has write access; only the separate waitlist table variable is required. Local acceptance alone does not verify the production token.
- No production website deployment or analytics conversion integration was performed.
- Country-picker refinement: 14 focused tests passed. Browser checks covered UK selection/local-number submission, automatic US selection from an international number, updated flags/placeholders, and 320px/390px/1440px layouts. These additional submissions used a browser-only API mock, not live Airtable.
