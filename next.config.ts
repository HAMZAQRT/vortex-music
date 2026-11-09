import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        pathname: "/**",
      },
    ],
  },

  cacheComponents: true,

  experimental: {
    agentFeedback: true,
  },
};

export default nextConfig;
