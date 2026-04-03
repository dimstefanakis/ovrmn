import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Prevent Turbopack from inferring the parent /dev folder as the workspace root.
    root: process.cwd(),
  },
};

export default nextConfig;
