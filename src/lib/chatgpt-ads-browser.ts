import { analyticsAllowedInBrowser } from "@/lib/analytics-privacy";

declare global {
  interface Window {
    oaiq?: (...args: unknown[]) => void;
  }
}

export function trackChatGptAdsLead(eventId: string) {
  const normalizedEventId = eventId.trim();

  if (
    !normalizedEventId ||
    !analyticsAllowedInBrowser() ||
    typeof window.oaiq !== "function"
  ) {
    return false;
  }

  window.oaiq(
    "measure",
    "lead_created",
    { type: "customer_action" },
    { event_id: normalizedEventId }
  );

  return true;
}
