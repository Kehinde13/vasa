import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "vasabackend.onrender.com",
      },
    ],
  },
};

export default nextConfig;
