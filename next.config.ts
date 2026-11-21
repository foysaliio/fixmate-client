import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const apiBaseUrl = process.env.API_BASE_URL;
    if (!apiBaseUrl) throw new Error("API_BASE_URL must be set.");

    return [
      {
        source: "/api/auth/:path*",
        destination: `${apiBaseUrl.replace(/\/$/, "")}/api/auth/:path*`,
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
