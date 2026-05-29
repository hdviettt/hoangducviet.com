/** @type {import('next').NextConfig} */

const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pg"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.r2.dev",
      },
      {
        protocol: "https",
        hostname: "**.cloudflare.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/uploads/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
      // A2A agent discovery: serve the Agent Card from the canonical
      // well-known path. App Router doesn't reliably route leading-dot
      // folders, so the handler lives at /api/agent-card.
      {
        source: "/.well-known/agent-card.json",
        destination: "/api/agent-card",
      },
      // Legacy alias used by older A2A clients.
      {
        source: "/.well-known/agent.json",
        destination: "/api/agent-card",
      },
      // Agent Skills Discovery index + per-skill SKILL.md.
      {
        source: "/.well-known/agent-skills/index.json",
        destination: "/api/agent-skills",
      },
      {
        source: "/.well-known/agent-skills/:name/SKILL.md",
        destination: "/api/agent-skills/:name",
      },
    ];
  },
  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
