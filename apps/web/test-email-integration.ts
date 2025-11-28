/**
 * Automated Email Integration Test Suite
 * Tests all email endpoints and functionality
 *
 * Run with: pnpm tsx test-email-integration.ts
 *
 * Make sure to set environment variables:
 * - RESEND_API_KEY or EMAIL_SERVER_URL
 * - TEST_EMAIL (optional, defaults to justincronk@pm.me)
 * - TEST_BASE_URL (optional, defaults to http://localhost:3000)
 */

// Load environment variables from .env.local
import { config } from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: resolve(__dirname, '.env.local') });

import { sendEmail, emailTemplates } from './lib/email';

// Test configuration
const TEST_EMAIL = process.env.TEST_EMAIL || 'justincronk@pm.me'; // Use verified email for Resend test mode
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  details?: any;
}

const results: TestResult[] = [];

function logTest(name: string, passed: boolean, error?: string, details?: any) {
  results.push({ name, passed, error, details });
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} ${name}`);
  if (error) console.log(`   Error: ${error}`);
  if (details) console.log(`   Details:`, JSON.stringify(details, null, 2));
}

async function testEmailService() {
  console.log('\n🧪 Testing Email Service Directly...\n');

  // Test 1: Check if Resend is configured
  console.log('Test 1: Resend Configuration Check');
  const hasResend = process.env.RESEND_API_KEY || process.env.EMAIL_SERVER_URL;
  logTest(
    'Resend API key configured',
    !!hasResend,
    hasResend ? undefined : 'No RESEND_API_KEY or EMAIL_SERVER_URL found'
  );

  // Test 2: Send simple test email
  console.log('\nTest 2: Send Simple Test Email');
  try {
    const result = await sendEmail({
      to: TEST_EMAIL,
      subject: 'Automated Test - Simple Email',
      html: '<h1>Test Email</h1><p>This is a test email from the automated test suite.</p>',
      text: 'Test Email - This is a test email from the automated test suite.',
    });
    logTest('Simple email sent', result.success, result.error, { messageId: result.messageId });
  } catch (error) {
    logTest('Simple email sent', false, error instanceof Error ? error.message : 'Unknown error');
  }

  // Test 3: Test project invite template
  console.log('\nTest 3: Project Invite Template');
  try {
    const emailOptions = emailTemplates.projectInvite({
      inviteEmail: TEST_EMAIL,
      projectName: 'Test Project - Automated Testing',
      inviterName: 'Test User',
      inviterEmail: 'test@cronkwaters.com',
      inviteLink: `${BASE_URL}/invites/test-project?email=${encodeURIComponent(TEST_EMAIL)}`,
    });
    const result = await sendEmail(emailOptions);
    logTest('Project invite email sent', result.success, result.error, {
      messageId: result.messageId,
    });
  } catch (error) {
    logTest(
      'Project invite email sent',
      false,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }

  // Test 4: Test split sheet template
  console.log('\nTest 4: Split Sheet Template');
  try {
    const fakePdfData = Buffer.from('fake pdf content').toString('base64');
    const emailOptions = emailTemplates.splitSheet({
      recipientEmail: TEST_EMAIL,
      recipientName: 'Test Recipient',
      songTitle: 'Test Song',
      percentage: 25.5,
      pdfData: fakePdfData,
    });
    const result = await sendEmail(emailOptions);
    logTest('Split sheet email sent', result.success, result.error, {
      messageId: result.messageId,
    });
  } catch (error) {
    logTest(
      'Split sheet email sent',
      false,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }

  // Test 5: Test booking request template
  console.log('\nTest 5: Booking Request Template');
  try {
    const emailOptions = emailTemplates.bookingRequest({
      musicianEmail: TEST_EMAIL,
      musicianName: 'Test Musician',
      venueName: 'Test Venue',
      contactName: 'Test Contact',
      contactEmail: 'contact@example.com',
      contactPhone: '555-1234',
      eventDate: '2025-12-15',
      eventType: 'Concert',
      location: 'Test City, ST',
      budget: '$500',
      message: 'Test booking request message',
      siteUrl: `${BASE_URL}/sites/test`,
    });
    const result = await sendEmail(emailOptions);
    logTest('Booking request email sent', result.success, result.error, {
      messageId: result.messageId,
    });
  } catch (error) {
    logTest(
      'Booking request email sent',
      false,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }

  // Test 6: Test payment success template
  console.log('\nTest 6: Payment Success Template');
  try {
    const emailOptions = emailTemplates.paymentSuccess({
      email: TEST_EMAIL,
      userName: 'Test User',
      amount: '29.99',
      subscriptionTier: 'creator',
      nextBillingDate: '2025-12-15',
    });
    const result = await sendEmail(emailOptions);
    logTest('Payment success email sent', result.success, result.error, {
      messageId: result.messageId,
    });
  } catch (error) {
    logTest(
      'Payment success email sent',
      false,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }

  // Test 7: Test payment failed template
  console.log('\nTest 7: Payment Failed Template');
  try {
    const emailOptions = emailTemplates.paymentFailed({
      email: TEST_EMAIL,
      userName: 'Test User',
      amount: '29.99',
      subscriptionTier: 'creator',
      retryDate: '2025-12-10',
    });
    const result = await sendEmail(emailOptions);
    logTest('Payment failed email sent', result.success, result.error, {
      messageId: result.messageId,
    });
  } catch (error) {
    logTest(
      'Payment failed email sent',
      false,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }

  // Test 8: Test trial ending template
  console.log('\nTest 8: Trial Ending Template');
  try {
    const emailOptions = emailTemplates.trialEnding({
      email: TEST_EMAIL,
      userName: 'Test User',
      trialEndDate: '2025-12-10',
      subscriptionTier: 'creator',
    });
    const result = await sendEmail(emailOptions);
    logTest('Trial ending email sent', result.success, result.error, {
      messageId: result.messageId,
    });
  } catch (error) {
    logTest(
      'Trial ending email sent',
      false,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }

  // Test 9: Test invitation template
  console.log('\nTest 9: General Invitation Template');
  try {
    const emailOptions = emailTemplates.invitation({
      email: TEST_EMAIL,
      inviterName: 'Test Inviter',
      inviteUrl: `${BASE_URL}/invite/test-token`,
      projectName: 'Test Project',
    });
    const result = await sendEmail(emailOptions);
    logTest('Invitation email sent', result.success, result.error, { messageId: result.messageId });
  } catch (error) {
    logTest(
      'Invitation email sent',
      false,
      error instanceof Error ? error.message : 'Unknown error'
    );
  }

  // Test 10: Test error handling (invalid email)
  console.log('\nTest 10: Error Handling - Invalid Email');
  try {
    const result = await sendEmail({
      to: 'invalid-email',
      subject: 'Test',
      html: '<p>Test</p>',
    });
    // This should fail
    logTest(
      'Invalid email rejected',
      !result.success,
      result.success ? 'Should have failed' : undefined
    );
  } catch (error) {
    logTest('Invalid email rejected', true);
  }
}

async function testApiEndpoints() {
  console.log('\n\n🌐 Testing API Endpoints...\n');

  // Test 1: Test email endpoint
  console.log('Test 1: GET /api/test-email');
  try {
    const response = await fetch(
      `${BASE_URL}/api/test-email?email=${encodeURIComponent(TEST_EMAIL)}`
    );

    // Check if server is running
    if (response.status === 0 || response.status >= 500) {
      logTest(
        'Test email endpoint',
        false,
        `Server not running or unreachable at ${BASE_URL}. Start dev server with: pnpm dev`
      );
      console.log('\n⚠️  Note: Dev server must be running to test API endpoints.');
      console.log('   Start it with: pnpm dev');
      return;
    }

    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      const data = await response.json();
      logTest('Test email endpoint', response.ok && data.success, data.error || data.note, data);
    } else {
      const text = await response.text();
      logTest(
        'Test email endpoint',
        false,
        `Expected JSON but got ${contentType}. Response: ${text.substring(0, 100)}`
      );
    }
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      logTest(
        'Test email endpoint',
        false,
        `Cannot connect to ${BASE_URL}. Is the dev server running?`
      );
      console.log('\n⚠️  Note: Dev server must be running to test API endpoints.');
      console.log('   Start it with: pnpm dev');
    } else {
      logTest(
        'Test email endpoint',
        false,
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  // Note: Other endpoints require authentication
  console.log('\n⚠️  Note: Other endpoints require authentication.');
  console.log('   To test them fully, you need to:');
  console.log('   1. Sign in to get a session token');
  console.log('   2. Use authenticated requests');
  console.log('   3. Or test manually through the UI');
}

async function runAllTests() {
  console.log('🚀 Starting Email Integration Test Suite');
  console.log(`📧 Test Email: ${TEST_EMAIL}`);
  console.log(`🌐 Base URL: ${BASE_URL}\n`);

  await testEmailService();
  await testApiEndpoints();

  // Summary
  console.log('\n\n📊 Test Summary\n');
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const total = results.length;

  console.log(`Total Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%\n`);

  if (failed > 0) {
    console.log('Failed Tests:');
    results
      .filter((r) => !r.passed)
      .forEach((r) => {
        console.log(`  ❌ ${r.name}: ${r.error || 'Unknown error'}`);
      });
  }

  // Exit with error code if any tests failed
  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch((error) => {
  console.error('Test suite error:', error);
  process.exit(1);
});
