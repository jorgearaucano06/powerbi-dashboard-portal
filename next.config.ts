import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Silenciar warning de múltiples lockfiles
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
