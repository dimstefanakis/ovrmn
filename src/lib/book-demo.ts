export const TEAM_OPTIONS = [
  "Engineering",
  "Marketing",
  "Support",
  "Ops",
  "Other",
] as const;

export const TOOL_OPTIONS = [
  "Slack",
  "Asana",
  "Jira",
  "HubSpot",
  "Zendesk",
  "Salesforce",
  "custom/internal tools",
] as const;

export const TEAM_SIZE_OPTIONS = ["1-5", "6-20", "21-50", "50+"] as const;

export type TeamOption = (typeof TEAM_OPTIONS)[number];
export type ToolOption = (typeof TOOL_OPTIONS)[number];
export type TeamSizeOption = (typeof TEAM_SIZE_OPTIONS)[number];

export type BookDemoAttribution = {
  fbc?: string;
  fbp?: string;
  fbclid?: string;
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
  team?: TeamOption;
  tools?: ToolOption[];
  teamSize?: TeamSizeOption;
  bottleneck?: string;
  eventId?: string;
  pageUrl?: string;
  referrer?: string;
  attribution?: BookDemoAttribution;
};

export type BookDemoFieldErrors = Partial<
  Record<
    | "workEmail"
    | "companyName"
    | "team"
    | "tools"
    | "teamSize"
    | "bottleneck"
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

const TEAM_SET = new Set<string>(TEAM_OPTIONS);
const TOOL_SET = new Set<string>(TOOL_OPTIONS);
const TEAM_SIZE_SET = new Set<string>(TEAM_SIZE_OPTIONS);

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
  const team = asString(candidate.team).trim();
  const tools = Array.isArray(candidate.tools)
    ? candidate.tools.map((tool) => asString(tool).trim()).filter(Boolean)
    : [];
  const teamSize = asString(candidate.teamSize).trim();
  const bottleneck = asString(candidate.bottleneck).trim();
  const eventId = asString(candidate.eventId).trim();
  const pageUrl = asString(candidate.pageUrl).trim();
  const referrer = asString(candidate.referrer).trim();
  const attribution = normalizeAttribution(candidate.attribution);

  const errors: BookDemoFieldErrors = {};

  if (!workEmail) {
    errors.workEmail = "Use a work email to unlock the rest of the form.";
  } else if (!isValidEmail(workEmail)) {
    errors.workEmail = "Enter a valid email address.";
  } else if (!isWorkEmail(workEmail)) {
    errors.workEmail = "Please use your work email instead of a personal inbox.";
  }

  if (!companyName) {
    errors.companyName = "Tell us which company we should tailor the demo for.";
  } else if (companyName.length > 120) {
    errors.companyName = "Keep the company name under 120 characters.";
  }

  if (team && !TEAM_SET.has(team)) {
    errors.team = "Choose a valid team option.";
  }

  if (tools.length > 0 && tools.some((tool) => !TOOL_SET.has(tool))) {
    errors.tools = "One of the selected tools is not supported.";
  }

  if (teamSize && !TEAM_SIZE_SET.has(teamSize)) {
    errors.teamSize = "Pick a valid team size band.";
  }

  if (bottleneck.length > 1000) {
    errors.bottleneck = "Keep the bottleneck note under 1000 characters.";
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
      team: (team as TeamOption) || undefined,
      tools: tools.length > 0 ? (Array.from(new Set(tools)) as ToolOption[]) : undefined,
      teamSize: (teamSize as TeamSizeOption) || undefined,
      bottleneck: bottleneck || undefined,
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
