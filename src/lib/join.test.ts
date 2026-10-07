import { afterEach, test } from "node:test";
import assert from "node:assert/strict";
import { POST, maxDuration } from "../app/api/join/route";
import { JOIN_CHECKOUT_TIMEOUT_MS, joinErrorMessage, trustedCheckoutUrl, validJoinToken } from "./join";

const token = "AbCdEf0123456789AbCdEf01";
const originalFetch = globalThis.fetch;
const envKeys = ["DEMI_BILLING_API_URL", "DEMI_API_URL", "DEMI_BILLING_KEY"] as const;
const originalEnv = Object.fromEntries(envKeys.map((key) => [key, process.env[key]]));
afterEach(() => {
  globalThis.fetch = originalFetch;
  for (const key of envKeys) {
    if (originalEnv[key] === undefined) delete process.env[key];
    else process.env[key] = originalEnv[key];
  }
});

function setup() {
  process.env.DEMI_BILLING_API_URL = "https://billing.ovrmn.test";
  process.env.DEMI_API_URL = "https://enrollment.ovrmn.test";
  process.env.DEMI_BILLING_KEY = "billing_test_only";
}
function request(body: unknown = { token }, headers: Record<string, string> = {}, url = "https://www.ovrmn.test/api/join") {
  return new Request(url, {
    method: "POST",
    headers: {
      origin: "https://www.ovrmn.test",
      "content-type": "application/json",
      "x-forwarded-for": crypto.randomUUID(),
      ...headers,
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}
function stubFetch(implementation: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>) {
  globalThis.fetch = implementation as typeof fetch;
}
function nativeFormRequest(headers: Record<string, string> = {}, url = "https://www.ovrmn.test/api/join") {
  return request(`token=${token}`, {
    origin: "null",
    "content-type": "application/x-www-form-urlencoded",
    "sec-fetch-site": "same-origin",
    "sec-fetch-mode": "navigate",
    "sec-fetch-dest": "document",
    ...headers,
  }, url);
}

test("join capability shape and consumer errors are allowlisted", () => {
  assert.equal(validJoinToken(token), true);
  for (const value of [null, "", "a".repeat(23), "a".repeat(25), "a".repeat(23) + "/", 12])
    assert.equal(validJoinToken(value), false);
  assert.equal(joinErrorMessage("unavailable")?.includes("try again"), true);
  for (const value of ["<script>", "constructor", ["unavailable"], undefined]) assert.equal(joinErrorMessage(value), null);
});

test("checkout redirects accept only the trusted HTTPS Stripe authority", () => {
  assert.equal(trustedCheckoutUrl("https://checkout.stripe.com/c/pay/cs_test_safe"), "https://checkout.stripe.com/c/pay/cs_test_safe");
  for (const value of [
    "http://checkout.stripe.com/c/pay/test", "https://checkout.stripe.com.evil.test/test",
    "https://evil.test/?checkout.stripe.com", "https://user:pass@checkout.stripe.com/test",
    "https://checkout.stripe.com:444/test", "//checkout.stripe.com/test", "javascript:alert(1)", null,
  ]) assert.equal(trustedCheckoutUrl(value), null);
  assert.ok(JOIN_CHECKOUT_TIMEOUT_MS >= 11_000 + 2_000, "Allow the backend's 11-second deadline plus network overhead");
  assert.ok(maxDuration * 1000 >= JOIN_CHECKOUT_TIMEOUT_MS + 2_000, "Hosting must outlast the upstream deadline");
});

test("origin validation rejects cross-origin and missing-origin before backend work", async () => {
  setup();
  stubFetch(async () => { assert.fail("Must not call backend"); });
  for (const origin of ["https://evil.test", "null", "https://www.ovrmn.test/path", ""]) {
    assert.equal((await POST(request(undefined, { origin }))).status, 403);
  }
});

test("public Host is used behind a reverse proxy and billing-specific origin wins", async () => {
  setup();
  let calls = 0;
  stubFetch(async (input, init) => {
    calls++;
    assert.equal(String(input), "https://billing.ovrmn.test/billing/checkout");
    assert.equal(init?.headers && (init.headers as Record<string, string>).Authorization, "Bearer billing_test_only");
    assert.equal(init?.body, JSON.stringify({ token }));
    assert.equal(init?.redirect, "error");
    assert.equal(init?.cache, "no-store");
    assert.ok(init?.signal);
    return Response.json({ state: "checkout", url: "https://checkout.stripe.com/c/pay/cs_test_safe" });
  });
  const response = await POST(request(undefined, { host: "www.ovrmn.test" }, "http://localhost:3000/api/join"));
  assert.equal(calls, 1);
  assert.equal(response.status, 303);
  assert.equal(response.headers.get("location"), "https://checkout.stripe.com/c/pay/cs_test_safe");
  assert.equal(response.headers.get("referrer-policy"), "no-referrer");
  assert.equal(response.headers.get("cache-control"), "no-store");
});

test("no-referrer native form accepts null Origin only with same-origin document-navigation metadata", async () => {
  setup();
  let calls = 0;
  stubFetch(async (_input, init) => {
    calls++;
    assert.equal(init?.body, JSON.stringify({ token }));
    return Response.json({ state: "checkout", url: "https://checkout.stripe.com/c/pay/cs_test_safe" });
  });
  const response = await POST(nativeFormRequest());
  assert.equal(calls, 1);
  assert.equal(response.status, 303);
  assert.equal(response.headers.get("location"), "https://checkout.stripe.com/c/pay/cs_test_safe");
  assert.equal(response.headers.get("referrer-policy"), "no-referrer");
  assert.equal(response.headers.get("cache-control"), "no-store");
});

test("null Origin rejects cross-site, sibling-site, opaque sandbox, missing metadata and JSON before backend work", async () => {
  setup();
  stubFetch(async () => { assert.fail("Must not call backend"); });
  const invalidHeaders: Record<string, string>[] = [
    { "sec-fetch-site": "cross-site" }, { "sec-fetch-site": "same-site" }, { "sec-fetch-site": "none" },
    { "sec-fetch-site": "" }, { "sec-fetch-mode": "" }, { "sec-fetch-dest": "" },
    { "sec-fetch-mode": "cors" }, { "sec-fetch-mode": "no-cors" },
    { "sec-fetch-dest": "iframe" }, { "sec-fetch-dest": "empty" },
    { origin: "" }, { origin: "https://evil.test" },
    { "content-type": "application/json" }, { "content-type": "multipart/form-data" },
  ];
  for (const headers of invalidHeaders) {
    const response = await POST(nativeFormRequest(headers));
    assert.equal(response.status, 403);
    assert.deepEqual(await response.json(), { error: "forbidden" });
  }
  const absentMetadata = nativeFormRequest();
  for (const name of ["sec-fetch-site", "sec-fetch-mode", "sec-fetch-dest"]) absentMetadata.headers.delete(name);
  assert.equal((await POST(absentMetadata)).status, 403);
  const nullJson = request({ token }, {
    origin: "null", "sec-fetch-site": "same-origin", "sec-fetch-mode": "navigate", "sec-fetch-dest": "document",
  });
  assert.equal((await POST(nullJson)).status, 403);
});

test("null-Origin form redirects use public Host and trusted proxy protocol, never forwarded host", async () => {
  setup();
  stubFetch(async () => Response.json({ state: "member" }));
  const proxy = await POST(nativeFormRequest({
    host: "www.ovrmn.test", "x-forwarded-proto": "https", "x-forwarded-host": "evil.test",
  }, "http://localhost:3000/api/join"));
  assert.equal(proxy.status, 303);
  assert.equal(proxy.headers.get("location"), `https://www.ovrmn.test/join/${token}/done`);
  const local = await POST(nativeFormRequest({ host: "localhost:3418" }, "http://localhost:3418/api/join"));
  assert.equal(local.headers.get("location"), `http://localhost:3418/join/${token}/done`);
  stubFetch(async () => { throw new Error("synthetic failure"); });
  const retry = await POST(nativeFormRequest({ host: "www.ovrmn.test", "x-forwarded-proto": "https" }, "http://localhost:3000/api/join"));
  assert.equal(retry.headers.get("location"), `https://www.ovrmn.test/join/${token}?error=unavailable`);
});

test("null-Origin form rejects malformed authorities and untrusted protocol chains before backend work", async () => {
  setup();
  stubFetch(async () => { assert.fail("Must not call backend"); });
  for (const host of ["www.ovrmn.test/path", "user@www.ovrmn.test", "www.ovrmn.test,evil.test", "www.ovrmn.test#fragment", "www.ovrmn.test?query"]) {
    assert.equal((await POST(nativeFormRequest({ host }))).status, 403);
  }
  for (const protocol of ["", "javascript", "ftp", "https,http", "https, http", "https:"]) {
    assert.equal((await POST(nativeFormRequest({ "x-forwarded-proto": protocol }))).status, 403);
  }
});

test("existing enrollment API origin remains a supported fallback", async () => {
  setup();
  delete process.env.DEMI_BILLING_API_URL;
  stubFetch(async (input) => {
    assert.equal(String(input), "https://enrollment.ovrmn.test/billing/checkout");
    return Response.json({ state: "comped" });
  });
  assert.equal((await POST(request())).status, 303);
});

test("member and comped states only redirect locally, without a spoofable paid assertion", async () => {
  setup();
  for (const state of ["member", "comped"]) {
    stubFetch(async () => Response.json({ state, url: "https://evil.test" }));
    const response = await POST(request());
    assert.equal(response.status, 303);
    assert.equal(response.headers.get("location"), `https://www.ovrmn.test/join/${token}/done`);
  }
});

test("unknown states and hostile/malformed provider responses fail without leaking details", async () => {
  setup();
  for (const body of [
    { state: "unknown", token }, { state: "checkout", url: "https://evil.test/" },
    { state: "checkout", url: "https://checkout.stripe.com:444/test" }, null,
  ]) {
    stubFetch(async () => Response.json(body));
    const response = await POST(request());
    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), { error: "unavailable" });
  }
  stubFetch(async () => new Response("private provider details", { status: 200 }));
  assert.deepEqual(await (await POST(request())).json(), { error: "unavailable" });
});

test("body cap is enforced while streaming and malformed/token-invalid requests never call backend", async () => {
  setup();
  stubFetch(async () => { assert.fail("Must not call backend"); });
  for (const body of ["invalid json", "null", "[]", "{}", JSON.stringify({ token: "bad" })])
    assert.equal((await POST(request(body))).status, 400);
  assert.equal((await POST(request("x".repeat(4097)))).status, 413);
  assert.equal((await POST(request(undefined, { "content-type": "text/plain" }))).status, 415);
  assert.equal((await POST(request(`token=${token}&token=${token}`, { "content-type": "application/x-www-form-urlencoded" }))).status, 400);
});

test("native form creates checkout on POST and sanitized retry preserves its private link", async () => {
  setup();
  let calls = 0;
  stubFetch(async (_input, init) => {
    calls++;
    assert.equal(init?.body, JSON.stringify({ token }));
    throw new Error(`secret backend detail ${token}`);
  });
  const response = await POST(request(`token=${token}`, { "content-type": "application/x-www-form-urlencoded" }));
  assert.equal(calls, 1);
  assert.equal(response.status, 303);
  assert.equal(response.headers.get("location"), `https://www.ovrmn.test/join/${token}?error=unavailable`);
  assert.equal(await response.text(), "");
});

test("missing config and backend failures fail closed; unknown links get a fresh-link instruction", async () => {
  setup();
  delete process.env.DEMI_BILLING_KEY;
  stubFetch(async () => { assert.fail("Must not call backend"); });
  assert.equal((await POST(request())).status, 503);
  assert.equal((await POST(request(`token=${token}`, { "content-type": "application/x-www-form-urlencoded" }))).headers.get("location"), `https://www.ovrmn.test/join/${token}?error=unavailable`);
  setup();
  for (const status of [401, 500, 503]) {
    stubFetch(async () => new Response("secret", { status }));
    assert.deepEqual(await (await POST(request())).json(), { error: "unavailable" });
  }
  stubFetch(async () => new Response("unknown private token", { status: 404 }));
  assert.deepEqual(await (await POST(request())).json(), { error: "invalid_link" });
});

test("an existing subscription or checkout awaiting sync gets helpful feedback without another purchase claim", async () => {
  setup();
  for (const error of ["subscription_exists", "payment_processing"]) {
    stubFetch(async () => Response.json({ error, private: token }, { status: 409 }));
    const response = await POST(request());
    assert.equal(response.status, 409);
    assert.deepEqual(await response.json(), { error });
    const form = await POST(request(`token=${token}`, { "content-type": "application/x-www-form-urlencoded" }));
    assert.equal(form.status, 303);
    assert.equal(form.headers.get("location"), `https://www.ovrmn.test/join/${token}?error=${error}`);
  }
  stubFetch(async () => Response.json({ error: "secret-provider-error" }, { status: 409 }));
  assert.deepEqual(await (await POST(request())).json(), { error: "unavailable" });
});

test("per-IP retries are bounded and the rate-limit response contains no IP or token", async () => {
  setup();
  stubFetch(async () => Response.json({ state: "comped" }));
  const ip = crypto.randomUUID();
  for (let i = 0; i < 30; i++) assert.equal((await POST(request(undefined, { "x-forwarded-for": ip }))).status, 303);
  const response = await POST(request(undefined, { "x-forwarded-for": ip }));
  assert.equal(response.status, 429);
  assert.equal(response.headers.get("retry-after"), "900");
  assert.deepEqual(await response.json(), { error: "slow_down" });
});
