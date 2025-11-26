/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
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
      '@daily-co/daily-react'
    ],
    // Enable faster builds with incremental cache
    incrementalCacheHandlerPath: undefined,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
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

    // Performance optimizations
    config.optimization.usedExports = true;
    config.optimization.sideEffects = true;

    // Module concatenation for smaller bundles
    if (!isServer) {
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
};

export default nextConfig;
