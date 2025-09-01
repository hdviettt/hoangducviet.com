/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_DIRECTUS_API_ENDPOINT.replace(/https?:\/\//, '') || 'directus-production-8b7b.up.railway.app',
      },
    ],
  },
};

export default nextConfig;
