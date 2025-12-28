import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: {
    appIsrStatus: false, // Disable static route indicator (bottom-left icon)
  },
};

export default nextConfig;
