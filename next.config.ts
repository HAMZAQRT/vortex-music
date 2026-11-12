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
  partialPrefetching: true,

  experimental: {
    agentFeedback: true,
  },
};

export default nextConfig;
