import posthog from "posthog-js";
import { isPrivateJoinPath, sanitizeAnalyticsValue } from "./src/lib/analytics-privacy";

const posthogProjectToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
const posthogHost =
  process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

// Check the path before init: SDK defaults capture the first URL immediately.
if (posthogProjectToken && !isPrivateJoinPath(window.location.href)) {
  try {
    posthog.init(posthogProjectToken, {
      api_host: posthogHost,
      ui_host: "https://us.posthog.com",
      defaults: "2026-01-30",
      capture_exceptions: true,
      before_send: (event) => {
        if (isPrivateJoinPath(window.location.href)) return null;
        return event ? sanitizeAnalyticsValue(event) : null;
      },
      debug: process.env.NODE_ENV === "development",
    });
  } catch {
    console.error("Failed to initialize PostHog client");
  }
}

// Stop replay before a client-side navigation can expose a membership token.
export function onRouterTransitionStart(url: string) {
  if (isPrivateJoinPath(url)) posthog.stopSessionRecording();
}
