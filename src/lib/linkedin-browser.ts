const LINKEDIN_PARTNER_ID = process.env.NEXT_PUBLIC_LINKEDIN_PARTNER_ID || "";

export function hasLinkedInInsightTag() {
  return Boolean(LINKEDIN_PARTNER_ID);
}

export function getLinkedInPartnerId() {
  return LINKEDIN_PARTNER_ID;
}
