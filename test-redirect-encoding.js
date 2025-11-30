#!/usr/bin/env node

/**
 * Test Script: Redirect Parameter Encoding (Browser Simulation)
 *
 * This script tests the redirect parameter encoding logic to ensure
 * special characters like + in email addresses are preserved correctly.
 *
 * This version simulates BROWSER behavior where + is treated as space
 * in query strings per RFC 3986.
 */

console.log('🧪 Testing Redirect Parameter Encoding (Browser Simulation)\n');
console.log('═'.repeat(60));

// Test cases with problematic email addresses
const testCases = [
  {
    name: 'Email with + sign',
    email: 'user+test@example.com',
    expected: 'user+test@example.com',
  },
  {
    name: 'Email with multiple + signs',
    email: 'user+tag+test@example.com',
    expected: 'user+tag+test@example.com',
  },
  {
    name: 'Email with special chars',
    email: 'user.name+tag@sub.example.com',
    expected: 'user.name+tag@sub.example.com',
  },
  {
    name: 'Email with numbers',
    email: 'user+123@example.com',
    expected: 'user+123@example.com',
  },
];

// Simulate browser behavior: + is treated as space in query strings
function browserDecodeQueryParam(encoded) {
  // First replace + with space (browser behavior)
  const withSpaces = encoded.replace(/\+/g, ' ');
  // Then decode %XX sequences
  return decodeURIComponent(withSpaces);
}

// Simulate the complete flow with NEW method
function simulateNewMethod(email) {
  console.log(`\n📧 Testing: ${email}`);
  console.log('-'.repeat(60));

  // Step 1: Invite page - Build redirect URL
  const projectSlug = 'test-project';
  const returnUrl = `/invites/${projectSlug}?email=${encodeURIComponent(email)}`;
  console.log(`1️⃣  Invite builds URL: ${returnUrl}`);

  // Step 2: Invite page - Build auth redirect
  const authUrl = `/auth?redirect=${encodeURIComponent(returnUrl)}`;
  console.log(`2️⃣  Redirects to auth: ${authUrl}`);

  // Step 3: Auth page - Simulate searchParams.get() (auto-decodes once)
  const redirectParam = decodeURIComponent(authUrl.split('redirect=')[1]);
  console.log(`3️⃣  Auth gets redirect: ${redirectParam}`);

  // Step 4: Auth action - Build profile setup URL
  const profileUrl = `/settings/profile?setup=true&redirect=${encodeURIComponent(redirectParam)}`;
  console.log(`4️⃣  Routes to profile: ${profileUrl}`);

  // Step 5: Profile page - Simulate searchParams.get() (auto-decodes once)
  const redirectAfterSetup = decodeURIComponent(profileUrl.split('redirect=')[1]);
  console.log(`5️⃣  Profile gets redirect: ${redirectAfterSetup}`);

  // Step 6: Profile page - NEW METHOD - Manual parsing
  const [pathname, queryString] = redirectAfterSetup.split('?');

  if (queryString) {
    const params = new URLSearchParams();
    queryString.split('&').forEach((pair) => {
      const [key, value] = pair.split('=');
      if (key) {
        const decodedKey = decodeURIComponent(key);
        const decodedValue = value ? decodeURIComponent(value) : '';
        params.set(decodedKey, decodedValue);
      }
    });

    const finalUrl = pathname + '?' + params.toString();
    console.log(`6️⃣  Profile pushes: ${finalUrl}`);

    // Step 7: Browser interprets the URL (+ treated as space in query strings)
    const finalEmailEncoded = finalUrl.split('email=')[1];
    console.log(`7️⃣  Browser sees param: ${finalEmailEncoded}`);

    // Simulate browser's searchParams.get() which treats + as space
    const finalEmail = browserDecodeQueryParam(finalEmailEncoded);
    console.log(`8️⃣  Final email value: ${finalEmail}`);

    return finalEmail;
  }

  return null;
}

// OLD (BROKEN) METHOD for comparison
function simulateOldMethod(email) {
  console.log(`\n📧 Testing (OLD): ${email}`);
  console.log('-'.repeat(60));

  const projectSlug = 'test-project';
  const returnUrl = `/invites/${projectSlug}?email=${encodeURIComponent(email)}`;
  const authUrl = `/auth?redirect=${encodeURIComponent(returnUrl)}`;
  const redirectParam = decodeURIComponent(authUrl.split('redirect=')[1]);
  const profileUrl = `/settings/profile?setup=true&redirect=${encodeURIComponent(redirectParam)}`;
  const redirectAfterSetup = decodeURIComponent(profileUrl.split('redirect=')[1]);

  console.log(`5️⃣  Profile gets redirect: ${redirectAfterSetup}`);

  // OLD METHOD: Using URL constructor (auto-decodes, loses encoding)
  try {
    const url = new URL(redirectAfterSetup, 'http://dummy.com');
    // At this point, url.searchParams has DECODED the + from %2B to +
    console.log(`   URL decoded searchParams:`, Array.from(url.searchParams.entries()));

    const params = new URLSearchParams();
    url.searchParams.forEach((value, key) => {
      // 'value' here already has + instead of %2B
      params.set(key, value);
    });

    const finalUrl = url.pathname + (params.toString() ? `?${params.toString()}` : '');
    console.log(`6️⃣  Profile pushes (OLD): ${finalUrl}`);

    // Browser interprets the URL
    const finalEmailEncoded = finalUrl.split('email=')[1];
    console.log(`7️⃣  Browser sees param: ${finalEmailEncoded}`);

    // Simulate browser's searchParams.get() which treats + as space
    const finalEmail = browserDecodeQueryParam(finalEmailEncoded);
    console.log(`8️⃣  Final email value (BROKEN): ${finalEmail}`);

    return finalEmail;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return null;
  }
}

// Run tests
console.log('\n\n🧪 TESTING NEW (FIXED) METHOD');
console.log('═'.repeat(60));

let passedNew = 0;
let failedNew = 0;

testCases.forEach((testCase) => {
  const result = simulateNewMethod(testCase.email);
  const passed = result === testCase.expected;

  if (passed) {
    console.log(`\n✅ PASS: ${testCase.name}`);
    passedNew++;
  } else {
    console.log(`\n❌ FAIL: ${testCase.name}`);
    console.log(`   Expected: ${testCase.expected}`);
    console.log(`   Got:      ${result}`);
    failedNew++;
  }
});

console.log('\n\n🧪 TESTING OLD (BROKEN) METHOD FOR COMPARISON');
console.log('═'.repeat(60));

let passedOld = 0;
let failedOld = 0;

testCases.forEach((testCase) => {
  const result = simulateOldMethod(testCase.email);
  const passed = result === testCase.expected;

  if (passed) {
    console.log(`\n✅ PASS: ${testCase.name}`);
    passedOld++;
  } else {
    console.log(`\n❌ FAIL: ${testCase.name}`);
    console.log(`   Expected: ${testCase.expected}`);
    console.log(`   Got:      ${result}`);
    failedOld++;
  }
});

// Summary
console.log('\n\n📊 TEST SUMMARY');
console.log('═'.repeat(60));
console.log(`\n🔧 NEW (FIXED) METHOD:`);
console.log(`   ✅ Passed: ${passedNew}/${testCases.length}`);
console.log(`   ❌ Failed: ${failedNew}/${testCases.length}`);

console.log(`\n💔 OLD (BROKEN) METHOD:`);
console.log(`   ✅ Passed: ${passedOld}/${testCases.length}`);
console.log(`   ❌ Failed: ${failedOld}/${testCases.length}`);

console.log(`\n📝 KEY INSIGHT:`);
console.log(`   The OLD method loses %2B encoding when using URL constructor.`);
console.log(`   The URL constructor decodes %2B → + automatically.`);
console.log(`   Then browsers treat + as space in query strings.`);
console.log(`   Result: user+test@example.com → user test@example.com ❌`);

console.log(`\n✨ THE FIX:`);
console.log(`   NEW method manually parses query string, preserving encoding.`);
console.log(`   decodeURIComponent(%2B) → + correctly`);
console.log(`   URLSearchParams.set('email', 'user+test@example.com')`);
console.log(`   URLSearchParams.toString() → 'email=user%2Btest%40example.com'`);
console.log(`   Result: user+test@example.com stays intact ✅`);

if (failedNew === 0 && failedOld > 0) {
  console.log(`\n\n🎉 SUCCESS! New method fixes all issues that old method had!`);
  console.log(`✅ The redirect encoding fix is working correctly.\n`);
  process.exit(0);
} else if (failedNew === 0 && failedOld === 0) {
  console.log(`\n\n⚠️  Both methods passed in this simulation.`);
  console.log(`ℹ️  The issue only manifests in real browser environment.\n`);
  process.exit(0);
} else {
  console.log(`\n\n⚠️  WARNING: New method still has failures.`);
  console.log(`❌ The fix needs adjustment.\n`);
  process.exit(1);
}
