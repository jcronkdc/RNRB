import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['tests/setup-vitest.ts'],
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
      '@songforge/db': path.resolve(__dirname, './packages/db/src'),
      '@songforge/auth': path.resolve(__dirname, './packages/auth/src'),
      '@songforge/ui': path.resolve(__dirname, './packages/ui/src')
    }
  }
});
