import type { NextConfig } from "next";

// ovrmn.com is the fitness site: its home is the waitlist landing (src/app/page.tsx).
// The enterprise site is www.senec.ai, same deployment: its home is src/app/enterprise/page.tsx.
const ENTERPRISE_HOST = "(?:www\\.)?senec\\.ai";

// /enterprise itself stays reachable; its canonical tag points search engines at www.senec.ai/.
const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/", has: [{ type: "host", value: ENTERPRISE_HOST }], destination: "/enterprise" },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
  async headers() {
    const headers = [
      { key: "Referrer-Policy", value: "no-referrer" },
      { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
      { key: "Cache-Control", value: "no-store" },
    ];
    return [{ source: "/join/:path*", headers }];
  },
  turbopack: {
    // Prevent Turbopack from inferring the parent /dev folder as the workspace root.
    root: process.cwd(),
  },
};

export default nextConfig;
