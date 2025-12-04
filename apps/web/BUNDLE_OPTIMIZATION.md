# Bundle Optimization Guide

## Current Status (As of Dec 4, 2025)

### Lighthouse Performance Report Analysis

- **Total Bundle Size**: 598 KiB
- **Unused JavaScript**: 168 KiB (28% waste)
- **Legacy Polyfills**: 20 KiB (unnecessary for modern browsers)

### Performance Scores

- Performance: 75/100
- Accessibility: 94/100
- Best Practices: 96/100
- SEO: 100/100

---

## Optimizations Implemented

### 1. Modern Browser Targeting (`.browserslistrc`)

**Impact**: Eliminates 20 KiB of unnecessary polyfills

By targeting only modern browsers (last 2 versions), we eliminate polyfills for:

- `Array.prototype.at`
- `Array.prototype.flat` / `flatMap`
- `Object.fromEntries` / `hasOwn`
- `String.prototype.trimStart` / `trimEnd`
- `Math.trunc`

### 2. Enhanced Next.js Config

**Impact**: Better tree-shaking, smaller chunks, improved caching

```javascript
experimental: {
  optimizePackageImports: [
    'lucide-react',           // Icon library - only import used icons
    'framer-motion',          // Animation library
    '@cronkwaters/ui',        // Custom UI package
    'ably',                   // Real-time messaging
    '@daily-co/daily-js',     // Video calling
    '@daily-co/daily-react',
    'date-fns',               // Date utilities
    'lodash',                 // Utility library
    'posthog-js',             // Analytics
    '@tanstack/react-query',  // Data fetching
    '@tanstack/react-virtual', // Virtualization
    'zod',                    // Schema validation
  ],
  swcMinify: true,            // Modern minifier
  optimizeCss: true,          // CSS optimization
  optimizeServerReact: true,  // Server component optimization
}
```

### 3. Webpack Advanced Optimizations

**Impact**: Granular chunking for better caching and reuse

```javascript
webpack: (config) => {
  config.optimization.splitChunks = {
    chunks: 'all',
    cacheGroups: {
      vendor: {
        // Split vendor code by package name
        // Results in: vendor.react, vendor.next, etc.
      },
      ui: {
        // Separate chunk for UI components
      },
      common: {
        // Shared code across routes
        minChunks: 2,
        reuseExistingChunk: true,
      },
    },
  };
};
```

---

## Dynamic Import Strategy

### Components That Should Be Lazy-Loaded

#### High Priority (Immediate Impact)

1. **Command Palette** - Only loads when user presses Cmd+K
2. **Keyboard Shortcuts Help** - Only when user requests it
3. **AI Assistant Chat** - Only when opened
4. **Modals/Dialogs** - Only when triggered

#### Medium Priority

1. **Heavy charts/visualizations** - Load on scroll or tab activation
2. **Video player** - Load when video is played
3. **Audio player** - Load when audio is played
4. **Rich text editor** - Load when user focuses input

#### Example Implementation:

```typescript
// Before (eager loading)
import { CommandPalette } from './command-palette';

// After (lazy loading)
import dynamic from 'next/dynamic';
const CommandPalette = dynamic(() => import('./command-palette'), {
  ssr: false, // Client-side only
  loading: () => null, // No loading spinner needed
});
```

---

## Bundle Analysis Commands

### Analyze Bundle Size

```bash
# Generate interactive bundle visualization
pnpm build:analyze

# Opens: apps/web/bundle-report.html
```

### Monitor Bundle Changes

```bash
# Build and check bundle sizes
pnpm build

# Look for these indicators in output:
# - Route (app) sizes
# - First Load JS shared by all
# - ƒ = Dynamic route
# - ○ = Static route
# - ● = SSG route
```

---

## Expected Results After Optimization

### Bundle Size Reduction

- **Before**: 598 KiB total, 168 KiB unused (28%)
- **Target**: <500 KiB total, <50 KiB unused (<10%)
- **Savings**: ~100-150 KiB (17-25% reduction)

### Performance Score Impact

- **Before**: 75/100
- **Target**: 85-90/100
- **Key Improvements**:
  - Faster Time to Interactive (TTI)
  - Reduced Total Blocking Time (TBT)
  - Better First Input Delay (FID)

### User Experience

- **Initial page load**: 150-200ms faster
- **Route transitions**: 50-100ms faster
- **Cached visits**: 300-400ms faster

---

## Monitoring & Maintenance

### Weekly Checks

1. Run `pnpm build:analyze` to review bundle composition
2. Check for new dependencies that need `optimizePackageImports`
3. Review unused code in bundle report

### Before Adding New Dependencies

Ask yourself:

1. Is this package tree-shakeable?
2. What's the bundle size impact?
3. Can it be dynamically imported?
4. Is there a lighter alternative?

### Tools

- **Bundlephobia**: https://bundlephobia.com (check package size before installing)
- **Import Cost VS Code Extension**: Shows import sizes inline
- **Next.js Bundle Analyzer**: Built into this project

---

## Next Steps

### Phase 1: Configuration ✅ (Complete)

- [x] Add `.browserslistrc` for modern browsers
- [x] Enhance Next.js config with optimizations
- [x] Configure advanced webpack chunking

### Phase 2: Dynamic Imports (Recommended)

- [ ] Convert CommandPalette to dynamic import
- [ ] Convert KeyboardShortcutsHelp to dynamic import
- [ ] Convert AssistantChat to dynamic import
- [ ] Convert heavy modals to dynamic imports

### Phase 3: Deep Analysis

- [ ] Run bundle analyzer and identify largest chunks
- [ ] Audit each chunk for unused code
- [ ] Consider route-based code splitting for less common features

### Phase 4: Continuous Optimization

- [ ] Set up bundle size monitoring in CI/CD
- [ ] Create bundle size budget (warn if exceeds threshold)
- [ ] Regular dependency audits

---

## Technical Notes

### Why These Optimizations Work

1. **Browserslist**: Babel/TypeScript use this to determine which polyfills to include. By targeting modern browsers, we eliminate ~20 KiB of polyfills.

2. **optimizePackageImports**: Next.js applies special tree-shaking to these packages, eliminating unused code at build time.

3. **splitChunks**: Creates more granular bundles that can be cached independently. When you update one feature, users only re-download that chunk.

4. **Dynamic Imports**: Moves non-critical code out of the initial bundle. Loaded on-demand when actually needed.

### Build-time Impact

- Initial build: May be 10-15% slower due to more aggressive optimization
- Incremental builds: Should be similar or faster due to better chunking
- Deployment: Slightly slower due to more files to upload

### Runtime Impact

- Initial load: 150-300ms faster
- Subsequent navigation: Faster due to better caching
- Memory usage: Slightly lower due to less unused code

---

## Troubleshooting

### If build fails after changes:

1. Check that all dynamic imports have correct paths
2. Verify browserslist compatibility with your code
3. Try removing one optimization at a time to isolate issue

### If bundle size increases:

1. A new dependency was added - check `package.json`
2. A component was converted from server to client component
3. A new route was added with heavy dependencies

### If you see hydration errors:

1. Check that dynamic imports have correct `ssr` setting
2. Ensure client components use `'use client'` directive
3. Verify no server-only code in client components

---

## Resources

- [Next.js Bundle Analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)
- [Next.js Optimizing Bundles](https://nextjs.org/docs/app/building-your-application/optimizing/bundle-analyzer)
- [Web.dev: Reduce JavaScript Payloads](https://web.dev/reduce-javascript-payloads-with-code-splitting/)
- [Lighthouse Performance Scoring](https://web.dev/performance-scoring/)
