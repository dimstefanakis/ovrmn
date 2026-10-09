import { test } from "node:test";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { WaitlistProvider } from "./waitlist";
import { phoneCountries } from "./phone-countries";

test("access form starts with no assumed country and a neutral phone placeholder", () => {
  const html = renderToStaticMarkup(
    <WaitlistProvider countries={phoneCountries}>Request access</WaitlistProvider>,
  );
  const picker = html.match(/<select\b[^>]*id="waitlist-country"[^>]*>([\s\S]*?)<\/select>/)?.[1];
  assert.ok(picker);
  const selected = [...picker.matchAll(/<option\b([^>]*)\bselected=""([^>]*)>/g)];
  assert.equal(selected.length, 1);
  assert.match(selected[0][0], /value=""/);
  assert.match(html, /placeholder="Phone number"/);
  assert.match(html, /ph-no-capture/);
  assert.match(html, /ph-mask/);
});
