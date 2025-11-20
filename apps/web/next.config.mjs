/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  webpack: (config) => {
    // Ensure proper handling of lucide-react icons
    config.module.rules.push({
      test: /lucide-react/,
      sideEffects: false,
    });
    return config;
  },
};

export default nextConfig;
