#!/bin/bash
# Documentation Cleanup Script
# Organizes ~150 markdown files into logical archive structure

cd "$(dirname "$0")"

# Create archive structure
mkdir -p _ARCHIVE_DOCS/{agent-sessions,features,fixes,optimization,testing,deployment,guides,analysis}

echo "Starting documentation cleanup..."

# Move agent session files
mv AGENT_*.md _ARCHIVE_DOCS/agent-sessions/ 2>/dev/null
echo "✓ Moved agent session files"

# Move optimization & analysis reports
mv *_OPTIMIZATION_REPORT.md _ARCHIVE_DOCS/optimization/ 2>/dev/null
mv *_SAFETY_AUDIT.md _ARCHIVE_DOCS/optimization/ 2>/dev/null
mv *_ANALYSIS*.md _ARCHIVE_DOCS/analysis/ 2>/dev/null
mv ULTRA_DEEP*.md _ARCHIVE_DOCS/analysis/ 2>/dev/null
echo "✓ Moved optimization & analysis files"

# Move fix documentation
mv *_FIX.md _ARCHIVE_DOCS/fixes/ 2>/dev/null
mv *_FIX_*.md _ARCHIVE_DOCS/fixes/ 2>/dev/null
mv *_ENCODING*.md _ARCHIVE_DOCS/fixes/ 2>/dev/null
mv *_REDIRECT*.md _ARCHIVE_DOCS/fixes/ 2>/dev/null
mv PLUS_SIGN*.md _ARCHIVE_DOCS/fixes/ 2>/dev/null
mv DOUBLE_*.md _ARCHIVE_DOCS/fixes/ 2>/dev/null
mv FIXES_APPLIED.md _ARCHIVE_DOCS/fixes/ 2>/dev/null
mv PATHWAYS_VERIFIED.md _ARCHIVE_DOCS/fixes/ 2>/dev/null
echo "✓ Moved fix documentation"

# Move feature implementation docs
mv *_COMPLETE.md _ARCHIVE_DOCS/features/ 2>/dev/null
mv *_IMPLEMENTATION*.md _ARCHIVE_DOCS/features/ 2>/dev/null
mv *_INTEGRATION*.md _ARCHIVE_DOCS/features/ 2>/dev/null
mv *_BUILDER*.md _ARCHIVE_DOCS/features/ 2>/dev/null
mv *_TOOLBOX*.md _ARCHIVE_DOCS/features/ 2>/dev/null
mv *_NETWORK*.md _ARCHIVE_DOCS/features/ 2>/dev/null
mv *_FEED*.md _ARCHIVE_DOCS/features/ 2>/dev/null
echo "✓ Moved feature implementation files"

# Move testing & verification docs
mv *_TEST*.md _ARCHIVE_DOCS/testing/ 2>/dev/null
mv *_VERIFICATION*.md _ARCHIVE_DOCS/testing/ 2>/dev/null
mv *_VALIDATION*.md _ARCHIVE_DOCS/testing/ 2>/dev/null
mv SMOKE_TEST*.md _ARCHIVE_DOCS/testing/ 2>/dev/null
mv HUMAN_TEST*.md _ARCHIVE_DOCS/testing/ 2>/dev/null
echo "✓ Moved testing & verification files"

# Move deployment docs
mv *_DEPLOYMENT*.md _ARCHIVE_DOCS/deployment/ 2>/dev/null
mv *DEPLOY*.md _ARCHIVE_DOCS/deployment/ 2>/dev/null
mv DEPLOYMENT_*.md _ARCHIVE_DOCS/deployment/ 2>/dev/null
echo "✓ Moved deployment files"

# Move setup & configuration guides
mv *_SETUP*.md _ARCHIVE_DOCS/guides/ 2>/dev/null
mv *_GUIDE*.md _ARCHIVE_DOCS/guides/ 2>/dev/null
mv EMAIL_*.md _ARCHIVE_DOCS/guides/ 2>/dev/null
mv POSTHOG_*.md _ARCHIVE_DOCS/guides/ 2>/dev/null
mv CLOUDFLARE*.md _ARCHIVE_DOCS/guides/ 2>/dev/null
mv SEO_*.md _ARCHIVE_DOCS/guides/ 2>/dev/null
mv SCALING*.md _ARCHIVE_DOCS/guides/ 2>/dev/null
echo "✓ Moved setup & configuration guides"

# Move feature-specific docs
mv SONGWRITING_*.md _ARCHIVE_DOCS/features/ 2>/dev/null
mv TOUR_*.md _ARCHIVE_DOCS/features/ 2>/dev/null
mv STUDIO_*.md _ARCHIVE_DOCS/features/ 2>/dev/null
mv LIBRARY_*.md _ARCHIVE_DOCS/features/ 2>/dev/null
mv DASHBOARD_*.md _ARCHIVE_DOCS/features/ 2>/dev/null
mv PROJECTS_*.md _ARCHIVE_DOCS/features/ 2>/dev/null
mv COLLABORATION_*.md _ARCHIVE_DOCS/features/ 2>/dev/null
mv MESSAGES_*.md _ARCHIVE_DOCS/features/ 2>/dev/null
mv SMART_SETLIST*.md _ARCHIVE_DOCS/features/ 2>/dev/null
mv GIG_CALENDAR*.md _ARCHIVE_DOCS/features/ 2>/dev/null
mv WEBSITE_BUILDER*.md _ARCHIVE_DOCS/features/ 2>/dev/null
mv LANDING_PAGE*.md _ARCHIVE_DOCS/features/ 2>/dev/null
mv PROFILE_*.md _ARCHIVE_DOCS/features/ 2>/dev/null
mv COPYRIGHT_*.md _ARCHIVE_DOCS/features/ 2>/dev/null
mv MERCH_*.md _ARCHIVE_DOCS/features/ 2>/dev/null
mv EXPLORER_*.md _ARCHIVE_DOCS/features/ 2>/dev/null
mv CREDITS_*.md _ARCHIVE_DOCS/features/ 2>/dev/null
mv TRACK_*.md _ARCHIVE_DOCS/features/ 2>/dev/null
mv TOURS_*.md _ARCHIVE_DOCS/features/ 2>/dev/null
mv OPPORTUNITIES*.md _ARCHIVE_DOCS/features/ 2>/dev/null
mv MUSICIANS_*.md _ARCHIVE_DOCS/features/ 2>/dev/null
mv URGENT_*.md _ARCHIVE_DOCS/fixes/ 2>/dev/null
mv NEW_USER*.md _ARCHIVE_DOCS/features/ 2>/dev/null
echo "✓ Moved feature-specific documentation"

# Move miscellaneous old docs
mv WORLD_CLASS*.md _ARCHIVE_DOCS/features/ 2>/dev/null
mv FINAL_*.md _ARCHIVE_DOCS/features/ 2>/dev/null
mv AESTHETIC_*.md _ARCHIVE_DOCS/features/ 2>/dev/null
mv CODEBASE_*.md _ARCHIVE_DOCS/analysis/ 2>/dev/null
mv COMPREHENSIVE_*.md _ARCHIVE_DOCS/analysis/ 2>/dev/null
mv COST_*.md _ARCHIVE_DOCS/analysis/ 2>/dev/null
mv AI_ASSISTANT_*.md _ARCHIVE_DOCS/features/ 2>/dev/null
mv AI_WORKSPACE*.md _ARCHIVE_DOCS/features/ 2>/dev/null
mv AUTHENTICATION_*.md _ARCHIVE_DOCS/fixes/ 2>/dev/null
mv AUTH_*.md _ARCHIVE_DOCS/fixes/ 2>/dev/null
mv ABLY_*.md _ARCHIVE_DOCS/fixes/ 2>/dev/null
mv PAGINATION*.md _ARCHIVE_DOCS/fixes/ 2>/dev/null
mv PRICE_*.md _ARCHIVE_DOCS/fixes/ 2>/dev/null
mv PRICING_*.md _ARCHIVE_DOCS/features/ 2>/dev/null
mv TIER_*.md _ARCHIVE_DOCS/features/ 2>/dev/null
mv PRINTFUL*.md _ARCHIVE_DOCS/features/ 2>/dev/null
mv GOOGLE_*.md _ARCHIVE_DOCS/guides/ 2>/dev/null
mv PROJECT_NAVIGATION*.md _ARCHIVE_DOCS/guides/ 2>/dev/null
mv DESIGN_SYSTEM.md _ARCHIVE_DOCS/guides/ 2>/dev/null
mv 100_PERCENT*.md _ARCHIVE_DOCS/features/ 2>/dev/null
mv _SECURITY_FIX*.md _ARCHIVE_DOCS/fixes/ 2>/dev/null
mv MYCELIAL_*.md _ARCHIVE_DOCS/features/ 2>/dev/null
mv DISTRIBUTION*.md _ARCHIVE_DOCS/features/ 2>/dev/null
echo "✓ Moved miscellaneous documentation"

# Count remaining files
REMAINING=$(ls -1 *.md 2>/dev/null | wc -l | tr -d ' ')

echo ""
echo "======================================"
echo "Cleanup Complete!"
echo "======================================"
echo "Remaining .md files in root: $REMAINING"
echo ""
echo "Files kept in root (essential only):"
ls -1 *.md 2>/dev/null || echo "  (none)"
echo ""
echo "Archive structure created in _ARCHIVE_DOCS/"
echo "  - agent-sessions/"
echo "  - features/"
echo "  - fixes/"
echo "  - optimization/"
echo "  - testing/"
echo "  - deployment/"
echo "  - guides/"
echo "  - analysis/"
echo ""

