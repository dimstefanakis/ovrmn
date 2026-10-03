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
