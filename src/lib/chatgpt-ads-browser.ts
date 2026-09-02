declare global {
  interface Window {
    oaiq?: (...args: unknown[]) => void;
  }
}

export function trackChatGptAdsLead(eventId: string) {
  const normalizedEventId = eventId.trim();

  if (
    !normalizedEventId ||
    typeof window === "undefined" ||
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
