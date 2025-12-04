#!/usr/bin/env npx tsx
/**
 * ICON EXPORT VALIDATION SCRIPT
 *
 * Validates that all icons imported from custom-icons.tsx are actually exported.
 * Catches the "X is not defined" errors before they hit production.
 *
 * Usage:
 *   npx tsx scripts/validate-icons.ts
 *   pnpm validate:icons
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// Get all exported icons from custom-icons.tsx
function getExportedIcons(): Set<string> {
  const iconsPath = path.join(__dirname, '..', 'components/ui/custom-icons.tsx');
  const content = fs.readFileSync(iconsPath, 'utf-8');

  const exports = new Set<string>();

  // Match: export const IconName = ...
  const exportPattern = /export\s+const\s+(\w+)\s*=/g;
  let match;
  while ((match = exportPattern.exec(content)) !== null) {
    exports.add(match[1]);
  }

  // Match: export type TypeName = ...
  const typeExportPattern = /export\s+type\s+(\w+)\s*=/g;
  while ((match = typeExportPattern.exec(content)) !== null) {
    exports.add(match[1]);
  }

  // Match: export interface InterfaceName ...
  const interfaceExportPattern = /export\s+interface\s+(\w+)/g;
  while ((match = interfaceExportPattern.exec(content)) !== null) {
    exports.add(match[1]);
  }

  // Match: export { IconName, ... }
  const namedExportPattern = /export\s*\{([^}]+)\}/g;
  while ((match = namedExportPattern.exec(content)) !== null) {
    const names = match[1].split(',').map((s) =>
      s
        .trim()
        .split(/\s+as\s+/)[0]
        .trim()
    );
    names.forEach((name) => {
      if (name && !name.includes('*')) {
        exports.add(name);
      }
    });
  }

  // Also check the icon index for reference
  try {
    const indexPath = path.join(__dirname, '..', 'components/ui/icon-index.ts');
    const indexContent = fs.readFileSync(indexPath, 'utf-8');
    const arrayMatch = indexContent.match(/EXPORTED_ICONS\s*=\s*\[([\s\S]*?)\]\s*as\s*const/);
    if (arrayMatch) {
      const iconNames = arrayMatch[1].match(/'([^']+)'/g);
      if (iconNames) {
        const indexedIcons = iconNames.map((n) => n.replace(/'/g, ''));
        const missingFromCustom = indexedIcons.filter((n) => !exports.has(n));
        if (missingFromCustom.length > 0) {
          console.log(
            '⚠️  Icons in index but not in custom-icons.tsx:',
            missingFromCustom.join(', ')
          );
        }
      }
    }
  } catch {
    // icon-index.ts may not exist, that's fine
  }

  return exports;
}

// Get all imported icons from a file
function getImportedIcons(content: string): { icons: string[]; line: number }[] {
  const results: { icons: string[]; line: number }[] = [];
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    // Match: import { Icon1, Icon2 } from '@/components/ui/custom-icons'
    // or: import { Icon1, Icon2 } from '../ui/custom-icons'
    const importPattern =
      /import\s*\{([^}]+)\}\s*from\s*['"](?:@\/components\/ui\/custom-icons|[./]+components\/ui\/custom-icons|\.\.\/ui\/custom-icons)['"]/;
    const match = line.match(importPattern);

    if (match) {
      const icons = match[1]
        .split(',')
        .map((s) =>
          s
            .trim()
            .split(/\s+as\s+/)[0]
            .trim()
        )
        .filter(Boolean);
      results.push({ icons, line: index + 1 });
    }
  });

  return results;
}

// Main validation function
async function validateIcons() {
  console.log('🎨 Validating icon imports...\n');

  const exportedIcons = getExportedIcons();
  console.log(`📦 Found ${exportedIcons.size} exported icons in custom-icons.tsx\n`);

  const errors: { file: string; icon: string; line: number }[] = [];

  // Find all TSX files
  const files = execSync('find app components -name "*.tsx" -type f', {
    cwd: path.join(__dirname, '..'),
    encoding: 'utf-8',
  })
    .trim()
    .split('\n')
    .filter(Boolean);

  let totalImports = 0;
  let validImports = 0;

  for (const file of files) {
    // Skip the custom-icons file itself
    if (file.includes('custom-icons.tsx')) continue;

    const filePath = path.join(__dirname, '..', file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const imports = getImportedIcons(content);

    for (const { icons, line } of imports) {
      for (const icon of icons) {
        totalImports++;

        if (exportedIcons.has(icon)) {
          validImports++;
        } else {
          errors.push({ file, icon, line });
        }
      }
    }
  }

  // Report results
  console.log(`📊 Scanned ${files.length} files`);
  console.log(`📊 Found ${totalImports} icon imports`);
  console.log(`✅ ${validImports} valid imports\n`);

  if (errors.length > 0) {
    console.log('❌ ERRORS (icons imported but not exported):');
    errors.forEach(({ file, icon, line }) => {
      console.log(`   ${file}:${line}`);
      console.log(`   └─ "${icon}" is not exported from custom-icons.tsx`);

      // Suggest similar icons
      const similar = [...exportedIcons].filter(
        (exp) =>
          exp.toLowerCase().includes(icon.toLowerCase().slice(0, 4)) ||
          icon.toLowerCase().includes(exp.toLowerCase().slice(0, 4))
      );
      if (similar.length > 0) {
        console.log(`   💡 Did you mean: ${similar.slice(0, 3).join(', ')}?\n`);
      } else {
        console.log('');
      }
    });

    console.log(`\n❌ Found ${errors.length} missing icon exports!`);
    console.log('💡 Either add the export to custom-icons.tsx or use an existing icon.\n');
    process.exit(1);
  }

  console.log('✅ All icon imports validated successfully!\n');
}

// Run validation
validateIcons().catch((err) => {
  console.error('Error running validation:', err);
  process.exit(1);
});
