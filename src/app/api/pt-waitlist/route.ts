import { createHmac } from "node:crypto";
import {
  WAITLIST_CONSENT,
  normalizeWaitlistPhone,
  waitlistAttribution,
  waitlistTimezone,
} from "@/lib/pt-waitlist";

export const runtime = "nodejs";

// Best-effort, bounded per-instance protection, not a distributed rate limit or
// phone ownership check. No raw IPs, phone numbers or provider errors are logged.
const attempts = new Map<string, { count: number; expires: number }>();
const reply = (body: object, status = 200) =>
  Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      ...(status === 429 ? { "Retry-After": "900" } : {}),
    },
  });

/** Signing up is joining: the coach's backend registers the person with Photon's pool
 * and answers with the number they text. Null keeps them on the waitlist instead. */
async function admit(phone: string, timezone: string | null) {
  const origin = process.env.DEMI_API_URL;
  const secret = process.env.DEMI_ENROLLMENT_KEY;
  if (!origin || !secret || !timezone) return null;
  try {
    const response = await fetch(new URL("/enroll", origin), {
      method: "POST",
      redirect: "error",
      cache: "no-store",
      headers: {
        Authorization: `Bearer ${secret}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ phone, timezone, consent: true, provider: "photon" }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) return null;
    const body = await response.json();
    return body?.phone === phone &&
      typeof body?.number === "string" &&
      /^\+[1-9]\d{7,14}$/.test(body.number)
      ? (body.number as string)
      : null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  // Next's internal URL can be localhost behind a proxy. Host is the public
  // request authority; browsers cannot override it on cross-origin fetches.
  try {
    const origin = request.headers.get("origin");
    const source = new URL(origin || "");
    const host = request.headers.get("host") || new URL(request.url).host;
    if (
      source.origin !== origin ||
      !["https:", "http:"].includes(source.protocol) ||
      source.host !== host
    )
      return reply({ error: "forbidden" }, 403);
  } catch {
    return reply({ error: "forbidden" }, 403);
  }
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    return reply({ error: "invalid_request" }, 415);
  const base =
    process.env.AIRTABLE_WAITLIST_BASE_ID || process.env.AIRTABLE_BASE_ID;
  const table = process.env.AIRTABLE_WAITLIST_TABLE_ID;
  const secret =
    process.env.AIRTABLE_WAITLIST_API_KEY || process.env.AIRTABLE_API_KEY;
  // Never fall back to the demo-leads table.
  if (!base || !table || !secret) return reply({ error: "unavailable" }, 503);

  const now = Date.now();
  for (const [key, value] of attempts)
    if (value.expires <= now) attempts.delete(key);
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  const key = createHmac("sha256", secret).update(ip).digest("hex");
  const attempt = attempts.get(key) || { count: 0, expires: now + 15 * 60_000 };
  if (attempt.count >= 30 || (!attempts.has(key) && attempts.size >= 1000))
    return reply({ error: "slow_down" }, 429);
  attempts.set(key, { ...attempt, count: attempt.count + 1 });

  const reader = request.body?.getReader();
  if (!reader) return reply({ error: "invalid_request" }, 400);
  const chunks: Uint8Array[] = [];
  let size = 0;
  let body: Record<string, unknown>;
  try {
    while (true) {
      const next = await reader.read();
      if (next.done) break;
      size += next.value.byteLength;
      if (size > 4096) {
        void reader.cancel().catch(() => {});
        return reply({ error: "invalid_request" }, 413);
      }
      chunks.push(next.value);
    }
    body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (!body || typeof body !== "object" || Array.isArray(body))
      return reply({ error: "invalid_request" }, 400);
  } catch {
    return reply({ error: "invalid_request" }, 400);
  } finally {
    reader.releaseLock();
  }

  const phone = normalizeWaitlistPhone(body.phone);
  if (
    !phone ||
    body.consent !== WAITLIST_CONSENT ||
    (body.website !== undefined && body.website !== "")
  )
    return reply({ error: "invalid_details" }, 400);

  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${encodeURIComponent(base)}/${encodeURIComponent(table)}`,
      {
        method: "PATCH",
        redirect: "error",
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${secret}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          performUpsert: { fieldsToMergeOn: ["Phone"] },
          records: [
            {
              fields: {
                Phone: phone,
                "Consent version": WAITLIST_CONSENT,
                "Source path": "/pt-waitlist",
                ...waitlistAttribution(body.attribution),
              },
            },
          ],
        }),
        signal: AbortSignal.timeout(10_000),
      },
    );
    // One upsert, not a race-prone read-then-create. Rejoining updates supplied
    // campaign tags; Airtable's original createdTime is unchanged.
    if (!response.ok) return reply({ error: "unavailable" }, 503);
    const saved = await response.json();
    if (
      !Array.isArray(saved?.records) ||
      saved.records.length !== 1 ||
      typeof saved.records[0]?.id !== "string" ||
      saved.records[0]?.fields?.Phone !== phone
    )
      return reply({ error: "unavailable" }, 503);
    const number = await admit(phone, waitlistTimezone(body.timezone));
    return reply(number ? { ok: true, number } : { ok: true });
  } catch {
    return reply({ error: "unavailable" }, 503);
  }
}
