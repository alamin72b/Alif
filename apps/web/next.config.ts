import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@alif/contracts", "@alif/config", "@alif/observability"],
};

export default nextConfig;
