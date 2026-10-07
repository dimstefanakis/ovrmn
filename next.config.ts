import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
