import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "thesocialgame.in",
        pathname: "/cdn/shop/**",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
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
