export const JOIN_TOKEN_PATTERN = /^[A-Za-z0-9]{24}$/;
export const JOIN_CHECKOUT_TIMEOUT_MS = 13_000;

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
