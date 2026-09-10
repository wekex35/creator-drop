import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // R2/CDN hosts are public; skip SSRF private-IP blocks on the VPS optimizer.
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "store.creatordrop.in",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
