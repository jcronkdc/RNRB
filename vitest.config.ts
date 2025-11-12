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
      '@cronkwater/db': path.resolve(__dirname, './packages/db/src'),
      '@cronkwater/auth': path.resolve(__dirname, './packages/auth/src'),
      '@cronkwater/ui': path.resolve(__dirname, './packages/ui/src')
    }
  }
});
