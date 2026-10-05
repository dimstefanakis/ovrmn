import { test } from "node:test";
import assert from "node:assert/strict";
import { isPrivateJoinPath, redactJoinUrls, sanitizeAnalyticsValue } from "./analytics-privacy";

const token = "AbCdEf0123456789AbCdEf01";
test("private document detection includes all membership URLs and leaves PT analytics enabled", () => {
  for (const url of ["/join", `/join/${token}`, `/join/${token}/done?state=member`, `https://www.ovrmn.com/join/${token}#x`])
    assert.equal(isPrivateJoinPath(url), true);
  for (const url of ["/pt", "/pt-waitlist", "/joining", "/book", "https://www.ovrmn.com/?next=/join/token"])
    assert.equal(isPrivateJoinPath(url), false);
});

test("private path, query and fragment are redacted from current/referrer/initial URL values", () => {
  for (const suffix of ["", "/done?state=member", "?token=private#private", "/done#private"])
    assert.equal(redactJoinUrls(`https://www.ovrmn.com/join/${token}${suffix}`), "https://www.ovrmn.com/join");
  assert.equal(redactJoinUrls(`/join/%41${token}?error=private`), "/join");
  assert.equal(redactJoinUrls("/joining?utm_source=meta"), "/joining?utm_source=meta");
  assert.equal(redactJoinUrls("/pt?utm_campaign=coach"), "/pt?utm_campaign=coach");
});

test("nested event payloads are copied and scrubbed without losing ordinary analytics", () => {
  const timestamp = new Date("2026-10-05T10:00:00Z");
  const source = { event: "$pageview", timestamp, properties: {
    $current_url: "https://www.ovrmn.com/pt", $referrer: `https://www.ovrmn.com/join/${token}`,
    $set: { $initial_current_url: `/join/${token}/done?state=member` },
    details: [{ href: `/join/${token}`, campaign: "trainer" }], count: 1,
  } };
  const result = sanitizeAnalyticsValue(source);
  assert.notEqual(result, source);
  assert.equal(result.timestamp, timestamp, "SDK Date timestamps must remain intact");
  assert.equal(result.properties.$current_url, source.properties.$current_url);
  assert.equal(result.properties.$referrer, "https://www.ovrmn.com/join");
  assert.equal(result.properties.$set.$initial_current_url, "/join");
  assert.equal(result.properties.details[0].href, "/join");
  assert.equal(result.properties.details[0].campaign, "trainer");
  assert.ok(source.properties.$referrer.includes(token));
  assert.equal(JSON.stringify(result).includes(token), false);
});

test("URL objects are scrubbed while typed SDK payloads keep their serialization", () => {
  const source = { url: new URL(`https://www.ovrmn.com/join/${token}`), bytes: new Uint8Array([1, 2]) };
  const result = sanitizeAnalyticsValue(source);
  assert.equal(result.url.href, "https://www.ovrmn.com/join");
  assert.equal(result.bytes, source.bytes);
});
