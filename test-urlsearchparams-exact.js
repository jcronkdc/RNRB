/**
 * Test to demonstrate the EXACT scenario the user is describing
 * 
 * Testing whether URLSearchParams.set() encodes literal + characters
 */

console.log('='.repeat(80));
console.log('URLSearchParams Encoding Behavior Test');
console.log('='.repeat(80));

// Test 1: Setting a value with a literal + character
console.log('\n📝 Test 1: Setting value with literal + character');
console.log('-'.repeat(80));

const params1 = new URLSearchParams();
const valueWithPlus = 'user+test@example.com'; // Literal + character
console.log('Input value:', valueWithPlus);
params1.set('email', valueWithPlus);
const result1 = params1.toString();
console.log('URLSearchParams.toString():', result1);
console.log('Does it contain literal +?', result1.includes('email=user+test') ? 'YES ❌' : 'NO ✅');
console.log('Does it contain %2B?', result1.includes('%2B') ? 'YES ✅' : 'NO ❌');

// Test 2: Starting with already-encoded value (%2B)
console.log('\n📝 Test 2: Starting with already-encoded value');
console.log('-'.repeat(80));

const encodedInput = 'user%2Btest%40example.com'; // Already encoded
console.log('Input (already encoded):', encodedInput);

// Decode it first
const decodedInput = decodeURIComponent(encodedInput);
console.log('After decodeURIComponent:', decodedInput); // Now has literal +

// Put it in URLSearchParams
const params2 = new URLSearchParams();
params2.set('email', decodedInput);
const result2 = params2.toString();
console.log('URLSearchParams.toString():', result2);
console.log('Does it contain literal +?', result2.includes('email=user+test') ? 'YES ❌' : 'NO ✅');
console.log('Does it contain %2B?', result2.includes('%2B') ? 'YES ✅' : 'NO ❌');

// Test 3: Using URLSearchParams constructor vs set()
console.log('\n📝 Test 3: Constructor vs set() method');
console.log('-'.repeat(80));

// Via constructor with query string containing literal +
const queryStringWithPlus = 'email=user+test@example.com';
console.log('Query string input:', queryStringWithPlus);
const params3 = new URLSearchParams(queryStringWithPlus);
const result3 = params3.toString();
console.log('URLSearchParams.toString():', result3);
console.log('What did it interpret + as?');
const parsed3 = params3.get('email');
console.log('  Parsed value:', parsed3);
console.log('  Did + become space?', parsed3.includes(' ') ? 'YES (+ treated as space) ❌' : 'NO ✅');

// Test 4: Manual encoding vs URLSearchParams
console.log('\n📝 Test 4: Manual encodeURIComponent vs URLSearchParams');
console.log('-'.repeat(80));

const testValue = 'user+test@example.com';
console.log('Test value:', testValue);

const manualEncoded = `email=${encodeURIComponent(testValue)}`;
console.log('Manual encoding:', manualEncoded);

const params4 = new URLSearchParams();
params4.set('email', testValue);
const urlSearchParamsEncoded = params4.toString();
console.log('URLSearchParams:', urlSearchParamsEncoded);

console.log('\nAre they the same?', manualEncoded === urlSearchParamsEncoded ? 'YES ✅' : 'NO ❌');

// Test 5: The ACTUAL problem - when query string is constructed from decoded values
console.log('\n📝 Test 5: The ACTUAL workflow that causes the problem');
console.log('-'.repeat(80));

// Step 1: URL comes in with encoded + (%2B)
const incomingQS = 'email=user%2Btest%40example.com';
console.log('1. Incoming query string:', incomingQS);

// Step 2: Parse it (this decodes %2B to +)
const params5 = new URLSearchParams(incomingQS);
const emailValue = params5.get('email');
console.log('2. Parsed email value:', emailValue);

// Step 3: Try to reconstruct (OLD way - using URLSearchParams)
const params5Rebuild = new URLSearchParams();
params5Rebuild.set('email', emailValue);
const rebuiltQS = params5Rebuild.toString();
console.log('3. Rebuilt query string:', rebuiltQS);
console.log('   Is + encoded as %2B?', rebuiltQS.includes('%2B') ? 'YES ✅' : 'NO ❌');

// Step 4: Try to reconstruct (NEW way - manual encoding)
const manualRebuild = `email=${encodeURIComponent(emailValue)}`;
console.log('4. Manual rebuild:', manualRebuild);
console.log('   Is + encoded as %2B?', manualRebuild.includes('%2B') ? 'YES ✅' : 'NO ❌');

console.log('\n' + '='.repeat(80));
console.log('CONCLUSION');
console.log('='.repeat(80));
console.log('URLSearchParams.set() DOES encode + to %2B');
console.log('The issue might be with how we\'re using it in the code.');
console.log('='.repeat(80));

