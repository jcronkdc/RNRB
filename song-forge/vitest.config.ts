import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
    exclude: [
      'tests/e2e/**',
      'tests/**/*.spec.ts',
      '**/node_modules/**',
      '**/dist/**',
      '**/.{idea,git,cache,output,temp}/**',
      'tests/smoke.spec.ts'
    ],
    setupFiles: ['tests/setup-vitest.ts'],
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true
      }
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.spec.ts',
        '**/*.test.ts',
        '**/*.config.*',
        '**/dist/',
        '**/.next/'
      ]
    }
  },
  resolve: {
    alias: {
      '@cronkwaters/db': path.resolve(__dirname, './packages/db/src'),
      '@cronkwaters/auth': path.resolve(__dirname, './packages/auth/src'),
      '@cronkwaters/ui': path.resolve(__dirname, './packages/ui/src'),
      '@cronkwaters/trpc': path.resolve(__dirname, './packages/trpc/src')
    }
  }
});
