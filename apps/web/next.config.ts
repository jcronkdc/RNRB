import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Remove standalone output for Vercel deployment
  // output: 'standalone', // For Docker deployment
  
  // Image optimization with restricted domains
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com' // Google user avatars
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com' // GitHub avatars
      },
      {
        protocol: 'https',
        hostname: 'cdn.cronkwaters.com' // Our CDN
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com' // Stock photos
      }
      // Add other specific domains as needed
    ]
  },

  // Performance optimizations
  experimental: {
    optimizePackageImports: ['@cronkwaters/ui', 'lucide-react']
  },

  // Security-focused webpack configuration
  webpack: (config, { isServer, dev }) => {
    // Disable source maps in production
    if (!dev && !isServer) {
      config.devtool = false;
    }

    // Remove server-side modules from client bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        os: false,
        path: false,
        stream: false,
        buffer: false
      };
    }

    // Security plugins
    config.plugins.push(
      new (require('webpack').DefinePlugin)({
        '__SENTRY_DEBUG__': false,
        '__SENTRY_TRACING__': false
      })
    );

    return config;
  },

  // Disable powered by header
  poweredByHeader: false,

  // Compress responses
  compress: true,

  // Generate ETags
  generateEtags: true,

  // Page extensions
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],

  // Trailing slash configuration
  trailingSlash: false,

  // Environment variables validation
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'https://cronkwaters.com'
  },

  // Headers are now in middleware.ts for better control
};

export default nextConfig;
