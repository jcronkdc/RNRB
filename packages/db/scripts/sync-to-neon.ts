#!/usr/bin/env tsx
/**
 * Sync Prisma schema to Neon database
 * This script connects to Neon and applies the schema
 */

import { execSync } from 'child_process';
import { prisma } from '../src/index';

async function main() {
  console.log('🍄 Mycelial Network: Syncing schema to Neon database...\n');

  try {
    // Test connection
    console.log('📡 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Connected to database successfully!\n');

    // Push schema to database
    console.log('📤 Pushing schema to database...');
    try {
      execSync('pnpm prisma db push --accept-data-loss', {
        cwd: process.cwd(),
        stdio: 'inherit',
      });
      console.log('\n✅ Schema synced successfully!');
    } catch (error) {
      console.error('\n❌ Error pushing schema:', error);
      throw error;
    }

    // Verify tables
    console.log('\n🔍 Verifying database structure...');
    const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
    `;

    console.log(`\n📊 Found ${tables.length} tables in database:`);
    tables.forEach((table) => {
      console.log(`   - ${table.tablename}`);
    });

    console.log('\n✅ Database sync complete!');
  } catch (error) {
    console.error('\n❌ Database sync failed:');
    if (error instanceof Error) {
      console.error(`   ${error.message}`);
    } else {
      console.error('   Unknown error occurred');
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
