/** Membership URLs are bearer credentials. Never give them to browser SDKs. */
export function isPrivateJoinPath(value: string): boolean {
  try {
    const path = new URL(value, "https://www.ovrmn.com").pathname;
    return path === "/join" || path.startsWith("/join/");
  } catch {
    return false;
  }
}

export function redactJoinUrls(value: string): string {
  // Strip the entire private path/query/fragment, including encoded tokens.
  return value.replace(/\/join(?=\/|[?#]|$)(?:\/[^\s"'<>]*)?(?:\?[^\s"'<>]*)?(?:#[^\s"'<>]*)?/g, "/join");
}

export function sanitizeAnalyticsValue<T>(value: T): T {
  if (typeof value === "string") return redactJoinUrls(value) as T;
  if (value instanceof Date) return value;
  if (value instanceof URL) return new URL(redactJoinUrls(value.href)) as T;
  if (Array.isArray(value)) return value.map(sanitizeAnalyticsValue) as T;
  if (value && typeof value === "object") {
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) return value;
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, sanitizeAnalyticsValue(item)]),
    ) as T;
  }
  return value;
}

export function analyticsAllowedInBrowser(): boolean {
  return typeof window !== "undefined" && !isPrivateJoinPath(window.location.href);
}
