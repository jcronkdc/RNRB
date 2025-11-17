import { test, expect } from '@playwright/test';

// NOTE: Make sure DEMO_BYPASS=1 is set in your running app process, not the test process.

// Home renders
// ———————————————————
test('home renders', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /cronkwaters/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /donate/i })).toBeVisible();
});

// Donate renders
// ———————————————————
test('donate page renders', async ({ page }) => {
  await page.goto('/donate');
  await expect(page.getByRole('heading', { name: /support the foundation/i })).toBeVisible();
});

// Projects (DEMO_BYPASS) renders
// ———————————————————
test('projects renders with DEMO_BYPASS & cookie', async ({ page, context, baseURL }) => {
  // You must start the dev server with DEMO_BYPASS=1 in the app process.

  // Visit onboarding to ensure the app will pick up our cookie.
  await page.goto('/onboarding/organization');
  const url = new URL(baseURL ?? 'http://localhost:3000');
  await context.addCookies([
    {
      name: 'sf_org',
      value: 'demo-org',
      domain: url.hostname,
      path: '/',
      httpOnly: false,
      secure: false,
      sameSite: 'Lax',
      expires: Math.floor(Date.now() / 1000) + 3600
    }
  ]);
  await page.goto('/app/projects');
  await expect(page.getByRole('heading', { name: /projects/i })).toBeVisible();
});
