/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable standalone output for Docker deployments
  output: 'standalone',
  // Allow images from mail server
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mail.rnrb.me',
      },
    ],
  },
  // Environment variables
  env: {
    STALWART_JMAP_URL: process.env.STALWART_JMAP_URL || 'https://mail.rnrb.me/jmap',
    NEXT_PUBLIC_RNRB_API_URL: process.env.NEXT_PUBLIC_RNRB_API_URL || 'https://rnrb.pro',
  },
};

export default nextConfig;

