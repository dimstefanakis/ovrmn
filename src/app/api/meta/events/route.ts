import { cookies, headers } from "next/headers";
import type { BookDemoAttribution } from "@/lib/book-demo";
import { isMetaEventName } from "@/lib/meta-events";
import {
  getClientIpAddress,
  sendMetaConversionEvent,
} from "@/lib/meta-server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as
    | {
        attribution?: BookDemoAttribution;
        customData?: Record<string, unknown>;
        email?: string;
        eventId?: string;
        eventName?: string;
        eventSourceUrl?: string;
        fbc?: string;
        fbp?: string;
      }
    | null;

  if (!payload?.eventName || !isMetaEventName(payload.eventName)) {
    return Response.json(
      { error: "Invalid Meta event name." },
      { status: 400 }
    );
  }

  const requestHeaders = await headers();
  const cookieStore = await cookies();
  const attribution = mergeAttribution(payload.attribution, cookieStore);

  try {
    const tracked = await sendMetaConversionEvent({
      clientIpAddress: getClientIpAddress(requestHeaders),
      clientUserAgent: requestHeaders.get("user-agent") || undefined,
      customData: payload.customData,
      email: payload.email,
      eventId: payload.eventId,
      eventName: payload.eventName,
      eventSourceUrl: payload.eventSourceUrl,
      fbc: payload.fbc || attribution.fbc,
      fbp: payload.fbp || attribution.fbp,
    });

    return Response.json({ ok: true, tracked });
  } catch (error) {
    console.error("Meta event tracking failed", error);

    return Response.json(
      { error: "Meta event tracking failed." },
      { status: 502 }
    );
  }
}

function mergeAttribution(
  attribution: BookDemoAttribution | undefined,
  cookieStore: Awaited<ReturnType<typeof cookies>>
) {
  const cookieFbclid = cookieStore.get("ovrmn_fbclid")?.value;

  return {
    fbc:
      attribution?.fbc ||
      cookieStore.get("_fbc")?.value ||
      cookieStore.get("ovrmn_fbc")?.value ||
      formatFbc(cookieFbclid),
    fbp:
      attribution?.fbp ||
      cookieStore.get("_fbp")?.value ||
      cookieStore.get("ovrmn_fbp")?.value,
  };
}

function formatFbc(fbclid?: string) {
  return fbclid ? `fb.1.${Date.now()}.${fbclid}` : undefined;
}
