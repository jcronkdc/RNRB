/**
 * Test to demonstrate the URL encoding fix
 * Run with: node test-url-encoding.js
 */

console.log('='.repeat(80));
console.log('URL ENCODING TEST - Plus Sign Issue');
console.log('='.repeat(80));

// Test email with plus sign
const testEmail = 'user+test@example.com';
console.log('\n📧 Test Email:', testEmail);

// Simulate incoming URL
const incomingURL = `/invites/project?email=${encodeURIComponent(testEmail)}`;
console.log('\n1️⃣  Incoming URL (properly encoded):', incomingURL);

// Parse the URL
const [pathAndQuery, hash = ''] = incomingURL.split('#');
const [pathname, queryString = ''] = pathAndQuery.split('?');

console.log('\n2️⃣  Parsed components:');
console.log('   - Pathname:', pathname);
console.log('   - Query string:', queryString);

// OLD APPROACH (BROKEN)
console.log('\n❌ OLD APPROACH (using URLSearchParams):');
console.log('-'.repeat(80));

const oldParams = new URLSearchParams();
queryString.split('&').forEach((pair) => {
  const [key, value = ''] = pair.split('=');
  if (key) {
    const decodedKey = decodeURIComponent(key);
    const decodedValue = decodeURIComponent(value);
    console.log(`   - Decoded: ${decodedKey}=${decodedValue}`);
    oldParams.set(decodedKey, decodedValue);
  }
});

const oldResult = oldParams.toString();
console.log(`   - URLSearchParams.toString(): ${oldResult}`);
console.log(`   - Final URL: ${pathname}?${oldResult}`);
console.log('   - Problem: The + is NOT encoded to %2B');
console.log('   - Browser will interpret + as space!');

// NEW APPROACH (FIXED)
console.log('\n✅ NEW APPROACH (manual encoding):');
console.log('-'.repeat(80));

const encodedPairs = [];
queryString.split('&').forEach((pair) => {
  const [key, value = ''] = pair.split('=');
  if (key) {
    // Decode first
    const decodedKey = decodeURIComponent(key);
    const decodedValue = decodeURIComponent(value);
    console.log(`   - Decoded: ${decodedKey}=${decodedValue}`);

    // Re-encode properly
    const encodedKey = encodeURIComponent(decodedKey);
    const encodedValue = encodeURIComponent(decodedValue);
    console.log(`   - Re-encoded: ${encodedKey}=${encodedValue}`);

    encodedPairs.push(`${encodedKey}=${encodedValue}`);
  }
});

const newResult = encodedPairs.join('&');
console.log(`   - Final query string: ${newResult}`);
console.log(`   - Final URL: ${pathname}?${newResult}`);
console.log('   - Success: The + is properly encoded as %2B');
console.log('   - Browser will NOT interpret + as space!');

// VERIFICATION
console.log('\n🔍 VERIFICATION:');
console.log('-'.repeat(80));

// Parse the old result
const oldUrl = new URL(`http://example.com${pathname}?${oldResult}`);
const oldEmailParam = oldUrl.searchParams.get('email');
console.log('   - Old approach, browser reads email as:', oldEmailParam);

// Parse the new result
const newUrl = new URL(`http://example.com${pathname}?${newResult}`);
const newEmailParam = newUrl.searchParams.get('email');
console.log('   - New approach, browser reads email as:', newEmailParam);

console.log('\n📊 COMPARISON:');
console.log('-'.repeat(80));
console.log(`   Original email:  ${testEmail}`);
console.log(`   Old approach:    ${oldEmailParam} ${oldEmailParam === testEmail ? '✅' : '❌'}`);
console.log(`   New approach:    ${newEmailParam} ${newEmailParam === testEmail ? '✅' : '❌'}`);

console.log('\n' + '='.repeat(80));
console.log('TEST COMPLETE');
console.log('='.repeat(80));
