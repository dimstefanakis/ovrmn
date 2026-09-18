import { test } from "node:test";
import assert from "node:assert/strict";
import { EXPLORE_FIRST_TEXT, firstTextSmsUrl } from "./first-text";

test("pilot CTA opens the approved draft directly", () => {
  assert.equal(
    firstTextSmsUrl("+12053968556", EXPLORE_FIRST_TEXT),
    "sms:+12053968556&body=Hey%20OVRMN%2C%20what%20can%20you%20do%20for%20me%3F",
  );
});

test("an absent or malformed line stays inert", () => {
  for (const number of [null, "12053968556", "+0123", "+1x2053968556", "+12053968556?bad=1"]) {
    assert.equal(firstTextSmsUrl(number, EXPLORE_FIRST_TEXT), null);
  }
  assert.equal(firstTextSmsUrl("+12053968556", "   "), null);
});
