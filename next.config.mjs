/** @type {import('next').NextConfig} */

// Ensure the environment variable has a default value
const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_API_ENDPOINT || 'https://directus-production-8b7b.up.railway.app';

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: DIRECTUS_URL.replace(/https?:\/\//, ''),
      },
    ],
  },
  env: {
    NEXT_PUBLIC_DIRECTUS_API_ENDPOINT: DIRECTUS_URL,
  },
};

export default nextConfig;
