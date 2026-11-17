/** One deployment serves two sites: www.ovrmn.com (fitness) and www.senec.ai (enterprise). */
export const FITNESS_ORIGIN = "https://www.ovrmn.com";
export const ENTERPRISE_ORIGIN = "https://www.senec.ai";

export function isEnterpriseHost(host: string | null | undefined) {
  return /(?:^|\.)senec\.ai(?::\d+)?$/i.test(host ?? "");
}
