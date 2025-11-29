import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    // Include all test files in apps/web
    include: [
      'apps/web/__tests__/**/*.test.{ts,tsx}',
      'apps/web/app/**/__tests__/**/*.test.{ts,tsx}',
      'apps/web/components/**/__tests__/**/*.test.{ts,tsx}',
      'apps/web/lib/**/__tests__/**/*.test.{ts,tsx}',
      'apps/web/hooks/**/__tests__/**/*.test.{ts,tsx}',
    ],
    exclude: ['**/node_modules/**', '**/dist/**', '**/.next/**', '**/e2e/**'],
    setupFiles: ['./apps/web/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: [
        'apps/web/app/**/*.{ts,tsx}',
        'apps/web/components/**/*.{ts,tsx}',
        'apps/web/lib/**/*.{ts,tsx}',
        'apps/web/hooks/**/*.{ts,tsx}',
      ],
      exclude: [
        'node_modules/',
        '**/test/**',
        '**/__tests__/**',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        '**/*.config.*',
        '**/dist/',
        '**/.next/',
        '**/types/**',
        '**/*.d.ts',
      ],
      // Coverage thresholds - set to 0 during test development phase
      // Increase these as test coverage improves
      thresholds: {
        lines: 0,
        functions: 0,
        branches: 0,
        statements: 0,
      },
    },
    // Performance settings
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    // Better error output
    reporters: ['default'],
    // Timeouts
    testTimeout: 10000,
    hookTimeout: 10000,
  },
  resolve: {
    alias: {
      // Project aliases
      '@': path.resolve(__dirname, './apps/web'),
      '@cronkwaters/db': path.resolve(__dirname, './packages/db/src'),
      '@cronkwaters/auth': path.resolve(__dirname, './packages/auth/src'),
      '@cronkwaters/ui': path.resolve(__dirname, './packages/ui/src'),
      '@cronkwaters/trpc': path.resolve(__dirname, './packages/trpc/src'),
      // Legacy aliases for backward compatibility
      '@songforge/db': path.resolve(__dirname, './packages/db/src'),
      '@songforge/auth': path.resolve(__dirname, './packages/auth/src'),
      '@songforge/ui': path.resolve(__dirname, './packages/ui/src'),
    },
  },
});
