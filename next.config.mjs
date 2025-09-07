/** @type {import('next').NextConfig} */

// Hard-code the Directus URL for Cloudflare Workers
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
};

// Only import and setup dev platform in development
if (process.env.NODE_ENV === 'development') {
  const { setupDevPlatform } = await import('@cloudflare/next-on-pages/next-dev');
  await setupDevPlatform();
}

export default nextConfig;