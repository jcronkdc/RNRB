/**
 * Test to demonstrate the ACTUAL URL encoding issue with + signs
 *
 * The problem occurs when the URL string itself is parsed by the browser,
 * not when using the URL API.
 */

console.log('='.repeat(80));
console.log('URL ENCODING TEST - The ACTUAL Problem');
console.log('='.repeat(80));

const testEmail = 'user+test@example.com';
console.log('\n📧 Test Email:', testEmail);

// Simulate the redirect flow
const redirectParam = encodeURIComponent('/invites/project?email=user%2Btest%40example.com');
console.log('\n1️⃣  Initial redirect param (double-encoded):', redirectParam);

// Simulate what profile page receives
const receivedRedirect = decodeURIComponent(redirectParam);
console.log('\n2️⃣  After decodeURIComponent:', receivedRedirect);

// OLD APPROACH (BROKEN)
console.log('\n❌ OLD APPROACH (using URLSearchParams):');
console.log('-'.repeat(80));

const [pathAndQuery1, hash1 = ''] = receivedRedirect.split('#');
const [pathname1, queryString1 = ''] = pathAndQuery1.split('?');

const oldParams = new URLSearchParams();
queryString1.split('&').forEach((pair) => {
  const [key, value = ''] = pair.split('=');
  if (key) {
    const decodedValue = decodeURIComponent(value);
    oldParams.set(key, decodedValue);
  }
});

const oldQueryString = oldParams.toString();
const oldFinalUrl = `${pathname1}?${oldQueryString}`;
console.log('   - Final URL string:', oldFinalUrl);

// Parse as browser would
const oldParsedByBrowser = new URL(`http://example.com${oldFinalUrl}`);
const oldEmailFromBrowser = oldParsedByBrowser.searchParams.get('email');
console.log('   - Browser parses email as:', oldEmailFromBrowser);
console.log('   - Match original?', oldEmailFromBrowser === testEmail ? '✅' : '❌');

// NEW APPROACH (FIXED)
console.log('\n✅ NEW APPROACH (manual encoding):');
console.log('-'.repeat(80));

const [pathAndQuery2, hash2 = ''] = receivedRedirect.split('#');
const [pathname2, queryString2 = ''] = pathAndQuery2.split('?');

const encodedPairs = [];
queryString2.split('&').forEach((pair) => {
  const [key, value = ''] = pair.split('=');
  if (key) {
    const decodedValue = decodeURIComponent(value);
    const encodedKey = encodeURIComponent(key);
    const encodedValue = encodeURIComponent(decodedValue);
    encodedPairs.push(`${encodedKey}=${encodedValue}`);
  }
});

const newQueryString = encodedPairs.join('&');
const newFinalUrl = `${pathname2}?${newQueryString}`;
console.log('   - Final URL string:', newFinalUrl);

// Parse as browser would
const newParsedByBrowser = new URL(`http://example.com${newFinalUrl}`);
const newEmailFromBrowser = newParsedByBrowser.searchParams.get('email');
console.log('   - Browser parses email as:', newEmailFromBrowser);
console.log('   - Match original?', newEmailFromBrowser === testEmail ? '✅' : '❌');

// THE REAL ISSUE: When URL string contains literal +
console.log('\n🔍 THE REAL ISSUE:');
console.log('-'.repeat(80));
console.log('When URLSearchParams.toString() outputs a query string, it does NOT');
console.log('encode + characters. When this string is then parsed by the browser,');
console.log('the + is interpreted as a space.');
console.log('');
console.log('Example:');

// Create a param with + in it
const testParams = new URLSearchParams();
testParams.set('email', 'user+test@example.com');
const outputString = testParams.toString();
console.log(`   URLSearchParams.toString() output: "${outputString}"`);

// Now parse this string as a browser would
const parsedBack = new URL(`http://example.com?${outputString}`);
const emailBack = parsedBack.searchParams.get('email');
console.log(`   Browser parses it back as: "${emailBack}"`);
console.log(`   Problem: The + became a space! ${emailBack.includes(' ') ? '❌' : '✅'}`);

console.log('\n📊 FINAL COMPARISON:');
console.log('-'.repeat(80));
console.log(`   Original email:     ${testEmail}`);
console.log(
  `   Old approach:       ${oldEmailFromBrowser} ${oldEmailFromBrowser === testEmail ? '✅' : '❌'}`
);
console.log(
  `   New approach:       ${newEmailFromBrowser} ${newEmailFromBrowser === testEmail ? '✅' : '❌'}`
);

console.log('\n' + '='.repeat(80));
console.log('TEST COMPLETE');
console.log('='.repeat(80));
