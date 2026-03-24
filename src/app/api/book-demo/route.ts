import { cookies, headers } from "next/headers";
import {
  type BookDemoAttribution,
  type BookDemoSubmission,
  validateBookDemoSubmission,
} from "@/lib/book-demo";
import {
  getClientIpAddress,
  sendMetaConversionEvent,
} from "@/lib/meta-server";

export const runtime = "nodejs";

const AIRTABLE_API_URL = "https://api.airtable.com/v0";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);

  const validation = validateBookDemoSubmission(payload);

  if (!validation.success) {
    return Response.json(
      {
        error:
          firstError(validation.errors) ||
          "The booking form payload is invalid.",
        fields: validation.errors,
      },
      { status: 400 }
    );
  }

  const missingConfig = getMissingAirtableConfig();

  if (missingConfig.length > 0) {
    return Response.json(
      {
        error: `Missing Airtable configuration: ${missingConfig.join(", ")}`,
      },
      { status: 503 }
    );
  }

  const requestHeaders = await headers();
  const cookieStore = await cookies();
  const attribution = mergeAttribution(validation.data, cookieStore);
  const clientIpAddress = getClientIpAddress(requestHeaders);
  const clientUserAgent = requestHeaders.get("user-agent") || undefined;
  const eventId = validation.data.eventId || createServerEventId();

  const [airtableResult, metaResult] = await Promise.allSettled([
    writeLeadToAirtable(validation.data, attribution, eventId),
    Promise.all([
      sendMetaConversionEvent({
        clientIpAddress,
        clientUserAgent,
        customData: {
          company_name: validation.data.companyName,
          content_category: "Book demo",
          content_name: "OVRMN book demo",
          team: validation.data.team || "",
          team_size: validation.data.teamSize || "",
          tools: validation.data.tools?.join(", ") || "",
        },
        email: validation.data.workEmail,
        eventId,
        eventName: "Lead",
        eventSourceUrl: validation.data.pageUrl,
        fbc: attribution.fbc,
        fbp: attribution.fbp,
      }),
      sendMetaConversionEvent({
        clientIpAddress,
        clientUserAgent,
        customData: {
          company_name: validation.data.companyName,
          content_category: "Book demo",
          content_name: "OVRMN book demo completion",
          team: validation.data.team || "",
          team_size: validation.data.teamSize || "",
          tools: validation.data.tools?.join(", ") || "",
        },
        email: validation.data.workEmail,
        eventId,
        eventName: "CompleteRegistration",
        eventSourceUrl: validation.data.pageUrl,
        fbc: attribution.fbc,
        fbp: attribution.fbp,
      }),
    ]),
  ]);

  if (airtableResult.status === "rejected") {
    console.error("Airtable lead write failed", airtableResult.reason);

    if (metaResult.status === "rejected") {
      console.error("Meta lead tracking also failed", metaResult.reason);
    }

    return Response.json(
      {
        error:
          "We couldn’t store the booking request right now. Please try again in a moment.",
      },
      { status: 502 }
    );
  }

  if (metaResult.status === "rejected") {
    console.error("Meta lead tracking failed", metaResult.reason);
  }

  return Response.json({
    ok: true,
    metaTracked:
      metaResult.status === "fulfilled"
        ? metaResult.value.some(Boolean)
        : false,
  });
}

async function writeLeadToAirtable(
  submission: BookDemoSubmission,
  attribution: BookDemoAttribution,
  eventId: string
) {
  const apiKey = process.env.AIRTABLE_API_KEY;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableName = process.env.AIRTABLE_TABLE_NAME;

  if (!apiKey || !baseId || !tableName) {
    throw new Error("Airtable configuration is incomplete.");
  }

  const field = getAirtableFieldNames();
  const fields: Record<string, string> = {
    [field.workEmail]: submission.workEmail,
    [field.companyName]: submission.companyName,
    [field.team]: submission.team || "",
    [field.tools]: submission.tools?.join(", ") || "",
    [field.teamSize]: submission.teamSize || "",
    [field.bottleneck]: submission.bottleneck || "",
    [field.pageUrl]: submission.pageUrl || "",
    [field.landingPath]: attribution.landingPath || "",
    [field.referrer]: attribution.referrer || submission.referrer || "",
    [field.utmSource]: attribution.utmSource || "",
    [field.utmMedium]: attribution.utmMedium || "",
    [field.utmCampaign]: attribution.utmCampaign || "",
    [field.utmContent]: attribution.utmContent || "",
    [field.utmTerm]: attribution.utmTerm || "",
    [field.metaFbp]: attribution.fbp || "",
    [field.metaFbc]: attribution.fbc || "",
    [field.eventId]: eventId,
    [field.submittedAt]: new Date().toISOString(),
  };

  const response = await fetch(
    `${AIRTABLE_API_URL}/${baseId}/${encodeURIComponent(tableName)}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        records: [
          {
            fields: Object.fromEntries(
              Object.entries(fields).filter((entry) => entry[1] !== "")
            ),
          },
        ],
        typecast: true,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Airtable returned ${response.status}: ${errorBody || "Unknown error"}`
    );
  }

  return true;
}

function mergeAttribution(
  submission: BookDemoSubmission,
  cookieStore: Awaited<ReturnType<typeof cookies>>
) {
  const cookieAttribution = parseCookieJson<Record<string, string>>(
    cookieStore.get("ovrmn_utm")?.value
  );

  const cookieFbclid = cookieStore.get("ovrmn_fbclid")?.value;

  return compactObject<BookDemoAttribution>({
    fbc:
      submission.attribution?.fbc ||
      cookieStore.get("_fbc")?.value ||
      cookieStore.get("ovrmn_fbc")?.value ||
      formatFbc(cookieFbclid),
    fbp:
      submission.attribution?.fbp ||
      cookieStore.get("_fbp")?.value ||
      cookieStore.get("ovrmn_fbp")?.value,
    fbclid: submission.attribution?.fbclid || cookieFbclid,
    landingPath:
      submission.attribution?.landingPath ||
      cookieStore.get("ovrmn_landing_path")?.value,
    referrer:
      submission.referrer ||
      submission.attribution?.referrer ||
      cookieStore.get("ovrmn_referrer")?.value,
    utmCampaign:
      submission.attribution?.utmCampaign || cookieAttribution?.utm_campaign,
    utmContent:
      submission.attribution?.utmContent || cookieAttribution?.utm_content,
    utmMedium:
      submission.attribution?.utmMedium || cookieAttribution?.utm_medium,
    utmSource:
      submission.attribution?.utmSource || cookieAttribution?.utm_source,
    utmTerm: submission.attribution?.utmTerm || cookieAttribution?.utm_term,
  });
}

function getMissingAirtableConfig() {
  return [
    !process.env.AIRTABLE_API_KEY && "AIRTABLE_API_KEY",
    !process.env.AIRTABLE_BASE_ID && "AIRTABLE_BASE_ID",
    !process.env.AIRTABLE_TABLE_NAME && "AIRTABLE_TABLE_NAME",
  ].filter((entry): entry is string => Boolean(entry));
}

function getAirtableFieldNames() {
  return {
    workEmail: process.env.AIRTABLE_WORK_EMAIL_FIELD || "Work email",
    companyName: process.env.AIRTABLE_COMPANY_NAME_FIELD || "Company name",
    team: process.env.AIRTABLE_TEAM_FIELD || "First team",
    tools: process.env.AIRTABLE_TOOLS_FIELD || "Daily tools",
    teamSize: process.env.AIRTABLE_TEAM_SIZE_FIELD || "Team size",
    bottleneck:
      process.env.AIRTABLE_BOTTLENECK_FIELD || "Operational bottleneck",
    pageUrl: process.env.AIRTABLE_PAGE_URL_FIELD || "Page URL",
    landingPath: process.env.AIRTABLE_LANDING_PATH_FIELD || "Landing path",
    referrer: process.env.AIRTABLE_REFERRER_FIELD || "Referrer",
    utmSource: process.env.AIRTABLE_UTM_SOURCE_FIELD || "UTM source",
    utmMedium: process.env.AIRTABLE_UTM_MEDIUM_FIELD || "UTM medium",
    utmCampaign: process.env.AIRTABLE_UTM_CAMPAIGN_FIELD || "UTM campaign",
    utmContent: process.env.AIRTABLE_UTM_CONTENT_FIELD || "UTM content",
    utmTerm: process.env.AIRTABLE_UTM_TERM_FIELD || "UTM term",
    metaFbp: process.env.AIRTABLE_META_FBP_FIELD || "Meta fbp",
    metaFbc: process.env.AIRTABLE_META_FBC_FIELD || "Meta fbc",
    eventId: process.env.AIRTABLE_EVENT_ID_FIELD || "Meta event id",
    submittedAt: process.env.AIRTABLE_SUBMITTED_AT_FIELD || "Submitted at",
  };
}

function firstError(errors: Record<string, string | undefined>) {
  return Object.values(errors).find(Boolean);
}

function createServerEventId() {
  return `ovrmn_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function formatFbc(fbclid?: string) {
  return fbclid ? `fb.1.${Date.now()}.${fbclid}` : undefined;
}

function parseCookieJson<T>(value?: string) {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
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
