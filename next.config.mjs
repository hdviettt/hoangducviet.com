import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev';

/** @type {import('next').NextConfig} */

// Ensure the environment variable has a default value
const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_API_ENDPOINT || 'https://directus-production-b969.up.railway.app';

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: DIRECTUS_URL.replace(/https?:\/\//, ''),
      },
    ],
  },
};

// Setup Cloudflare development platform in development mode
if (process.env.NODE_ENV === 'development') {
  await setupDevPlatform();
}

export default nextConfig;