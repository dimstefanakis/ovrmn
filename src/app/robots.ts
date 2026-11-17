import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { ENTERPRISE_ORIGIN, FITNESS_ORIGIN, isEnterpriseHost } from "@/lib/site-host";

// /join pages send their own noindex header, so they stay crawlable for that header to be seen.
export default async function robots(): Promise<MetadataRoute.Robots> {
  const origin = isEnterpriseHost((await headers()).get("host")) ? ENTERPRISE_ORIGIN : FITNESS_ORIGIN;
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: `${origin}/sitemap.xml`,
  };
}
