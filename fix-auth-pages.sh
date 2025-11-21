#!/bin/bash

# Pages to fix:
pages=(
  "apps/web/app/analytics/page.tsx"
  "apps/web/app/projects/[slug]/collaborate/page.tsx"
  "apps/web/app/projects/[slug]/page.tsx"
  "apps/web/app/projects/new/page.tsx"
  "apps/web/app/projects/[slug]/songs/[songId]/page.tsx"
  "apps/web/app/projects/[slug]/songs/page.tsx"
  "apps/web/app/projects/[slug]/songs/new/page.tsx"
  "apps/web/app/projects/[slug]/settings/page.tsx"
  "apps/web/app/projects/[slug]/setlists/page.tsx"
  "apps/web/app/projects/[slug]/sessions/page.tsx"
  "apps/web/app/invites/[projectSlug]/page.tsx"
  "apps/web/app/settings/profile/page.tsx"
)

echo "Found ${#pages[@]} pages to fix:"
for page in "${pages[@]}"; do
  if [ -f "$page" ]; then
    echo "  ✓ $page"
  else
    echo "  ✗ $page (not found)"
  fi
done
