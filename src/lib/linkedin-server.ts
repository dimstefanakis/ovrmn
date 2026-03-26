import { createHash } from "node:crypto";

const LINKEDIN_API_VERSION = process.env.LINKEDIN_API_VERSION ?? "202511";
const LINKEDIN_RESTLI_PROTOCOL_VERSION = "2.0.0";

export type LinkedInConversionEventInput = {
  email?: string;
  eventId?: string;
  eventTimeMs?: number;
  liFatId?: string;
  valueAmount?: number | string;
};

export async function sendLinkedInConversionEvent({
  email,
  eventId,
  eventTimeMs,
  liFatId,
  valueAmount,
}: LinkedInConversionEventInput) {
  const accessToken = process.env.LINKEDIN_ACCESS_TOKEN;
  const conversionUrn = getLinkedInConversionUrn();

  if (!accessToken || !conversionUrn) {
    return false;
  }

  const userIds = compactArray([
    email
      ? {
          idType: "SHA256_EMAIL",
          idValue: hashSha256(email),
        }
      : undefined,
    liFatId
      ? {
          idType: "LINKEDIN_FIRST_PARTY_ADS_TRACKING_UUID",
          idValue: liFatId,
        }
      : undefined,
  ]);

  if (userIds.length === 0) {
    return false;
  }

  const response = await fetch("https://api.linkedin.com/rest/conversionEvents", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      "Linkedin-Version": LINKEDIN_API_VERSION,
      "X-Restli-Protocol-Version": LINKEDIN_RESTLI_PROTOCOL_VERSION,
    },
    body: JSON.stringify({
      conversion: conversionUrn,
      conversionHappenedAt: eventTimeMs ?? Date.now(),
      conversionValue: {
        amount: normalizeAmount(valueAmount),
        currencyCode: "USD",
      },
      eventId,
      user: {
        userIds,
      },
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `LinkedIn returned ${response.status}: ${errorBody || "Unknown error"}`
    );
  }

  return true;
}

function getLinkedInConversionUrn() {
  const rawValue = process.env.LINKEDIN_CONVERSION_ID?.trim();

  if (!rawValue) {
    return "";
  }

  if (rawValue.startsWith("urn:")) {
    return rawValue;
  }

  return `urn:lla:llaPartnerConversion:${rawValue}`;
}

function normalizeAmount(value: number | string | undefined) {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return value.toFixed(1);
  }

  if (typeof value === "string") {
    const numericValue = Number(value);

    if (Number.isFinite(numericValue) && numericValue >= 0) {
      return numericValue.toFixed(1);
    }
  }

  const defaultValue = Number(process.env.LINKEDIN_CONVERSION_VALUE_USD ?? "250");
  return Number.isFinite(defaultValue) && defaultValue >= 0
    ? defaultValue.toFixed(1)
    : "250.0";
}

function hashSha256(value: string) {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

function compactArray<T>(value: Array<T | undefined>) {
  return value.filter((entry): entry is T => Boolean(entry));
}
