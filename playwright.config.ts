import { defineConfig } from '@playwright/test';

const baseURL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export default defineConfig({
  testDir: './tests',
  testMatch: ['e2e/**/*.spec.ts', 'security/**/*.spec.ts'],
  use: {
    baseURL,
    headless: true
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' }
    }
  ]
});
