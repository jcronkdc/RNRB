#!/usr/bin/env node
/**
 * Reset Stalwart Email Password
 * 
 * Usage:
 *   node scripts/reset-email-password.mjs <stalwart-admin-password> <new-email-password>
 * 
 * Example:
 *   node scripts/reset-email-password.mjs "your-stalwart-admin-pass" "NewPassword123!"
 * 
 * This resets the password for justin@rnrb.me on the Stalwart mail server.
 */

const STALWART_API_URL = 'https://mail.rnrb.me:443';
const STALWART_ADMIN_USER = 'admin';
const EMAIL_TO_RESET = 'justin@rnrb.me';

async function resetPassword(adminPassword, newPassword) {
  const username = EMAIL_TO_RESET.split('@')[0]; // "justin"
  
  console.log(`\n🔐 Resetting password for ${EMAIL_TO_RESET}...`);
  console.log(`   Username: ${username}`);
  console.log(`   Server: ${STALWART_API_URL}`);
  
  const auth = Buffer.from(`${STALWART_ADMIN_USER}:${adminPassword}`).toString('base64');
  
  try {
    const response = await fetch(`${STALWART_API_URL}/api/principal/${username}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secrets: [newPassword],
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`\n❌ Failed to reset password`);
      console.error(`   Status: ${response.status}`);
      console.error(`   Error: ${errorText}`);
      process.exit(1);
    }
    
    console.log(`\n✅ Password reset successful!`);
    console.log(`\n📧 You can now log into webmail.rnrb.me with:`);
    console.log(`   Email: ${EMAIL_TO_RESET}`);
    console.log(`   Password: ${newPassword}`);
    console.log('');
    
  } catch (error) {
    console.error(`\n❌ Connection error:`, error.message);
    process.exit(1);
  }
}

// Get arguments
const args = process.argv.slice(2);

if (args.length < 2) {
  console.log(`
Usage: node scripts/reset-email-password.mjs <stalwart-admin-password> <new-email-password>

Arguments:
  stalwart-admin-password  The admin password for your Stalwart mail server
  new-email-password       The new password you want to set for justin@rnrb.me

Example:
  node scripts/reset-email-password.mjs "AdminPass123" "MyNewPassword456!"
`);
  process.exit(1);
}

const [adminPassword, newPassword] = args;

if (newPassword.length < 8) {
  console.error('❌ New password must be at least 8 characters');
  process.exit(1);
}

resetPassword(adminPassword, newPassword);

