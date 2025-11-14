#!/usr/bin/env tsx

// 🍄 Environment Variable Health Check 🍄
// This script checks if all required environment variables are set

const required = {
  'NEXTAUTH_SECRET': '🔴 CRITICAL - Authentication will not work without this!',
  'NEXTAUTH_URL': '🟡 Required for production',
  'DATABASE_URL': '🔴 CRITICAL - Database connection required'
};

const optional = {
  'EMAIL_SERVER_URL': 'Magic link login',
  'EMAIL_FROM': 'Email sender address',
  'GOOGLE_CLIENT_ID': 'Google OAuth',
  'GOOGLE_CLIENT_SECRET': 'Google OAuth',
  'APPLE_CLIENT_ID': 'Apple OAuth', 
  'APPLE_CLIENT_SECRET': 'Apple OAuth'
};

console.log('🍄 CronkWaters Environment Health Check 🍄\n');

console.log('Required Environment Variables:');
console.log('==============================');
let hasErrors = false;

for (const [key, description] of Object.entries(required)) {
  const value = process.env[key];
  if (value) {
    console.log(`✅ ${key}: Set`);
  } else {
    console.log(`❌ ${key}: MISSING - ${description}`);
    hasErrors = true;
  }
}

console.log('\nOptional Environment Variables:');
console.log('==============================');

for (const [key, description] of Object.entries(optional)) {
  const value = process.env[key];
  if (value) {
    console.log(`✅ ${key}: Set (${description})`);
  } else {
    console.log(`⚪ ${key}: Not set (${description})`);
  }
}

if (hasErrors) {
  console.log('\n❌ Critical environment variables are missing!');
  console.log('Authentication and core features will not work.');
  console.log('\nRun ./scripts/generate-auth-secret.sh to generate NEXTAUTH_SECRET');
  process.exit(1);
} else {
  console.log('\n✅ All required environment variables are set!');
  console.log('The mycelial network has the nutrients it needs.');
}
