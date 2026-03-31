import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // API proxy: forwards /backend/* to the Express backend
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
