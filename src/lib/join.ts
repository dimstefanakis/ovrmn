export const JOIN_TOKEN_PATTERN = /^[A-Za-z0-9]{24}$/;
export const JOIN_CHECKOUT_TIMEOUT_MS = 13_000;
export const JOIN_PRICE_TIMEOUT_MS = 2_500;

export function validJoinToken(value: unknown): value is string {
  return typeof value === "string" && JOIN_TOKEN_PATTERN.test(value);
}

/** The server accepts a checkout destination, never an arbitrary provider redirect. */
export function trustedCheckoutUrl(value: unknown): string | null {
  if (typeof value !== "string" || value.length > 2048) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" &&
      url.hostname === "checkout.stripe.com" &&
      !url.port && !url.username && !url.password
      ? url.href
      : null;
  } catch {
    return null;
  }
}

/** A monthly price in cents, written the way the coach says it: $39.99, $29. */
export function formatMonthlyPrice(cents: number): string {
  return `$${cents % 100 === 0 ? cents / 100 : (cents / 100).toFixed(2)}`;
}

/** Read-only: the monthly price this join link charges now (agreed with the coach in Messages), or null when it can't
 * be shown (unconfigured, unknown link, already a member, or any failure). It never creates a checkout. */
export async function fetchJoinPrice(token: string): Promise<string | null> {
  const origin = process.env.DEMI_BILLING_API_URL || process.env.DEMI_API_URL;
  const secret = process.env.DEMI_BILLING_KEY;
  if (!origin || !secret || !validJoinToken(token)) return null;
  try {
    const endpoint = new URL("/billing/price", origin);
    const local = ["localhost", "127.0.0.1", "[::1]"].includes(endpoint.hostname);
    if (endpoint.username || endpoint.password ||
      (endpoint.protocol !== "https:" && !(process.env.NODE_ENV !== "production" && local && endpoint.protocol === "http:")))
      return null;
    const response = await fetch(endpoint, {
      method: "POST",
      redirect: "error",
      cache: "no-store",
      headers: { Authorization: `Bearer ${secret}`, "content-type": "application/json" },
      body: JSON.stringify({ token }),
      signal: AbortSignal.timeout(JOIN_PRICE_TIMEOUT_MS),
    });
    if (!response.ok) return null;
    const body = await response.json();
    const cents = body?.state === "price" ? body.amount_cents : null;
    return Number.isSafeInteger(cents) && cents >= 100 && cents <= 100_000 ? formatMonthlyPrice(cents) : null;
  } catch {
    return null;
  }
}

export const joinErrors = {
  unavailable: "We couldn't open checkout. Please try again, or ask OVRMN in Messages.",
  invalid_link: "This link isn't available. Ask OVRMN in Messages for a new one.",
  slow_down: "Please wait a few minutes before trying again.",
  subscription_exists: "You already have a membership to manage. Ask OVRMN in Messages or email support@ovrmn.com for billing help.",
  payment_processing: "Your checkout is being confirmed. Check Messages for confirmation before trying again.",
} as const;

export function joinErrorMessage(value: unknown): string | null {
  return typeof value === "string" && Object.hasOwn(joinErrors, value)
    ? joinErrors[value as keyof typeof joinErrors]
    : null;
}
