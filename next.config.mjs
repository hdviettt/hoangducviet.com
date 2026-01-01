/** @type {import('next').NextConfig} */

const DIRECTUS_URL = 'https://directus-production-b969.up.railway.app';

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'directus-production-b969.up.railway.app',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_DIRECTUS_API_ENDPOINT: DIRECTUS_URL,
  },
  async rewrites() {
    return [
      {
        source: '/ingest/static/:path*',
        destination: 'https://us-assets.i.posthog.com/static/:path*',
      },
      {
        source: '/ingest/:path*',
        destination: 'https://us.i.posthog.com/:path*',
      },
    ];
  },
  // This is required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
