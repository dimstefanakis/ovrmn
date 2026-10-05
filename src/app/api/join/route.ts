import { createHmac } from "node:crypto";
import { JOIN_CHECKOUT_TIMEOUT_MS, joinErrors, trustedCheckoutUrl, validJoinToken } from "@/lib/join";

export const runtime = "nodejs";
export const maxDuration = 15;

const privateHeaders = {
  "Cache-Control": "no-store",
  "Referrer-Policy": "no-referrer",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
};
// Bounded per-instance protection. Raw IPs, tokens and provider errors are never logged.
const attempts = new Map<string, { count: number; expires: number }>();

function reply(error: string, status: number) {
  return Response.json({ error }, {
    status,
    headers: { ...privateHeaders, ...(status === 429 ? { "Retry-After": "900" } : {}) },
  });
}

function redirect(url: string) {
  return new Response(null, { status: 303, headers: { ...privateHeaders, Location: url } });
}

export async function POST(request: Request) {
  const type = request.headers.get("content-type")?.split(";")[0].trim().toLowerCase();
  const isForm = type === "application/x-www-form-urlencoded";
  let publicOrigin: string;
  try {
    const origin = request.headers.get("origin");
    const host = request.headers.get("host") || new URL(request.url).host;
    if (origin === "null") {
      // no-referrer makes native form navigation use Origin:null. Browser-owned
      // Fetch Metadata admits only this same-origin top-level form, not opaque
      // sandbox/cross-site origins, fetch(), JSON or missing metadata.
      if (!isForm || request.headers.get("sec-fetch-site") !== "same-origin"
        || request.headers.get("sec-fetch-mode") !== "navigate"
        || request.headers.get("sec-fetch-dest") !== "document") return reply("forbidden", 403);
      // As with the existing origin check, Host is the public authority. The
      // ingress must overwrite x-forwarded-proto; do not trust forwarded host
      // or a comma-separated protocol chain when constructing local redirects.
      if (/[\s,/?#@\\]/.test(host)) return reply("forbidden", 403);
      const protocol = request.headers.get("x-forwarded-proto") ?? new URL(request.url).protocol.slice(0, -1);
      if (protocol !== "https" && protocol !== "http") return reply("forbidden", 403);
      const target = new URL(`${protocol}://${host}`);
      if (target.host !== host || target.username || target.password) return reply("forbidden", 403);
      publicOrigin = target.origin;
    } else {
      const source = new URL(origin || "");
      if (source.origin !== origin || !["https:", "http:"].includes(source.protocol) || source.host !== host)
        return reply("forbidden", 403);
      publicOrigin = source.origin;
    }
  } catch {
    return reply("forbidden", 403);
  }
  if (!isForm && type !== "application/json") return reply("invalid_request", 415);

  const origin = process.env.DEMI_BILLING_API_URL || process.env.DEMI_API_URL;
  const secret = process.env.DEMI_BILLING_KEY;
  const reader = request.body?.getReader();
  if (!reader) return reply("invalid_request", 400);
  const chunks: Uint8Array[] = [];
  let size = 0;
  let token: unknown;
  try {
    while (true) {
      const next = await reader.read();
      if (next.done) break;
      size += next.value.byteLength;
      if (size > 4096) {
        void reader.cancel().catch(() => {});
        return reply("invalid_request", 413);
      }
      chunks.push(next.value);
    }
    const raw = Buffer.concat(chunks).toString("utf8");
    if (isForm) {
      const form = new URLSearchParams(raw);
      if (form.getAll("token").length !== 1) return reply("invalid_request", 400);
      token = form.get("token");
    } else {
      const body = JSON.parse(raw);
      if (!body || typeof body !== "object" || Array.isArray(body)) return reply("invalid_request", 400);
      token = body.token;
    }
  } catch {
    return reply("invalid_request", 400);
  } finally {
    reader.releaseLock();
  }
  if (!validJoinToken(token)) return isForm
    ? redirect(`${publicOrigin}/join?error=invalid_link`)
    : reply("invalid_request", 400);

  const retry = (error: keyof typeof joinErrors, status = 503) => isForm
    ? redirect(`${publicOrigin}/join/${token}?error=${error}`)
    : reply(error, status);
  if (!origin || !secret) return retry("unavailable");

  const now = Date.now();
  for (const [key, value] of attempts) if (value.expires <= now) attempts.delete(key);
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  const key = createHmac("sha256", secret).update(ip).digest("hex");
  const attempt = attempts.get(key) || { count: 0, expires: now + 15 * 60_000 };
  if (attempt.count >= 30 || (!attempts.has(key) && attempts.size >= 1000)) return retry("slow_down", 429);
  attempts.set(key, { ...attempt, count: attempt.count + 1 });
  try {
    const endpoint = new URL("/billing/checkout", origin);
    const local = ["localhost", "127.0.0.1", "[::1]"].includes(endpoint.hostname);
    if (endpoint.username || endpoint.password ||
      (endpoint.protocol !== "https:" && !(process.env.NODE_ENV !== "production" && local && endpoint.protocol === "http:")))
      return retry("unavailable");
    const response = await fetch(endpoint, {
      method: "POST",
      redirect: "error",
      cache: "no-store",
      headers: { Authorization: `Bearer ${secret}`, "content-type": "application/json" },
      body: JSON.stringify({ token }),
      signal: AbortSignal.timeout(JOIN_CHECKOUT_TIMEOUT_MS),
    });
    if (response.status === 404) return retry("invalid_link", 404);
    if (response.status === 409) {
      const conflict = await response.json().catch(() => null);
      if (conflict?.error === "subscription_exists" || conflict?.error === "payment_processing")
        return retry(conflict.error, 409);
    }
    if (!response.ok) return retry("unavailable");
    const body = await response.json();
    if (body?.state === "member" || body?.state === "comped")
      return redirect(`${publicOrigin}/join/${token}/done`);
    const url = body?.state === "checkout" ? trustedCheckoutUrl(body.url) : null;
    return url ? redirect(url) : retry("unavailable");
  } catch {
    return retry("unavailable");
  }
}
