import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // API proxy: forwards /api/search to the Express backend
  async rewrites() {
    return [
      {
        source: "/backend/:path*",
        destination: `${process.env.BACKEND_URL || "http://localhost:3000"}/:path*`,
      },
    ];
  },
};

export default nextConfig;
