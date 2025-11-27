/**
 * Test the EXACT scenario from the code
 * Simulating what happens in profile page redirect handling
 */

console.log('='.repeat(80));
console.log('EXACT Code Scenario Test');
console.log('='.repeat(80));

// Scenario: User comes from invite link
// /auth?redirect=%2Finvites%2Fproject%3Femail%3Duser%252Btest%2540example.com

// Step 1: Auth page decodes redirect param
const redirectParam = '/invites/project?email=user%2Btest%40example.com';
console.log('\n1️⃣  Redirect param received by profile page:', redirectParam);

// Step 2: Profile page processes this (OLD WAY)
console.log('\n❌ OLD WAY (using URLSearchParams):');
console.log('-'.repeat(80));

const [pathAndQuery, hash = ''] = redirectParam.split('#');
const [pathname, queryString = ''] = pathAndQuery.split('?');

console.log('   Pathname:', pathname);
console.log('   Query string:', queryString);

// OLD CODE: Using URLSearchParams
const newParams = new URLSearchParams();
queryString.split('&').forEach(pair => {
  const [key, value = ''] = pair.split('=');
  if (key) {
    const decodedKey = decodeURIComponent(key);
    const decodedValue = decodeURIComponent(value);
    console.log(`   Decoded: ${decodedKey}=${decodedValue}`);
    newParams.set(decodedKey, decodedValue);
  }
});

const oldResult = newParams.toString();
console.log('   URLSearchParams.toString():', oldResult);
console.log('   Final URL:', `${pathname}?${oldResult}`);

// Parse and verify
const oldUrl = new URL(`http://example.com${pathname}?${oldResult}`);
const oldEmail = oldUrl.searchParams.get('email');
console.log('   Browser reads email as:', oldEmail);

// Step 3: Profile page processes this (NEW WAY)
console.log('\n✅ NEW WAY (manual encoding):');
console.log('-'.repeat(80));

const encodedPairs = [];
queryString.split('&').forEach(pair => {
  const [key, value = ''] = pair.split('=');
  if (key) {
    const decodedKey = decodeURIComponent(key);
    const decodedValue = decodeURIComponent(value);
    console.log(`   Decoded: ${decodedKey}=${decodedValue}`);
    const encodedKey = encodeURIComponent(decodedKey);
    const encodedValue = encodeURIComponent(decodedValue);
    encodedPairs.push(`${encodedKey}=${encodedValue}`);
  }
});

const newResult = encodedPairs.join('&');
console.log('   Manual encoding result:', newResult);
console.log('   Final URL:', `${pathname}?${newResult}`);

// Parse and verify
const newUrl = new URL(`http://example.com${pathname}?${newResult}`);
const newEmail = newUrl.searchParams.get('email');
console.log('   Browser reads email as:', newEmail);

// EDGE CASE: What if queryString had literal + (not %2B)?
console.log('\n🔍 EDGE CASE: Query string with literal + (corrupted)');
console.log('-'.repeat(80));

const corruptedQueryString = 'email=user+test@example.com'; // Literal + instead of %2B
console.log('   Corrupted input:', corruptedQueryString);

// OLD WAY with corrupted input
const corruptedParams = new URLSearchParams();
corruptedQueryString.split('&').forEach(pair => {
  const [key, value = ''] = pair.split('=');
  if (key) {
    const decodedValue = decodeURIComponent(value); // + stays as +
    console.log(`   Decoded value: "${decodedValue}"`);
    corruptedParams.set(key, decodedValue);
  }
});

const corruptedOldResult = corruptedParams.toString();
console.log('   OLD way result:', corruptedOldResult);
const corruptedOldUrl = new URL(`http://example.com?${corruptedOldResult}`);
console.log('   Browser reads:', corruptedOldUrl.searchParams.get('email'));

// NEW WAY with corrupted input
const corruptedEncodedPairs = [];
corruptedQueryString.split('&').forEach(pair => {
  const [key, value = ''] = pair.split('=');
  if (key) {
    const decodedValue = decodeURIComponent(value); // + stays as +
    const encodedValue = encodeURIComponent(decodedValue); // + becomes %2B
    corruptedEncodedPairs.push(`${key}=${encodedValue}`);
  }
});

const corruptedNewResult = corruptedEncodedPairs.join('&');
console.log('   NEW way result:', corruptedNewResult);
const corruptedNewUrl = new URL(`http://example.com?${corruptedNewResult}`);
console.log('   Browser reads:', corruptedNewUrl.searchParams.get('email'));

console.log('\n' + '='.repeat(80));
console.log('CONCLUSION');
console.log('='.repeat(80));
console.log('Both approaches work when queryString is properly encoded.');
console.log('But the NEW approach is safer and more explicit.');
console.log('It ensures proper encoding even if input is malformed.');
console.log('='.repeat(80));

