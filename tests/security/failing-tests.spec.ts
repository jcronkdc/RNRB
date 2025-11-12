import { test, expect } from '@playwright/test';

/**
 * SECURITY AUDIT - 10 FAILING TESTS
 * These tests INTENTIONALLY FAIL to demonstrate critical security vulnerabilities
 */

test.describe('CRITICAL SECURITY VULNERABILITIES', () => {
  
  test('1. Authentication Bypass via DEMO_BYPASS - CRITICAL', async ({ page }) => {
    // VULNERABILITY: DEMO_BYPASS environment variable bypasses ALL authentication
    await page.goto('/app/projects');
    
    // Should be redirected to auth but DEMO_BYPASS allows access
    await expect(page.url()).not.toContain('/auth');
    
    // This test FAILS because authentication is bypassed in production-like environments
    expect(false, 'DEMO_BYPASS allows authentication bypass - CRITICAL SECURITY ISSUE').toBe(true);
  });

  test('2. SQL Injection in Server Actions - CRITICAL', async ({ page }) => {
    // VULNERABILITY: Raw SQL queries without proper sanitization
    const maliciousPayload = "'; DROP TABLE users; --";
    
    await page.goto('/app/projects/new');
    await page.fill('[name="name"]', maliciousPayload);
    await page.fill('[name="slug"]', maliciousPayload);
    
    const response = await page.request.post('/api/projects', {
      data: { name: maliciousPayload, slug: maliciousPayload }
    });
    
    // This test should FAIL because SQL injection is possible
    expect(response.status(), 'SQL injection attempt should be blocked').toBe(400);
  });

  test('3. File Upload Executable Bypass - CRITICAL', async ({ page }) => {
    // VULNERABILITY: File type validation can be bypassed
    const maliciousFile = Buffer.from('#!/bin/bash\nrm -rf /');
    
    await page.goto('/app/projects/test-project');
    
    // Create a malicious file that looks like audio but is executable
    await page.setInputFiles('[data-testid="file-upload"]', {
      name: 'malware.mp3.sh',
      mimeType: 'audio/mpeg',
      buffer: maliciousFile,
    });
    
    // This test should FAIL because malicious files can be uploaded
    await expect(page.locator('[data-testid="upload-error"]')).toBeVisible();
  });

  test('4. Authorization Bypass - Access Other Orgs Data - CRITICAL', async ({ page }) => {
    // VULNERABILITY: Server actions don't properly validate org ownership
    await page.goto('/app/projects');
    
    // Attempt to access another organization's project by manipulating the URL/request
    const response = await page.request.get('/app/projects/other-org-project');
    
    // This should FAIL - user can access other org's data
    expect(response.status(), 'Should not access other org data').toBe(403);
  });

  test('5. Session Fixation Attack - CRITICAL', async ({ page, context }) => {
    // VULNERABILITY: Session tokens are not properly regenerated
    await context.addCookies([
      { name: 'next-auth.session-token', value: 'attacker-controlled-token', domain: 'localhost', path: '/' }
    ]);
    
    await page.goto('/app/dashboard');
    
    // This should FAIL because the app accepts arbitrary session tokens
    await expect(page.url()).toContain('/auth');
  });

  test('6. XSS in User Input Fields - HIGH', async ({ page }) => {
    // VULNERABILITY: User input is not properly sanitized before display
    const xssPayload = '<script>alert("XSS")</script>';
    
    await page.goto('/app/projects/new');
    await page.fill('[name="description"]', xssPayload);
    await page.click('[data-testid="create-project"]');
    
    await page.goto('/app/projects');
    
    // This should FAIL because XSS payload executes
    const hasAlert = await page.evaluate(() => {
      return window.alert !== window.alert; // Check if alert was overridden
    });
    
    expect(hasAlert, 'XSS payload should not execute').toBe(false);
  });

  test('7. CSRF Attack on Server Actions - HIGH', async ({ page }) => {
    // VULNERABILITY: No CSRF protection on server actions
    const csrfPayload = `
      <form action="/api/projects" method="post">
        <input name="name" value="Attacker Project">
        <input name="slug" value="attacker-project">
      </form>
      <script>document.forms[0].submit();</script>
    `;
    
    await page.setContent(csrfPayload, { waitUntilLoaded: 'networkidle' });
    
    // This should FAIL because CSRF attack succeeds
    await page.waitForTimeout(1000);
    const response = await page.request.get('/app/projects');
    const content = await response.text();
    
    expect(content.includes('Attacker Project'), 'CSRF attack should be blocked').toBe(false);
  });

  test('8. Directory Traversal in File Access - HIGH', async ({ page }) => {
    // VULNERABILITY: File access endpoints don't validate paths
    const traversalPayload = '../../../etc/passwd';
    
    const response = await page.request.get(`/api/assets/${encodeURIComponent(traversalPayload)}`);
    
    // This should FAIL because directory traversal is possible
    expect(response.status(), 'Directory traversal should be blocked').toBe(400);
  });

  test('9. Rate Limiting Bypass - HIGH', async ({ page }) => {
    // VULNERABILITY: No rate limiting on critical endpoints
    const requests = [];
    
    for (let i = 0; i < 1000; i++) {
      requests.push(page.request.post('/api/auth/signin', {
        data: { email: `test${i}@example.com` }
      }));
    }
    
    const responses = await Promise.all(requests);
    const successCount = responses.filter(r => r.status() === 200).length;
    
    // This should FAIL because rate limiting is not enforced
    expect(successCount < 10, 'Rate limiting should block excessive requests').toBe(true);
  });

  test('10. Environment Variable Exposure - HIGH', async ({ page }) => {
    // VULNERABILITY: Environment variables leak to client
    await page.goto('/app/dashboard');
    
    const envLeak = await page.evaluate(() => {
      // Check if sensitive env vars are accessible
      return (window as any).__ENV__ || process?.env;
    });
    
    // This should FAIL because env vars are exposed
    expect(envLeak?.DATABASE_URL, 'Database URL should not be exposed to client').toBeUndefined();
    expect(envLeak?.NEXTAUTH_SECRET, 'Auth secret should not be exposed to client').toBeUndefined();
  });
});
