import { afterEach, test } from "node:test";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import JoinPage from "../app/join/[token]/page";
import JoinDone from "../app/join/[token]/done/page";
import { MembershipShell } from "../app/join/shell";
import TermsPage from "../app/terms/page";
import PrivacyPage from "../app/privacy/page";
import CancellationPage from "../app/refunds/page";

const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });
const token = "AbCdEf0123456789AbCdEf01";

test("PT, membership and legal navigation never leads to the separate product", () => {
  // Both /pt and /pt-waitlist use this landing component. Its font loader needs
  // Next's compiler, so check its brand markup here and the rendered page in QA.
  const landing = readFileSync(new URL("../app/pt/landing.tsx", import.meta.url), "utf8");
  const header = landing.match(/<header\b[\s\S]*?<\/header>/)?.[0];
  assert.ok(header);
  assert.match(header, />OVRMN<\/span>/);
  assert.doesNotMatch(header, /<(?:a|Link)\b/);

  const pages = [() => <MembershipShell>Membership</MembershipShell>, TermsPage, PrivacyPage, CancellationPage];
  for (const page of pages) {
    const html = renderToStaticMarkup(page());
    const header = html.match(/<header\b[\s\S]*?<\/header>/)?.[0];
    assert.ok(header);
    assert.match(header, />OVRMN<\/span>/);
    assert.doesNotMatch(header, /<a\b/);
    assert.doesNotMatch(html, /href="(?:\/|\/contact|https:\/\/(?:www\.)?ovrmn\.com\/?)"/);
    assert.match(html, /href="mailto:support@ovrmn\.com"/);
    for (const path of ["/terms", "/privacy", "/refunds"]) assert.ok(html.includes(`href="${path}"`));
  }
});

test("GET rendering is passive and provides an explicit POST checkout form", async () => {
  globalThis.fetch = (() => { assert.fail("Rendering a preview must never call billing"); }) as unknown as typeof fetch;
  const page = await JoinPage({ params: Promise.resolve({ token }), searchParams: Promise.resolve({ error: "private-provider-failure" }) });
  const html = renderToStaticMarkup(page);
  const form = html.match(/<form[^>]*>/)?.[0] || "";
  assert.match(form, /method="post"/);
  assert.match(form, /action="\/api\/join"/);
  assert.match(html, new RegExp(`name="token" value="${token}"`));
  assert.match(html, /Includes tax\. Renews monthly\. Cancel anytime\./);
  assert.match(html, /Continue/);
  assert.equal(html.includes("private-provider-failure"), false);
});

test("an invalid link renders fresh-link help without making a membership lookup", async () => {
  globalThis.fetch = (() => { assert.fail("Invalid previews must not call billing"); }) as unknown as typeof fetch;
  const page = await JoinPage({ params: Promise.resolve({ token: "invalid" }), searchParams: Promise.resolve({}) });
  const html = renderToStaticMarkup(page);
  assert.match(html, /new link/);
  assert.equal(html.includes("/api/join"), false);
});

test("the return page explains confirmation instead of asserting a subscription", () => {
  const html = renderToStaticMarkup(<JoinDone />);
  assert.match(html, /If you completed checkout/);
  assert.match(html, /confirming your membership/);
  assert.match(html, /Check your Messages conversation for confirmation/);
  assert.equal(html.includes("You&#x27;re in"), false);
  assert.equal(html.includes("subscribed"), false);
});
