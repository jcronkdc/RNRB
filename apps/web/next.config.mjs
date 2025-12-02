/** @type {import('next').NextConfig} */
import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

// Security headers to protect against common attacks
const securityHeaders = [
  // Prevent clickjacking attacks
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  // Prevent MIME type sniffing
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  // Enable XSS filter in browsers
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  // Control referrer information
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  // Permissions policy - restrict features
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(self), geolocation=(), interest-cohort=()',
  },
  // Strict Transport Security (HTTPS only)
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains',
  },
  // Content Security Policy
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://*.vercel-insights.com https://*.posthog.com https://us-assets.i.posthog.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https: http:",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://*.supabase.co https://*.neon.tech wss://*.ably.io wss://*.ably.net https://*.ably.net wss://*.ably-realtime.com https://*.ably-realtime.com https://api.openai.com https://*.stripe.com https://*.vercel-insights.com https://api.replicate.com https://*.replicate.delivery https://*.posthog.com https://us.i.posthog.com https://us-assets.i.posthog.com",
      "media-src 'self' blob: https:",
      "frame-src 'self' https://js.stripe.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join('; '),
  },
];

import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const nextConfig = {
  reactStrictMode: true,
  // output: 'standalone', // Temporarily disabled - causing /_document error in Next.js 15.5.6
  // Fix for monorepo: explicitly set the workspace root for file tracing
  outputFileTracingRoot: join(__dirname, '../../'),
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  experimental: {
    optimizePackageImports: [
      'lucide-react', 
      'framer-motion', 
      '@cronkwaters/ui',
      'ably',
      '@daily-co/daily-js',
      '@daily-co/daily-react',
      'date-fns',
      'lodash',
      'posthog-js',
    ],
    // CSS optimization
    optimizeCss: true,
  },
  images: {
    // Enable AVIF and WebP for modern formats (Lighthouse recommendation)
    formats: ['image/avif', 'image/webp'],
    // Responsive image sizes for different viewports
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Aggressive caching for images (1 year)
    minimumCacheTTL: 31536000,
    // Disable blur placeholder to reduce initial bundle
    disableStaticImages: false,
    // Allow dangerous SVG (for custom icons)
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cronkwaters.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '*.printful.com',
      },
      {
        protocol: 'https',
        hostname: 'files.cdn.printful.com',
      },
    ],
  },
  webpack: (config, { isServer, webpack }) => {
    // Ensure proper handling of lucide-react icons
    config.module.rules.push({
      test: /lucide-react/,
      sideEffects: false,
    });

    // Split large chunks for better caching
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            // Vendor chunk for node_modules
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: -10,
              reuseExistingChunk: true,
            },
            // Ably realtime chunk (large library)
            ably: {
              test: /[\\/]node_modules[\\/]ably[\\/]/,
              name: 'ably',
              priority: 10,
              reuseExistingChunk: true,
            },
            // Daily.co video chunk (large library)
            daily: {
              test: /[\\/]node_modules[\\/]@daily-co[\\/]/,
              name: 'daily',
              priority: 10,
              reuseExistingChunk: true,
            },
            // Framer Motion animations
            framer: {
              test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
              name: 'framer',
              priority: 10,
              reuseExistingChunk: true,
            },
            // React PDF rendering
            reactPdf: {
              test: /[\\/]node_modules[\\/]@react-pdf[\\/]/,
              name: 'react-pdf',
              priority: 10,
              reuseExistingChunk: true,
            },
            // UI components
            ui: {
              test: /[\\/]packages[\\/]ui[\\/]/,
              name: 'ui',
              priority: 5,
              reuseExistingChunk: true,
            },
            // Common shared code
            common: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
              name: 'common',
            },
          },
          maxInitialRequests: 25,
          maxAsyncRequests: 25,
          minSize: 20000,
          minRemainingSize: 0,
        },
      };

      // Add bundle analyzer in development
      if (process.env.ANALYZE === 'true') {
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            reportFilename: '../bundle-report.html',
            openAnalyzer: false,
          })
        );
      }
    }

    // Module concatenation for smaller bundles (only in production)
    if (!isServer && process.env.NODE_ENV === 'production') {
      config.optimization.concatenateModules = true;
    }

    return config;
  },
  // Compression
  compress: true,
  // Performance hints
  poweredByHeader: false,
  // Generate source maps only in development
  productionBrowserSourceMaps: false,
  // Optimize CSS
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  // Apply security headers to all routes
  async headers() {
    return [
      {
        // Apply to all routes
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        // Static assets - aggressive caching (1 year, immutable)
        source: '/:all*(svg|jpg|jpeg|png|webp|avif|gif|ico|woff|woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // JavaScript and CSS files with version hashes
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Fonts - long cache
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Extra security for API routes
        source: '/api/:path*',
        headers: [
          ...securityHeaders,
          // Prevent caching of API responses with sensitive data
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
      {
        // HTML pages - moderate cache with revalidation
        source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, s-maxage=86400, stale-while-revalidate=86400',
          },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
