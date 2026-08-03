import type { NextConfig } from "next";

const config: NextConfig = {
  // Emits a minimal server bundle so the runtime Docker image stays small.
  output: "standalone",
  reactStrictMode: true,
  poweredByHeader: false,

  /**
   * In production Caddy routes /api/* and /uploads/* to the backend before Next
   * ever sees them. These rewrites exist so `npm run dev` works on its own,
   * against an API running on localhost:8000.
   */
  async rewrites() {
    const apiUrl = process.env.API_INTERNAL_URL ?? "http://localhost:8000";
    return [
      { source: "/api/:path*", destination: `${apiUrl}/api/:path*` },
      { source: "/uploads/:path*", destination: `${apiUrl}/uploads/:path*` },
    ];
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
        ],
      },
    ];
  },
};

export default config;
