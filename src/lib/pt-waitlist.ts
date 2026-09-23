import {
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js/min";

export const WAITLIST_CONSENT = "pt-waitlist-v1";
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
