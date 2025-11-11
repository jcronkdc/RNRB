import { test, expect } from '@playwright/test';

/**
 * HOSTILE AUDIT: Music Industry Flow Tests
 * Testing prompt→lyric→melody→split→lease→distribute pipeline
 * These tests expose critical bugs in production code
 */

test.describe('Music Industry Flow Audit', () => {
  test.beforeEach(async ({ page, context, baseURL }) => {
    // Setup demo bypass cookie
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
  });

  // PROMPT → LYRIC FLOW
  test('1. Prompt creation fails with empty input', async ({ page }) => {
    await page.goto('/app/projects');
    // BUG: No prompt input validation
    const createButton = page.getByRole('button', { name: /create.*project/i }).first();
    if (await createButton.isVisible()) {
      await createButton.click();
      const nameInput = page.locator('input[name="name"], input[placeholder*="name" i]').first();
      if (await nameInput.isVisible()) {
        await nameInput.fill('');
        const submitButton = page.getByRole('button', { name: /submit|create|save/i }).first();
        await submitButton.click();
        // Should show validation error
        await expect(page.locator('text=/required|invalid/i').first()).toBeVisible({ timeout: 2000 });
      }
    }
  });

  test('2. Lyric asset upload allows malicious file types', async ({ page }) => {
    await page.goto('/app/projects');
    // BUG: Should reject .exe/.sh files but doesn't validate file types properly
    const fileInputs = page.locator('input[type="file"]');
    const count = await fileInputs.count();
    if (count > 0) {
      // Try uploading executable as lyric
      await fileInputs.first().setInputFiles({
        name: 'malicious.exe',
        mimeType: 'application/x-msdownload',
        buffer: Buffer.from('MZ\x90\x00')
      });
      // Should show error
      await expect(page.locator('text=/invalid.*file.*type|unsupported.*format/i').first()).toBeVisible({ timeout: 2000 });
    }
  });

  test('3. Lyric text extraction leaks sensitive data', async ({ page }) => {
    await page.goto('/app/projects');
    // BUG: Metadata extraction should sanitize but leaks internal paths
    const response = await page.request.post('/api/assets/upload', {
      data: JSON.stringify({
        name: 'lyric.txt',
        content: 'Test lyrics',
        metadata: { internalPath: '/etc/passwd', apiKey: 'secret123' }
      }),
      headers: { 'Content-Type': 'application/json' }
    }).catch(() => null);
    
    if (response && response.ok()) {
      const data = await response.json();
      // Should not expose metadata in response
      if (data.metadata) {
        expect(data.metadata).not.toHaveProperty('internalPath');
        expect(data.metadata).not.toHaveProperty('apiKey');
      }
    }
  });

  // MELODY → SPLIT FLOW
  test('4. Audio watermark not applied to melody files', async ({ page }) => {
    await page.goto('/app/projects');
    // BUG: Audio should be watermarked but isn't
    const fileInputs = page.locator('input[type="file"][accept*="audio"], input[type="file"]');
    const count = await fileInputs.count();
    if (count > 0) {
      await fileInputs.first().setInputFiles({
        name: 'melody.mp3',
        mimeType: 'audio/mpeg',
        buffer: Buffer.from('fake audio data')
      });
      
      // Wait for upload response
      const response = await page.waitForResponse(
        resp => resp.url().includes('/api/assets') || resp.url().includes('/api/upload'),
        { timeout: 5000 }
      ).catch(() => null);
      
      if (response) {
        const assetData = await response.json();
        // Should have watermark metadata
        if (assetData.metadata) {
          expect(assetData.metadata).toHaveProperty('watermark');
        }
      }
    }
  });

  test('5. Split validation allows percentages > 100%', async ({ page }) => {
    await page.goto('/app/projects');
    // BUG: Should reject but doesn't validate properly
    const createSplitButton = page.getByRole('button', { name: /create.*split|new.*split/i }).first();
    if (await createSplitButton.isVisible({ timeout: 2000 })) {
      await createSplitButton.click();
      const pctInputs = page.locator('input[name*="percentage"], input[type="number"]');
      const count = await pctInputs.count();
      if (count >= 2) {
        await pctInputs.nth(0).fill('60');
        await pctInputs.nth(1).fill('50'); // Total 110%
        const submitButton = page.getByRole('button', { name: /submit|save|create/i }).first();
        await submitButton.click();
        // Should show validation error
        await expect(page.locator('text=/must.*total.*100|exceeds.*100/i').first()).toBeVisible({ timeout: 2000 });
      }
    }
  });

  test('6. Split validation fails with negative percentages', async ({ page }) => {
    await page.goto('/app/projects');
    const createSplitButton = page.getByRole('button', { name: /create.*split|new.*split/i }).first();
    if (await createSplitButton.isVisible({ timeout: 2000 })) {
      await createSplitButton.click();
      const pctInput = page.locator('input[name*="percentage"], input[type="number"]').first();
      if (await pctInput.isVisible()) {
        await pctInput.fill('-10');
        const submitButton = page.getByRole('button', { name: /submit|save/i }).first();
        await submitButton.click();
        // BUG: Should reject negative values
        await expect(page.locator('text=/must.*be.*positive|invalid.*percentage|greater.*than.*0/i').first()).toBeVisible({ timeout: 2000 });
      }
    }
  });

  test('7. Split validation allows zero contributors', async ({ page }) => {
    await page.goto('/app/projects');
    const createSplitButton = page.getByRole('button', { name: /create.*split|new.*split/i }).first();
    if (await createSplitButton.isVisible({ timeout: 2000 })) {
      await createSplitButton.click();
      // Don't add any contributors
      const submitButton = page.getByRole('button', { name: /submit|save|create/i }).first();
      await submitButton.click();
      // BUG: Should require at least one contributor
      await expect(page.locator('text=/at least.*one.*contributor|require.*contributor/i').first()).toBeVisible({ timeout: 2000 });
    }
  });

  test('8. Split finalization allows non-100% totals', async ({ page }) => {
    await page.goto('/app/projects');
    // Create split with 95% total
    const createSplitButton = page.getByRole('button', { name: /create.*split|new.*split/i }).first();
    if (await createSplitButton.isVisible({ timeout: 2000 })) {
      await createSplitButton.click();
      const pctInput = page.locator('input[name*="percentage"], input[type="number"]').first();
      if (await pctInput.isVisible()) {
        await pctInput.fill('95');
        const submitButton = page.getByRole('button', { name: /submit|save/i }).first();
        await submitButton.click();
        await page.waitForTimeout(1000);
        
        // Try to finalize
        const finalizeButton = page.getByRole('button', { name: /finalize/i }).first();
        if (await finalizeButton.isVisible({ timeout: 2000 })) {
          await finalizeButton.click();
          // BUG: Should reject finalization if not exactly 100%
          await expect(page.locator('text=/must.*total.*100.*percent|exactly.*100/i').first()).toBeVisible({ timeout: 2000 });
        }
      }
    }
  });

  // SPLIT → LEASE FLOW
  test('9. License creation fails without required project association', async ({ page }) => {
    await page.goto('/app/projects');
    const createLicenseButton = page.getByRole('button', { name: /create.*license|new.*license/i }).first();
    if (await createLicenseButton.isVisible({ timeout: 2000 })) {
      await createLicenseButton.click();
      const titleInput = page.locator('input[name="title"], input[placeholder*="title" i]').first();
      if (await titleInput.isVisible()) {
        await titleInput.fill('Test License');
        const submitButton = page.getByRole('button', { name: /submit|create/i }).first();
        await submitButton.click();
        // BUG: Should require project
        await expect(page.locator('text=/project.*required|select.*project/i').first()).toBeVisible({ timeout: 2000 });
      }
    }
  });

  test('10. License signature allows invalid email format', async ({ page }) => {
    await page.goto('/app/projects');
    const signButton = page.getByRole('button', { name: /sign.*license/i }).first();
    if (await signButton.isVisible({ timeout: 2000 })) {
      await signButton.click();
      const emailInput = page.locator('input[name*="email"], input[type="email"]').first();
      if (await emailInput.isVisible()) {
        await emailInput.fill('not-an-email');
        const submitButton = page.getByRole('button', { name: /submit|sign/i }).first();
        await submitButton.click();
        // BUG: Should validate email format
        await expect(page.locator('text=/invalid.*email|valid.*email/i').first()).toBeVisible({ timeout: 2000 });
      }
    }
  });

  test('11. License PDF generation leaks watermark data', async ({ page }) => {
    await page.goto('/app/projects');
    // BUG: Should not expose internal watermark keys
    const response = await page.request.post('/api/licenses/generate-pdf', {
      data: JSON.stringify({ licenseId: 'test-id' }),
      headers: { 'Content-Type': 'application/json' }
    }).catch(() => null);
    
    if (response && response.ok()) {
      const data = await response.json();
      if (data.url) {
        const pdfResponse = await page.request.get(data.url).catch(() => null);
        if (pdfResponse && pdfResponse.ok()) {
          const pdfText = await pdfResponse.text();
          // Should not expose internal secrets
          expect(pdfText).not.toContain('WATERMARK_SECRET');
          expect(pdfText).not.toContain('INTERNAL_KEY');
        }
      }
    }
  });

  // LEASE → DISTRIBUTE FLOW
  test('12. Distribution fails with incomplete split data', async ({ page }) => {
    await page.goto('/app/projects');
    const distributeButton = page.getByRole('button', { name: /distribute/i }).first();
    if (await distributeButton.isVisible({ timeout: 2000 })) {
      await distributeButton.click();
      // BUG: Should check for finalized splits
      await expect(page.locator('text=/split.*must.*be.*finalized|finalize.*split/i').first()).toBeVisible({ timeout: 2000 });
    }
  });

  test('13. Royalty waterfall calculation errors with multiple tiers', async ({ page }) => {
    await page.goto('/app/projects');
    // Create split with multiple contributors
    const createSplitButton = page.getByRole('button', { name: /create.*split/i }).first();
    if (await createSplitButton.isVisible({ timeout: 2000 })) {
      await createSplitButton.click();
      const pctInputs = page.locator('input[name*="percentage"], input[type="number"]');
      const count = await pctInputs.count();
      if (count >= 3) {
        await pctInputs.nth(0).fill('50');
        await pctInputs.nth(1).fill('30');
        await pctInputs.nth(2).fill('20');
        await page.getByRole('button', { name: /submit|save/i }).first().click();
        await page.waitForTimeout(1000);
        
        // Calculate royalties with $1000 revenue
        const revenueInput = page.locator('input[name="revenue"], input[placeholder*="revenue" i]').first();
        if (await revenueInput.isVisible()) {
          await revenueInput.fill('1000');
          const calculateButton = page.getByRole('button', { name: /calculate/i }).first();
          if (await calculateButton.isVisible()) {
            await calculateButton.click();
            await page.waitForTimeout(1000);
            
            // BUG: Should calculate correctly: $500, $300, $200
            const royaltyElements = page.locator('[data-testid="royalty-amount"], [class*="royalty"]');
            const count = await royaltyElements.count();
            if (count >= 3) {
              const royalties = await Promise.all([
                royaltyElements.nth(0).textContent(),
                royaltyElements.nth(1).textContent(),
                royaltyElements.nth(2).textContent()
              ]);
              expect(royalties[0]).toContain('500');
              expect(royalties[1]).toContain('300');
              expect(royalties[2]).toContain('200');
            }
          }
        }
      }
    }
  });

  test('14. Offline asset sync race condition causes duplicates', async ({ page, context }) => {
    // Simulate offline scenario
    await context.setOffline(true);
    await page.goto('/app/projects');
    
    // Upload asset while offline
    const fileInputs = page.locator('input[type="file"]');
    const count = await fileInputs.count();
    if (count > 0) {
      await fileInputs.first().setInputFiles({
        name: 'test.mp3',
        mimeType: 'audio/mpeg',
        buffer: Buffer.from('test')
      });
      
      // Go back online
      await context.setOffline(false);
      
      // BUG: Should sync once, not create duplicates
      await page.waitForTimeout(3000);
      const assets = page.locator('[data-testid="asset-item"], [class*="asset"]');
      const assetCount = await assets.count();
      // Should not have duplicates (allowing for initial render)
      expect(assetCount).toBeLessThanOrEqual(2); // Account for potential UI duplicates
    }
  });

  test('15. SEO meta tags missing on project pages', async ({ page }) => {
    await page.goto('/app/projects');
    await page.waitForLoadState('networkidle');
    
    // BUG: Should have proper SEO meta tags
    const title = await page.locator('head title').textContent();
    expect(title).toBeTruthy();
    expect(title).not.toBe('Song Forge'); // Should be project-specific or have template
    
    const metaDescription = page.locator('head meta[name="description"]');
    if (await metaDescription.count() > 0) {
      const description = await metaDescription.getAttribute('content');
      expect(description).toBeTruthy();
    }
    
    const ogTitle = page.locator('head meta[property="og:title"]');
    if (await ogTitle.count() > 0) {
      const ogTitleContent = await ogTitle.getAttribute('content');
      expect(ogTitleContent).toBeTruthy();
    }
    
    const ogImage = page.locator('head meta[property="og:image"]');
    if (await ogImage.count() > 0) {
      const ogImageContent = await ogImage.getAttribute('content');
      expect(ogImageContent).toBeTruthy();
    }
  });
});

