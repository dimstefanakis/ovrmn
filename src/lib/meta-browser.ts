import type { BookDemoAttribution } from "@/lib/book-demo";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const ATTRIBUTION_COOKIE_DAYS = 90;

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

export function hasMetaPixel() {
  return Boolean(META_PIXEL_ID);
}

export function getMetaPixelId() {
  return META_PIXEL_ID;
}

export function rememberAttributionFromBrowser() {
  if (typeof window === "undefined") {
    return;
  }

  const url = new URL(window.location.href);
  const fbclid = url.searchParams.get("fbclid");

  if (fbclid) {
    const existingFbc = readCookie("_fbc") ?? readCookie("ovrmn_fbc");
    const fbc = existingFbc || `fb.1.${Date.now()}.${fbclid}`;
    writeCookie("ovrmn_fbc", fbc, ATTRIBUTION_COOKIE_DAYS);
    writeCookie("ovrmn_fbclid", fbclid, ATTRIBUTION_COOKIE_DAYS);
  }

  const fbp = readCookie("_fbp");
  if (fbp) {
    writeCookie("ovrmn_fbp", fbp, ATTRIBUTION_COOKIE_DAYS);
  }

  const utmValues = Object.fromEntries(
    UTM_KEYS.map((key) => [key, url.searchParams.get(key)?.trim()]).filter(
      (entry): entry is [string, string] => Boolean(entry[1])
    )
  );

  if (Object.keys(utmValues).length > 0) {
    writeCookie(
      "ovrmn_utm",
      JSON.stringify(utmValues),
      ATTRIBUTION_COOKIE_DAYS
    );
  }

  if (!readCookie("ovrmn_landing_path")) {
    writeCookie(
      "ovrmn_landing_path",
      `${url.pathname}${url.search}`,
      ATTRIBUTION_COOKIE_DAYS
    );
  }

  if (document.referrer && !readCookie("ovrmn_referrer")) {
    writeCookie("ovrmn_referrer", document.referrer, ATTRIBUTION_COOKIE_DAYS);
  }
}

export function collectBookDemoAttribution(): BookDemoAttribution {
  if (typeof window === "undefined") {
    return {};
  }

  const url = new URL(window.location.href);
  const utmCookie = readCookie("ovrmn_utm");
  const utmPayload = parseJson<Record<string, string>>(utmCookie);

  return {
    fbc: readCookie("_fbc") ?? readCookie("ovrmn_fbc") ?? undefined,
    fbp: readCookie("_fbp") ?? readCookie("ovrmn_fbp") ?? undefined,
    fbclid: url.searchParams.get("fbclid") ?? readCookie("ovrmn_fbclid") ?? undefined,
    landingPath:
      readCookie("ovrmn_landing_path") ?? `${url.pathname}${url.search}`,
    referrer: document.referrer || readCookie("ovrmn_referrer") || undefined,
    utmCampaign:
      url.searchParams.get("utm_campaign") ??
      utmPayload?.utm_campaign ??
      undefined,
    utmContent:
      url.searchParams.get("utm_content") ?? utmPayload?.utm_content ?? undefined,
    utmMedium:
      url.searchParams.get("utm_medium") ?? utmPayload?.utm_medium ?? undefined,
    utmSource:
      url.searchParams.get("utm_source") ?? utmPayload?.utm_source ?? undefined,
    utmTerm: url.searchParams.get("utm_term") ?? utmPayload?.utm_term ?? undefined,
  };
}

export function trackMetaLead(
  eventId: string,
  payload: {
    companyName: string;
    team?: string;
    teamSize?: string;
    tools?: string[];
  }
) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") {
    return;
  }

  window.fbq(
    "track",
    "Lead",
    {
      content_category: "Book demo",
      content_name: "OVRMN book demo",
      team: payload.team || "",
      team_size: payload.teamSize || "",
      tools: payload.tools?.join(", ") || "",
      company_name: payload.companyName,
    },
    { eventID: eventId }
  );
}

function parseJson<T>(value: string | null): T | null {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function readCookie(name: string) {
  if (typeof document === "undefined") {
    return null;
  }

  const encodedPrefix = `${encodeURIComponent(name)}=`;
  const match = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(encodedPrefix));

  if (!match) {
    return null;
  }

  return decodeURIComponent(match.slice(encodedPrefix.length));
}

function writeCookie(name: string, value: string, days: number) {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = [
    `${encodeURIComponent(name)}=${encodeURIComponent(value)}`,
    "path=/",
    `max-age=${days * 24 * 60 * 60}`,
    "SameSite=Lax",
  ].join("; ");
}
