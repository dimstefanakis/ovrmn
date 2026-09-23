import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  normalizeWaitlistPhone,
  WAITLIST_CONSENT,
  waitlistAttribution,
} from "./pt-waitlist";
import { POST } from "../app/api/pt-waitlist/route";
import { phoneCountries } from "../app/pt-waitlist/phone-countries";

const originalFetch = globalThis.fetch;
const envKeys = [
  "AIRTABLE_BASE_ID",
  "AIRTABLE_WAITLIST_BASE_ID",
  "AIRTABLE_WAITLIST_TABLE_ID",
  "AIRTABLE_API_KEY",
  "AIRTABLE_WAITLIST_API_KEY",
  "AIRTABLE_TABLE_NAME",
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
