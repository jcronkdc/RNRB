#!/usr/bin/env npx tsx
/**
 * ROUTE VALIDATION SCRIPT
 *
 * Validates that all href links in the codebase point to existing routes.
 * Run this in CI or as a pre-commit hook to catch broken links early.
 *
 * Usage:
 *   npx tsx scripts/validate-routes.ts
 *   pnpm validate:routes
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// Known valid route patterns (dynamic segments are represented as [param])
const VALID_ROUTE_PATTERNS = [
  // Home & Dashboard
  '/',
  '/dashboard',
  '/workspace',

  // Profiles
  '/community/users/[id]',
  '/social/profile',
  '/social/profile/[id]',
  '/settings/profile',

  // Social
  '/social',
  '/social/discover',
  '/social/explore',
  '/social/network',
  '/social/friends',
  '/social/blocked',
  '/social/notifications',
  '/social/messages',
  '/social/messages/inbox',
  '/social/messages/requests',
  '/social/messages/report',

  // Feed
  '/feed',
  '/feed/explore',
  '/feed/post/[id]',
  '/feed/tag/[tag]',

  // Mail & Messages
  '/mail',
  '/mail/compose',
  '/messages',

  // Music & Creative
  '/library',
  '/songs',
  '/songwriting',
  '/studio',
  '/studio/recording-guide',
  '/create',

  // Collaboration
  '/collaboration',
  '/collaboration-needs',
  '/opportunities',
  '/opportunities/[id]',
  '/opportunities/post',

  // Marketplace
  '/marketplace',
  '/marketplace/[id]',
  '/marketplace/[id]/edit',
  '/marketplace/create',
  '/marketplace/my-listings',
  '/marketplace/become-provider',
  '/marketplace/messages',
  '/marketplace/seller/[id]',
  '/marketplace/review/[id]',

  // Masterclasses
  '/masterclasses',
  '/masterclasses/[slug]',
  '/masterclasses/[slug]/watch',
  '/masterclasses/[slug]/live',
  '/masterclasses/[slug]/certificate',
  '/masterclasses/create',
  '/masterclasses/become-instructor',
  '/masterclasses/instructor',
  '/masterclasses/instructor/analytics',

  // Tours & Shows
  '/tours',
  '/tours/[slug]',
  '/shows/calendar',
  '/shows/today',

  // Live Streaming
  '/live',
  '/live/go',
  '/live/[streamId]',
  '/live/analytics',

  // Meet
  '/meet',
  '/meet/[meetingCode]',
  '/meet/analytics',

  // Merch
  '/merch',
  '/merch/checkout',
  '/merch/success',
  '/merch/orders',
  '/merch/design',
  '/my-merch',
  '/my-merch/create',
  '/my-merch/customize/[productId]',
  '/my-merch/earnings',
  '/my-merch/printful-catalog',

  // Settings
  '/settings',
  '/settings/profile',
  '/settings/billing',
  '/settings/display',
  '/settings/email',
  '/settings/usage',

  // Affiliate & Revenue
  '/affiliate',
  '/affiliate/stream-setup',
  '/revenue',
  '/credits',

  // Labs
  '/labs',
  '/labs/contribute',
  '/labs/experiment',
  '/labs/research',
  '/labs/volunteer',

  // Sites & Tools
  '/sites',
  '/sites/edit',
  '/sites/success',
  '/tools',
  '/setlists',
  '/share',

  // Help
  '/help',
  '/help/merch',

  // Other
  '/notifications',
  '/discover',
  '/explore',
  '/network',

  // Projects
  '/projects/[slug]',
  '/projects/[slug]/songs/[songSlug]',

  // Auth (external)
  '/auth/signin',
  '/auth/signup',
  '/auth/error',
];

// Convert route patterns to regex
function patternToRegex(pattern: string): RegExp {
  const escaped = pattern
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\\\[([^\]]+)\\\]/g, '[^/]+');
  return new RegExp(`^${escaped}(\\?.*)?$`);
}

// Extract href values from source files
function extractHrefs(content: string): { href: string; line: number }[] {
  const results: { href: string; line: number }[] = [];
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    // Match href="..." or href={'...'} or href={`...`} patterns
    const patterns = [
      /href="([^"]+)"/g,
      /href='([^']+)'/g,
      /href=\{['"`]([^'"`}]+)['"`]\}/g,
      /href=\{`([^`]+)`\}/g,
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(line)) !== null) {
        let href = match[1];

        // Skip external links, anchors, and mailto
        if (
          href.startsWith('http') ||
          href.startsWith('//') ||
          href.startsWith('#') ||
          href.startsWith('mailto:') ||
          href.startsWith('tel:')
        ) {
          continue;
        }

        // Handle template literals with variables
        // e.g., `/community/users/${userId}` becomes `/community/users/[id]`
        href = href.replace(/\$\{[^}]+\}/g, '[id]');

        // Clean up any remaining template syntax
        if (href.includes('${')) continue;

        results.push({ href, line: index + 1 });
      }
    }
  });

  return results;
}

// Validate a single href against known patterns
function isValidHref(href: string): boolean {
  // Remove query params for validation
  const basePath = href.split('?')[0];

  // Check against all valid patterns
  return VALID_ROUTE_PATTERNS.some((pattern) => {
    const regex = patternToRegex(pattern);
    return regex.test(basePath);
  });
}

// Main validation function
async function validateRoutes() {
  console.log('🔍 Validating routes in codebase...\n');

  const errors: { file: string; href: string; line: number }[] = [];
  const warnings: { file: string; href: string; line: number }[] = [];

  // Find all TSX files
  const files = execSync('find app components -name "*.tsx" -type f', {
    cwd: path.join(__dirname, '..'),
    encoding: 'utf-8',
  })
    .trim()
    .split('\n')
    .filter(Boolean);

  let totalHrefs = 0;
  let validHrefs = 0;

  for (const file of files) {
    const filePath = path.join(__dirname, '..', file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const hrefs = extractHrefs(content);

    for (const { href, line } of hrefs) {
      totalHrefs++;

      // Skip ROUTES.* usage (these are validated by TypeScript)
      if (href.includes('ROUTES.')) {
        validHrefs++;
        continue;
      }

      if (isValidHref(href)) {
        validHrefs++;
      } else {
        // Check if it might be a dynamic route with weird syntax
        if (href.includes('[id]') || href.includes('[slug]')) {
          warnings.push({ file, href, line });
        } else {
          errors.push({ file, href, line });
        }
      }
    }
  }

  // Report results
  console.log(`📊 Scanned ${files.length} files`);
  console.log(`📊 Found ${totalHrefs} href links`);
  console.log(`✅ ${validHrefs} valid links\n`);

  if (warnings.length > 0) {
    console.log('⚠️  WARNINGS (possible issues):');
    warnings.forEach(({ file, href, line }) => {
      console.log(`   ${file}:${line}`);
      console.log(`   └─ ${href}\n`);
    });
  }

  if (errors.length > 0) {
    console.log('❌ ERRORS (likely broken links):');
    errors.forEach(({ file, href, line }) => {
      console.log(`   ${file}:${line}`);
      console.log(`   └─ ${href}`);

      // Suggest fix
      if (href.startsWith('/profile/')) {
        console.log(`   💡 Did you mean: /community/users/[id] or /social/profile/[id]?\n`);
      } else {
        console.log('');
      }
    });

    console.log(`\n❌ Found ${errors.length} broken links!`);
    console.log('💡 Use ROUTES from @/lib/routes instead of hardcoded strings.\n');
    process.exit(1);
  }

  console.log('✅ All routes validated successfully!\n');
}

// Run validation
validateRoutes().catch((err) => {
  console.error('Error running validation:', err);
  process.exit(1);
});
