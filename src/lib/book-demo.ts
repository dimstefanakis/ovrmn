export const WORKFLOW_OPTIONS = [
  "Support tickets",
  "Campaign monitoring",
  "Fraud checks",
  "Engineering ops",
  "Other repeated work",
] as const;

export const WORK_CONTEXT_OPTIONS = [
  "Email",
  "Slack",
  "Zendesk",
  "Intercom",
  "Shopify",
  "HubSpot",
  "Asana",
  "Jira",
  "Salesforce",
  "Internal tools",
] as const;

export const TEAM_SIZE_OPTIONS = ["1-5", "6-20", "21-50", "50+"] as const;

export type WorkflowOption = (typeof WORKFLOW_OPTIONS)[number];
export type WorkContextOption = (typeof WORK_CONTEXT_OPTIONS)[number];
export type TeamSizeOption = (typeof TEAM_SIZE_OPTIONS)[number];

export type BookDemoAttribution = {
  fbc?: string;
  fbp?: string;
  fbclid?: string;
  liFatId?: string;
  landingPath?: string;
  referrer?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmMedium?: string;
  utmSource?: string;
  utmTerm?: string;
};

export type BookDemoSubmission = {
  workEmail: string;
  companyName: string;
  workflow?: WorkflowOption;
  workContext?: WorkContextOption[];
  teamSize?: TeamSizeOption;
  repeatingWork?: string;
  eventId?: string;
  pageUrl?: string;
  referrer?: string;
  attribution?: BookDemoAttribution;
};

export type BookDemoFieldErrors = Partial<
  Record<
    | "workEmail"
    | "companyName"
    | "workflow"
    | "workContext"
    | "teamSize"
    | "repeatingWork"
    | "form",
    string
  >
>;

const PERSONAL_EMAIL_DOMAINS = new Set([
  "aol.com",
  "gmail.com",
  "gmx.com",
  "googlemail.com",
  "hey.com",
  "hotmail.com",
  "icloud.com",
  "live.com",
  "mac.com",
  "mail.com",
  "me.com",
  "msn.com",
  "outlook.com",
  "pm.me",
  "proton.me",
  "protonmail.com",
  "yahoo.com",
  "ymail.com",
]);

const WORKFLOW_SET = new Set<string>(WORKFLOW_OPTIONS);
const WORK_CONTEXT_SET = new Set<string>(WORK_CONTEXT_OPTIONS);
const TEAM_SIZE_SET = new Set<string>(TEAM_SIZE_OPTIONS);
const LEGACY_WORKFLOW_MAP: Record<string, WorkflowOption> = {
  Engineering: "Engineering ops",
  Marketing: "Campaign monitoring",
  Support: "Support tickets",
  Ops: "Other repeated work",
  Other: "Other repeated work",
  "Fraud / risk": "Fraud checks",
};
const LEGACY_WORK_CONTEXT_MAP: Record<string, WorkContextOption> = {
  "custom/internal tools": "Internal tools",
  "Custom/internal tools": "Internal tools",
};

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isWorkEmail(value: string) {
  const normalized = normalizeEmail(value);

  if (!isValidEmail(normalized)) {
    return false;
  }

  const [, domain = ""] = normalized.split("@");
  return !PERSONAL_EMAIL_DOMAINS.has(domain);
}

export function validateBookDemoSubmission(
  input: unknown
):
  | { success: true; data: BookDemoSubmission }
  | { success: false; errors: BookDemoFieldErrors } {
  const candidate = (input ?? {}) as Record<string, unknown>;

  const workEmail = normalizeEmail(asString(candidate.workEmail));
  const companyName = asString(candidate.companyName).trim();
  const rawWorkflow = asString(candidate.workflow ?? candidate.team).trim();
  const workflow = LEGACY_WORKFLOW_MAP[rawWorkflow] || rawWorkflow;
  const rawWorkContext = candidate.workContext ?? candidate.tools;
  const workContext = Array.isArray(rawWorkContext)
    ? rawWorkContext
        .map((entry) => asString(entry).trim())
        .filter(Boolean)
        .map((entry) => LEGACY_WORK_CONTEXT_MAP[entry] || entry)
    : [];
  const teamSize = asString(candidate.teamSize).trim();
  const repeatingWork = asString(
    candidate.repeatingWork ?? candidate.bottleneck
  ).trim();
  const eventId = asString(candidate.eventId).trim();
  const pageUrl = asString(candidate.pageUrl).trim();
  const referrer = asString(candidate.referrer).trim();
  const attribution = normalizeAttribution(candidate.attribution);

  const errors: BookDemoFieldErrors = {};

  if (!workEmail) {
    errors.workEmail = "Required";
  } else if (!isValidEmail(workEmail)) {
    errors.workEmail = "Invalid email";
  } else if (!isWorkEmail(workEmail)) {
    errors.workEmail =
      "Please use a company email so we can match this to the right account.";
  }

  if (!companyName) {
    errors.companyName = "Required";
  } else if (companyName.length > 120) {
    errors.companyName = "Too long";
  }

  if (workflow && !WORKFLOW_SET.has(workflow)) {
    errors.workflow = "Choose a valid workflow option.";
  }

  if (
    workContext.length > 0 &&
    workContext.some((entry) => !WORK_CONTEXT_SET.has(entry))
  ) {
    errors.workContext = "One of the selected places is not supported.";
  }

  if (teamSize && !TEAM_SIZE_SET.has(teamSize)) {
    errors.teamSize = "Pick a valid team size band.";
  }

  if (repeatingWork.length > 1000) {
    errors.repeatingWork = "Keep this note under 1000 characters.";
  }

  if (pageUrl && pageUrl.length > 500) {
    errors.form = "The captured page URL was unexpectedly long.";
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      workEmail,
      companyName,
      workflow: (workflow as WorkflowOption) || undefined,
      workContext:
        workContext.length > 0
          ? (Array.from(new Set(workContext)) as WorkContextOption[])
          : undefined,
      teamSize: (teamSize as TeamSizeOption) || undefined,
      repeatingWork: repeatingWork || undefined,
      eventId: eventId || undefined,
      pageUrl: pageUrl || undefined,
      referrer: referrer || undefined,
      attribution,
    },
  };
}

function normalizeAttribution(value: unknown): BookDemoAttribution | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const candidate = value as Record<string, unknown>;
  const attribution: BookDemoAttribution = {
    fbc: trimmed(candidate.fbc),
    fbp: trimmed(candidate.fbp),
    fbclid: trimmed(candidate.fbclid),
    liFatId: trimmed(candidate.liFatId),
    landingPath: trimmed(candidate.landingPath),
    referrer: trimmed(candidate.referrer),
    utmCampaign: trimmed(candidate.utmCampaign),
    utmContent: trimmed(candidate.utmContent),
    utmMedium: trimmed(candidate.utmMedium),
    utmSource: trimmed(candidate.utmSource),
    utmTerm: trimmed(candidate.utmTerm),
  };

  return Object.values(attribution).some(Boolean) ? attribution : undefined;
}

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function trimmed(value: unknown) {
  const normalized = asString(value).trim();
  return normalized || undefined;
}
