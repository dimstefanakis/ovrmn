import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { ENTERPRISE_ORIGIN, FITNESS_ORIGIN, isEnterpriseHost } from "@/lib/site-host";

// Only canonical, indexable pages. /pt and /pt-waitlist point at / and aren't listed.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (isEnterpriseHost((await headers()).get("host"))) {
    return ["/", "/tickets", "/book"].map((path) => ({ url: `${ENTERPRISE_ORIGIN}${path}` }));
  }
  return [{ url: `${FITNESS_ORIGIN}/` }];
}
