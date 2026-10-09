import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  normalizeWaitlistPhone,
  WAITLIST_CONSENT,
  WAITLIST_SAVE_TIMEOUT_MS,
  WAITLIST_ENROLL_TIMEOUT_MS,
  WAITLIST_REQUEST_TIMEOUT_MS,
  waitlistAttribution,
  sanitizePtAnalytics,
} from "./pt-waitlist";
import { POST, maxDuration } from "../app/api/pt-waitlist/route";
import { phoneCountries } from "../app/pt-waitlist/phone-countries";
import { getMetaPixelIdForPath, getMetaPixelId } from "./meta-browser";

const originalFetch = globalThis.fetch;
const envKeys = [
  "AIRTABLE_BASE_ID",
  "AIRTABLE_WAITLIST_BASE_ID",
  "AIRTABLE_WAITLIST_TABLE_ID",
  "AIRTABLE_API_KEY",
  "AIRTABLE_WAITLIST_API_KEY",
  "AIRTABLE_TABLE_NAME",
  "DEMI_API_URL",
  "DEMI_ENROLLMENT_KEY",
] as const;
const originalEnv = Object.fromEntries(
  envKeys.map((key) => [key, process.env[key]]),
);
afterEach(() => {
  globalThis.fetch = originalFetch;
  for (const key of envKeys) {
    if (originalEnv[key] === undefined) delete process.env[key];
    else process.env[key] = originalEnv[key];
  }
});
function setup() {
  delete process.env.DEMI_API_URL;
  delete process.env.DEMI_ENROLLMENT_KEY;
  delete process.env.AIRTABLE_WAITLIST_API_KEY;
  delete process.env.AIRTABLE_WAITLIST_BASE_ID;
  process.env.AIRTABLE_BASE_ID = "appTest";
  process.env.AIRTABLE_WAITLIST_TABLE_ID = "tblWaitlist";
  process.env.AIRTABLE_API_KEY = "pat_test_only";
}
function stubFetch(
  implementation: (
    input: RequestInfo | URL,
    init?: RequestInit,
  ) => Promise<Response>,
) {
  globalThis.fetch = implementation as typeof fetch;
}
function saved(phone = "+12025550123") {
  return Response.json({
    records: [{ id: "recTest", fields: { Phone: phone } }],
  });
}
function request(
  body: unknown = { phone: "+1 (202) 555-0123", consent: WAITLIST_CONSENT },
  headers: Record<string, string> = {},
) {
  return new Request("https://ovrmn.test/api/pt-waitlist", {
    method: "POST",
    headers: {
      origin: "https://ovrmn.test",
      "content-type": "application/json",
      "x-forwarded-for": crypto.randomUUID(),
      ...headers,
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

test("phone normalization accepts international formatting, not guessed country codes or malformed numbers", () => {
  for (const value of ["+1 (202) 555-0123", "0012025550123", "+12025550123"])
    assert.equal(normalizeWaitlistPhone(value), "+12025550123");
  assert.equal(normalizeWaitlistPhone("+30 691 234 5678"), "+306912345678");
  for (const value of [
    null,
    123,
    "6912345678",
    "+12345678",
    "+999123456789",
    "+12025550123 ext 1",
    "call +12025550123",
    "+1".repeat(30),
  ])
    assert.equal(normalizeWaitlistPhone(value), null);
});

test("browser and hosting deadlines allow the sequential save and enrollment to finish", () => {
  assert.ok(maxDuration * 1000 > WAITLIST_SAVE_TIMEOUT_MS + WAITLIST_ENROLL_TIMEOUT_MS);
  assert.ok(WAITLIST_REQUEST_TIMEOUT_MS > maxDuration * 1000);
});

test("country selection normalizes local numbers and preserves explicit international numbers", () => {
  for (const [country, local, expected] of [
    ["GR", "691 234 5678", "+306912345678"],
    ["GB", "07400 123456", "+447400123456"],
    ["US", "(202) 555-0123", "+12025550123"],
    ["DE", "01512 3456789", "+4915123456789"],
    ["CY", "96 123456", "+35796123456"],
  ] as const) {
    assert.equal(normalizeWaitlistPhone(local, country), expected);
    assert.equal(
      normalizeWaitlistPhone(local),
      null,
      "API must not guess a country",
    );
  }
  assert.equal(normalizeWaitlistPhone("+1 202 555 0123", "GR"), "+12025550123");
  assert.equal(
    normalizeWaitlistPhone("0044 7400 123456", "GR"),
    "+447400123456",
  );
  for (const value of [
    "123",
    "call 6912345678",
    "6912345678 ext 1",
    "",
    "+999123456789",
  ])
    assert.equal(normalizeWaitlistPhone(value, "GR"), null);
});

test("ambiguous US local numbers need an explicit country, not the former Greece default", () => {
  const local = "2515550123";
  // Both parses are valid. Metadata cannot choose the owner's country for us.
  assert.equal(normalizeWaitlistPhone(local, "GR"), "+302515550123");
  assert.equal(normalizeWaitlistPhone(local), null);
  assert.equal(normalizeWaitlistPhone(local, "US"), "+12515550123");
  assert.equal(normalizeWaitlistPhone("(251) 555-0123", "US"), "+12515550123");
  assert.equal(normalizeWaitlistPhone("+1 251 555 0123"), "+12515550123");
  assert.equal(normalizeWaitlistPhone("0012515550123", "GR"), "+12515550123");
});

test("country choices provide flags, calling codes and country-specific mobile placeholders", () => {
  assert.ok(phoneCountries.length > 200);
  const placeholders = new Set<string>();
  for (const code of ["GR", "GB", "US", "DE", "CY"]) {
    const option = phoneCountries.find((item) => item.country === code)!;
    assert.ok(option.name);
    assert.equal([...option.flag].length, 2);
    assert.match(option.callingCode, /^\d{1,3}$/);
    assert.ok(normalizeWaitlistPhone(option.placeholder, option.country));
    placeholders.add(option.placeholder);
  }
  assert.equal(placeholders.size, 5);
});

test("campaign capture allows only bounded campaign tags, not arbitrary URL or contact payloads", () => {
  assert.deepEqual(
    waitlistAttribution({
      utm_source: " meta ",
      utm_campaign: "a".repeat(200),
      phone: "private",
      referrer: "private",
      utm_term: 42,
    }),
    { utm_source: "meta", utm_campaign: "a".repeat(160) },
  );
  for (const value of [null, [], "bad"])
    assert.deepEqual(waitlistAttribution(value), {});
});

test("PT attribution accepts bounded IDs and campaign tags, stripping contacts, health data and conversion claims", () => {
  const id = crypto.randomUUID();
  assert.deepEqual(sanitizePtAnalytics({ event_id: id, event_name: "Purchase", amount: 29,
    attribution: { anonymous_id: id, fbp: "fb.1.1234.5678", fbc: "fb.1.1234.click_id",
      phone: "+12025550123", weight: 80, conversation: "private", url: "https://private.invalid",
      utm_source: " meta ", utm_campaign: "x".repeat(200) } }), {
    event_id: id, attribution: { anonymous_id: id, fbp: "fb.1.1234.5678", fbc: "fb.1.1234.click_id",
      utm_source: "meta", utm_campaign: "x".repeat(160) },
  });
  assert.deepEqual(sanitizePtAnalytics({ event_id: id, attribution: { fbp: "x".repeat(501), anonymous_id: "bad" } }),
    { event_id: id, attribution: {} });
  for (const value of [null, [], "bad", { event_id: "bad" }]) assert.equal(sanitizePtAnalytics(value), undefined);
  const previous = process.env.NEXT_PUBLIC_PT_META_PIXEL_ID;
  try {
    process.env.NEXT_PUBLIC_PT_META_PIXEL_ID = "123456";
    for (const path of ["/pt", "/pt-waitlist", "/pt/a"]) assert.equal(getMetaPixelIdForPath(path), "123456");
    for (const path of ["/", "/book", "/pt-other", "/joining"]) assert.equal(getMetaPixelIdForPath(path), getMetaPixelId());
  } finally {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_PT_META_PIXEL_ID;
    else process.env.NEXT_PUBLIC_PT_META_PIXEL_ID = previous;
  }
});

test("only saved leads forward sanitized attribution and return the backend ID used for browser/server deduplication", async () => {
  setup();
  process.env.DEMI_API_URL = "https://api.ovrmn.test";
  process.env.DEMI_ENROLLMENT_KEY = "enroll_test_only";
  const clientId = crypto.randomUUID(), canonicalId = crypto.randomUUID();
  let stored = false;
  const signup = () => request({ phone: "+12025550123", consent: WAITLIST_CONSENT, timezone: "UTC",
    analytics: { event_id: clientId, attribution: { utm_source: "meta", weight: 80, phone: "+12025550123",
      client_user_agent: "forged", client_ip_address: "198.51.100.1" } } },
    { "user-agent": "Mozilla/5.0 Synthetic", "x-forwarded-for": "192.0.2.1, 198.51.100.2" });
  for (const full of [false, true]) {
    stubFetch(async (url, init) => {
      if (String(url).startsWith("https://api.airtable.com")) { stored = true; return saved(); }
      assert.ok(stored);
      assert.deepEqual(JSON.parse(String(init?.body)).analytics, { event_id: clientId, attribution: {
        utm_source: "meta", client_user_agent: "Mozilla/5.0 Synthetic", client_ip_address: "192.0.2.1" } });
      return full ? Response.json({ error: "enrollment_unavailable", leadEventId: canonicalId }, { status: 503 })
        : Response.json({ phone: "+12025550123", number: "+14155550100", leadEventId: canonicalId });
    });
    const result = await (await POST(signup())).json();
    assert.deepEqual(result, { ok: true, ...(full ? {} : { number: "+14155550100" }), leadEventId: canonicalId });
    stored = false;
  }
  let calls = 0;
  stubFetch(async () => { calls++; return new Response("failed", { status: 503 }); });
  assert.equal((await POST(signup())).status, 503);
  assert.equal(calls, 1, "a failed Airtable write must not generate a lead or enroll anyone");
});

test("misconfiguration fails closed, never returns a fake waitlist success", async () => {
  setup();
  delete process.env.AIRTABLE_WAITLIST_TABLE_ID;
  process.env.AIRTABLE_TABLE_NAME = "Demo leads";
  assert.equal((await POST(request())).status, 503);
});

test("same-origin checks use the public Host behind Next's internal URL", async () => {
  setup();
  stubFetch(async () => saved());
  const req = new Request("http://localhost:3101/api/pt-waitlist", {
    method: "POST",
    headers: {
      host: "ovrmn.test",
      origin: "https://ovrmn.test",
      "content-type": "application/json",
    },
    body: JSON.stringify({ phone: "+12025550123", consent: WAITLIST_CONSENT }),
  });
  assert.equal((await POST(req)).status, 200);
  for (const origin of [
    "",
    "null",
    "https://evil.test",
    "https://ovrmn.test/path",
    "https://ovrmn.test:444",
  ])
    assert.equal(
      (await POST(request(undefined, { host: "ovrmn.test", origin }))).status,
      403,
    );
});

test("cross-site, malformed, oversized, invalid-number and unconsented submissions never reach storage", async () => {
  setup();
  let calls = 0;
  stubFetch(async () => {
    calls++;
    throw new Error("unexpected_storage_request");
  });
  for (const [req, status] of [
    [request(undefined, { origin: "https://evil.test" }), 403],
    [request(undefined, { "content-type": "text/plain" }), 415],
    [request("{"), 400],
    [request("x".repeat(4097)), 413],
    [request([]), 400],
    [request({ phone: "+12025550123" }), 400],
    [request({ phone: "123", consent: WAITLIST_CONSENT }), 400],
    [
      request({
        phone: "+12025550123",
        consent: WAITLIST_CONSENT,
        website: "spam",
      }),
      400,
    ],
  ] as const)
    assert.equal((await POST(req)).status, status);
  assert.equal(calls, 0);
});

test("a saved signup uses one Airtable upsert by normalized phone and keeps credentials private", async () => {
  setup();
  let calls = 0;
  stubFetch(async (url, init) => {
    calls++;
    assert.equal(
      String(url),
      "https://api.airtable.com/v0/appTest/tblWaitlist",
    );
    const headers = new Headers(init?.headers);
    assert.equal(headers.get("authorization"), "Bearer pat_test_only");
    assert.equal(init?.method, "PATCH");
    assert.equal(init?.redirect, "error");
    assert.deepEqual(JSON.parse(String(init?.body)), {
      performUpsert: { fieldsToMergeOn: ["Phone"] },
      records: [
        {
          fields: {
            Phone: "+12025550123",
            "Consent version": WAITLIST_CONSENT,
            "Source path": "/pt-waitlist",
            utm_source: "meta",
          },
        },
      ],
    });
    return saved();
  });
  const response = await POST(
    request({
      phone: "+1 (202) 555-0123",
      consent: WAITLIST_CONSENT,
      attribution: { utm_source: "meta", extra: "private" },
    }),
  );
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.deepEqual(await response.json(), { ok: true });
  assert.equal(calls, 1);
});

test("duplicate formats merge on the same phone, and a separate base can be configured", async () => {
  setup();
  process.env.AIRTABLE_WAITLIST_BASE_ID = "appWaitlist";
  process.env.AIRTABLE_WAITLIST_API_KEY = "pat_waitlist_only";
  const records = new Map<string, Record<string, string>>();
  stubFetch(async (url, init) => {
    assert.equal(
      String(url),
      "https://api.airtable.com/v0/appWaitlist/tblWaitlist",
    );
    assert.equal(
      new Headers(init?.headers).get("authorization"),
      "Bearer pat_waitlist_only",
    );
    const payload = JSON.parse(String(init?.body));
    assert.deepEqual(payload.performUpsert.fieldsToMergeOn, ["Phone"]);
    const fields = payload.records[0].fields;
    records.set(fields.Phone, { ...records.get(fields.Phone), ...fields });
    return saved(fields.Phone);
  });
  for (const phone of ["+1 (202) 555-0123", "0012025550123"])
    assert.equal(
      (await POST(request({ phone, consent: WAITLIST_CONSENT }))).status,
      200,
    );
  assert.equal(records.size, 1);
});

test("provider failures and malformed successes never leak details or confirm a signup", async () => {
  setup();
  for (const upstream of [
    new Response("private provider details", { status: 403 }),
    new Response("private provider details", { status: 429 }),
    new Response("private provider details", { status: 500 }),
    Response.json({}),
    Response.json({ records: [] }),
    saved("+12025550124"),
    new Response("not json", { status: 200 }),
  ]) {
    stubFetch(async () => upstream);
    const response = await POST(request());
    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), { error: "unavailable" });
  }
  stubFetch(async () => {
    throw new Error("private transport error");
  });
  assert.equal((await POST(request())).status, 503);
});

test("repeated attempts are bounded before making another storage call", async () => {
  setup();
  let calls = 0;
  stubFetch(async () => {
    calls++;
    return saved();
  });
  const ip = crypto.randomUUID();
  for (let index = 0; index < 30; index++)
    assert.equal(
      (await POST(request(undefined, { "x-forwarded-for": ip }))).status,
      200,
    );
  const response = await POST(request(undefined, { "x-forwarded-for": ip }));
  assert.equal(response.status, 429);
  assert.equal(response.headers.get("retry-after"), "900");
  assert.equal(calls, 30);
});

test("signing up is joining: the coach's backend registers the number with Photon and answers with the line to text", async () => {
  setup();
  process.env.DEMI_API_URL = "https://api.ovrmn.test";
  process.env.DEMI_ENROLLMENT_KEY = "enroll_test_only";
  const enrollments: unknown[] = [];
  stubFetch(async (url, init) => {
    if (String(url).startsWith("https://api.airtable.com")) return saved();
    assert.equal(String(url), "https://api.ovrmn.test/enroll");
    assert.equal(new Headers(init?.headers).get("authorization"), "Bearer enroll_test_only");
    enrollments.push(JSON.parse(String(init?.body)));
    return Response.json({ phone: "+12025550123", number: "+14155550100" });
  });
  const response = await POST(
    request({ phone: "+1 (202) 555-0123", consent: WAITLIST_CONSENT, timezone: "America/New_York" }),
  );
  assert.deepEqual(await response.json(), { ok: true, number: "+14155550100" });
  assert.deepEqual(enrollments, [
    { phone: "+12025550123", timezone: "America/New_York", consent: true, provider: "photon" },
  ]);
});

test("enrollment only runs after storage confirms the exact phone; retries use the same normalized identity", async () => {
  setup();
  process.env.DEMI_API_URL = "https://api.ovrmn.test";
  process.env.DEMI_ENROLLMENT_KEY = "enroll_test_only";
  const enrollments: string[] = [];
  let storageAvailable = false;
  stubFetch(async (url, init) => {
    if (String(url).startsWith("https://api.airtable.com"))
      return storageAvailable ? saved() : new Response("storage unavailable", { status: 503 });
    const payload = JSON.parse(String(init?.body));
    enrollments.push(payload.phone);
    assert.equal(init?.redirect, "error");
    assert.equal(init?.cache, "no-store");
    return Response.json({ phone: payload.phone, number: "+14155550100" });
  });
  const signup = (phone: string) => request({ phone, consent: WAITLIST_CONSENT, timezone: "Europe/Athens" });
  assert.equal((await POST(signup("+12025550123"))).status, 503);
  assert.equal(enrollments.length, 0);
  storageAvailable = true;
  for (const phone of ["+1 (202) 555-0123", "0012025550123"])
    assert.deepEqual(await (await POST(signup(phone))).json(), { ok: true, number: "+14155550100" });
  assert.deepEqual(enrollments, ["+12025550123", "+12025550123"]);
});

test("without a confirmed spot the person stays on the waitlist, and nothing private leaks", async () => {
  setup();
  process.env.DEMI_API_URL = "https://api.ovrmn.test";
  process.env.DEMI_ENROLLMENT_KEY = "enroll_test_only";
  for (const answer of [
    new Response("private backend details", { status: 503 }),
    Response.json({ phone: "+12025550124", number: "+14155550100" }),
    Response.json({ phone: "+12025550123", number: "call us" }),
    new Response("not json", { status: 200 }),
  ]) {
    stubFetch(async (url) => (String(url).startsWith("https://api.airtable.com") ? saved() : answer));
    const response = await POST(request({ phone: "+12025550123", consent: WAITLIST_CONSENT, timezone: "Europe/Athens" }));
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { ok: true });
  }
  let backend = 0;
  stubFetch(async (url) => {
    if (String(url).startsWith("https://api.airtable.com")) return saved();
    backend++;
    return Response.json({ phone: "+12025550123", number: "+14155550100" });
  });
  for (const timezone of [undefined, "Mars/Olympus", "x".repeat(81)])
    assert.deepEqual(
      await (await POST(request({ phone: "+12025550123", consent: WAITLIST_CONSENT, timezone }))).json(),
      { ok: true },
    );
  assert.equal(backend, 0);
});
