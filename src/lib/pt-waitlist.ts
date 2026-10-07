import {
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js/min";

// v2: requesting access is joining, with no consent line on the page.
export const WAITLIST_CONSENT = "pt-waitlist-v2";
// Saving and enrollment are sequential. The browser must outlive both calls.
export const WAITLIST_SAVE_TIMEOUT_MS = 10_000;
export const WAITLIST_ENROLL_TIMEOUT_MS = 15_000;
export const WAITLIST_REQUEST_TIMEOUT_MS =
  WAITLIST_SAVE_TIMEOUT_MS + WAITLIST_ENROLL_TIMEOUT_MS + 10_000;
export const WAITLIST_UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

export function normalizeWaitlistPhone(
  value: unknown,
  defaultCountry?: CountryCode,
): string | null {
  if (typeof value !== "string" || value.length > 48) return null;
  const compact = value
    .trim()
    .replace(/[\s().-]/g, "")
    .replace(/^00/, "+");
  if (!/^(?:\+[1-9]\d{7,14}|\d{6,15})$/.test(compact)) return null;
  // Only the country picker may supply a default. The API still requires E.164.
  if (!compact.startsWith("+") && !defaultCountry) return null;
  const phone = parsePhoneNumberFromString(compact, defaultCountry);
  return phone?.isValid() ? phone.number : null;
}

export function waitlistAttribution(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const input = value as Record<string, unknown>;
  return Object.fromEntries(
    WAITLIST_UTM_KEYS.flatMap((key) => {
      const text = input[key];
      return typeof text === "string" && text.trim()
        ? [[key, text.trim().slice(0, 160)]]
        : [];
    }),
  );
}

/** The browser's IANA timezone, for check-in timing; null when absent or unknown. */
export function waitlistTimezone(value: unknown): string | null {
  if (typeof value !== "string" || !value || value.length > 80) return null;
  try {
    new Intl.DateTimeFormat("en", { timeZone: value }).format();
    return value;
  } catch {
    return null;
  }
}

/** Accept bounded attribution, never client conversion claims or message data. */
export function sanitizePtAnalytics(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const input = value as Record<string, unknown>;
  const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
  if (typeof input.event_id !== "string" || !uuid.test(input.event_id)) return undefined;
  const data = input.attribution && typeof input.attribution === "object" && !Array.isArray(input.attribution)
    ? input.attribution as Record<string, unknown> : {};
  const attribution: Record<string, string> = {};
  for (const [key, pattern, max] of [
    ["anonymous_id", uuid, 36], ["fbp", /^fb\.\d+\.\d+\.\d+$/, 180],
    ["fbc", /^fb\.\d+\.\d+\.[A-Za-z0-9_-]+$/, 500],
  ] as const) {
    const text = data[key];
    if (typeof text === "string" && text.length <= max && pattern.test(text)) attribution[key] = text;
  }
  Object.assign(attribution, waitlistAttribution(data));
  return { event_id: input.event_id, attribution };
}
