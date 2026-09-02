import { createHash } from "node:crypto";

const CHATGPT_ADS_EVENTS_URL = "https://bzr.openai.com/v1/events";

export type ChatGptAdsLeadInput = {
  clientIpAddress?: string;
  clientUserAgent?: string;
  email?: string;
  eventId: string;
  eventSourceUrl: string;
  eventTimeMs?: number;
  obref?: string;
  oppref?: string;
};

export async function sendChatGptAdsLead({
  clientIpAddress,
  clientUserAgent,
  email,
  eventId,
  eventSourceUrl,
  eventTimeMs,
  obref,
  oppref,
}: ChatGptAdsLeadInput) {
  const pixelId = process.env.CHATGPT_PIXEL_ID?.trim();
  const conversionKey = process.env.CHATGPT_CONVERSION_KEY?.trim();

  if (!pixelId || !conversionKey) {
    return false;
  }

  const normalizedEventId = eventId.trim();
  const normalizedSourceUrl = normalizeWebUrl(eventSourceUrl);

  if (!normalizedEventId) {
    throw new Error("ChatGPT Ads event ID is required.");
  }

  if (!normalizedSourceUrl) {
    throw new Error("ChatGPT Ads source URL must be an absolute web URL.");
  }

  const user = compactObject({
    emails_sha256: email ? [hashSha256(email)] : undefined,
    ip_address: trimmed(clientIpAddress),
    obref: trimmed(obref),
    user_agent: trimmed(clientUserAgent),
  });

  const response = await fetch(
    `${CHATGPT_ADS_EVENTS_URL}?pid=${encodeURIComponent(pixelId)}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${conversionKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        validate_only: false,
        events: [
          compactObject({
            id: normalizedEventId,
            type: "lead_created",
            timestamp_ms: eventTimeMs ?? Date.now(),
            oppref: trimmed(oppref),
            source_url: normalizedSourceUrl,
            action_source: "web",
            user: Object.keys(user).length > 0 ? user : undefined,
            data: {
              type: "customer_action",
            },
          }),
        ],
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    }
  );

  if (!response.ok) {
    const errorBody = (await response.text()).slice(0, 1_000);
    throw new Error(
      `ChatGPT Ads returned ${response.status}: ${errorBody || "Unknown error"}`
    );
  }

  return true;
}

function hashSha256(value: string) {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

function normalizeWebUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.toString()
      : "";
  } catch {
    return "";
  }
}

function trimmed(value?: string) {
  const normalized = value?.trim();
  return normalized || undefined;
}

function compactObject<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(
    Object.entries(value).filter((entry) => {
      const candidate = entry[1];

      if (candidate === undefined || candidate === null || candidate === "") {
        return false;
      }

      if (Array.isArray(candidate)) {
        return candidate.length > 0;
      }

      return true;
    })
  ) as T;
}
