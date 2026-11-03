import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { DEFAULT_COUNTRY, PhoneForm, WaitlistProvider } from "./waitlist";
import { phoneCountries } from "./phone-countries";
import { inAppBrowser } from "@/lib/pt-analytics";

function render(children: React.ReactNode = "Request access") {
  return renderToStaticMarkup(
    <WaitlistProvider countries={phoneCountries}>{children}</WaitlistProvider>,
  );
}

test("access form preselects +1, visibly, with the US placeholder", () => {
  const html = render();
  const picker = html.match(/<select\b[^>]*id="waitlist-country"[^>]*>([\s\S]*?)<\/select>/)?.[1];
  assert.ok(picker);
  const selected = [...picker.matchAll(/<option\b([^>]*)\bselected=""([^>]*)>/g)];
  assert.equal(selected.length, 1);
  assert.equal(DEFAULT_COUNTRY, "US");
  assert.match(selected[0][0], /value="US"/);
  const us = phoneCountries.find((country) => country.country === "US")!;
  assert.match(html, new RegExp(`placeholder="${us.placeholder.replace(/[()]/g, "\\$&")}"`));
  assert.match(html, /\+1</);
  assert.match(html, /ph-no-capture/);
  assert.match(html, /ph-mask/);
});

test("the inline form keeps the waitlist words and unique field ids", () => {
  const html = render(
    <>
      <PhoneForm placement="hero" />
      <PhoneForm placement="final" />
    </>,
  );
  assert.equal(html.match(/Request access/g)?.length, 3);
  assert.equal(html.match(/We’re opening access to a few people at a time\./g)?.length, 3);
  for (const id of ["hero-phone", "final-phone", "dialog-phone"]) {
    assert.equal(html.match(new RegExp(`id="${id}"`, "g"))?.length, 1, id);
  }
});

test("Facebook and Instagram webviews are recognised, Safari is not", () => {
  assert.ok(inAppBrowser("Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/22G86 [FBAN/FBIOS;FBAV/530.0.0.43.109;]"));
  assert.ok(inAppBrowser("Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/22G86 Instagram 400.0.0.32.112"));
  assert.ok(!inAppBrowser("Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1"));
});

test("landing analytics never carry the phone number", () => {
  const source = readFileSync(new URL("./waitlist.tsx", import.meta.url), "utf8");
  const calls = [...source.matchAll(/trackLanding\(\s*"[a-z_]+"(?:,\s*\{[^}]*\})?\s*\)/g)].map((match) => match[0]);
  assert.ok(calls.length >= 8);
  for (const call of calls) assert.doesNotMatch(call, /\b(phone|normalized|formatted|line|value)\b/, call);
});
