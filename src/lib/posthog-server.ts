import { PostHog } from "posthog-node";

let posthogClient: PostHog | null = null;
let hasFailedToInitialize = false;

const DEFAULT_POSTHOG_HOST = "https://us.i.posthog.com";

export function getPostHogClient() {
  if (hasFailedToInitialize) {
    return null;
  }

  const posthogProjectToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;

  if (!posthogProjectToken) {
    return null;
  }

  if (!posthogClient) {
    try {
      posthogClient = new PostHog(posthogProjectToken, {
        host: process.env.NEXT_PUBLIC_POSTHOG_HOST || DEFAULT_POSTHOG_HOST,
        flushAt: 1,
        flushInterval: 0,
      });
    } catch (error) {
      hasFailedToInitialize = true;
      console.error("Failed to initialize PostHog server client", error);
      return null;
    }
  }

  return posthogClient;
}
