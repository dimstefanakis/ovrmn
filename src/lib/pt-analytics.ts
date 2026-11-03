import posthog from "posthog-js";
import { collectBookDemoAttribution, getMetaPixelIdForPath, rememberAttributionFromBrowser } from "./meta-browser";

export function collectPtAnalytics(eventId: string) {
  rememberAttributionFromBrowser();
  const source = collectBookDemoAttribution();
  let anonymousId: string | undefined;
  try { anonymousId = posthog.get_distinct_id(); } catch { /* SDK may be disabled or blocked. */ }
  const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
  return { event_id: eventId, attribution: {
    ...(anonymousId && uuid.test(anonymousId) ? { anonymous_id: anonymousId } : {}),
    ...(source.fbp && /^fb\.\d+\.\d+\.\d+$/.test(source.fbp) ? { fbp: source.fbp } : {}),
    ...(source.fbc && /^fb\.\d+\.\d+\.[A-Za-z0-9_-]+$/.test(source.fbc) ? { fbc: source.fbc } : {}),
    ...Object.fromEntries([
      ["utm_source",source.utmSource], ["utm_medium",source.utmMedium], ["utm_campaign",source.utmCampaign],
      ["utm_content",source.utmContent], ["utm_term",source.utmTerm],
    ].filter((entry)=>typeof entry[1] === "string" && entry[1]).map(([key,value])=>[key,value!.slice(0,160)])),
  } };
}

/** Browser half only. The backend already queued CAPI with this exact ID. */
export function trackPtLead(eventId: string) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("trackSingle",getMetaPixelIdForPath("/pt-waitlist"),"Lead",{}, { eventID: eventId });
  }
}

/** Landing funnel events. Never pass the phone number or anything typed into the form. */
export type LandingEvent =
  | "landing_cta_clicked"
  | "signup_form_started"
  | "signup_country_changed"
  | "signup_validation_failed"
  | "signup_submit_failed"
  | "signup_access_granted"
  | "signup_listed"
  | "text_ovrmn_clicked"
  | "line_number_copied"
  | "landing_section_viewed"
  | "demo_replayed"
  | "demo_feature_selected";

export function trackLanding(event: LandingEvent, properties: Record<string, string | number | boolean> = {}) {
  try { posthog.capture(event, { ...properties, page: "pt-landing-v2" }); } catch { /* SDK may be disabled or blocked. */ }
}

/** Facebook, Instagram and Messenger webviews often fail to hand an sms: link to Messages. */
export function inAppBrowser(userAgent: string) {
  return /FBAN|FBAV|FB_IAB|FBIOS|Instagram|Messenger/i.test(userAgent);
}
