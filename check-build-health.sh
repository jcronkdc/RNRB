#!/bin/bash
# 🍄 Build Health Check Script
# Rock N' Roll Basement - Complete Verification

echo "🍄 ROCK N' ROLL BASEMENT - BUILD HEALTH CHECK"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

ERRORS=0

# 1. Format Check
echo "📝 Step 1: Checking code formatting..."
if pnpm format:check > /dev/null 2>&1; then
  echo -e "${GREEN}✅ All files properly formatted${NC}"
else
  echo -e "${YELLOW}⚠️ Some files need formatting${NC}"
  echo "   Run: pnpm format"
fi
echo ""

# 2. Linting
echo "🔍 Step 2: Running ESLint..."
if pnpm lint > /dev/null 2>&1; then
  echo -e "${GREEN}✅ No linting errors${NC}"
else
  echo -e "${YELLOW}⚠️ Linting issues found${NC}"
  echo "   Run: pnpm lint:fix"
  ((ERRORS++))
fi
echo ""

# 3. Type checking
echo "📊 Step 3: Type checking..."
cd apps/web
if pnpm typecheck > /dev/null 2>&1; then
  echo -e "${GREEN}✅ No TypeScript errors${NC}"
else
  echo -e "${RED}❌ TypeScript errors found${NC}"
  echo "   Run: pnpm typecheck (to see errors)"
  ((ERRORS++))
fi
cd ../..
echo ""

# 4. Build test
echo "🏗️ Step 4: Testing production build..."
cd apps/web
if pnpm build > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Build successful${NC}"
else
  echo -e "${RED}❌ Build failed${NC}"
  echo "   Run: cd apps/web && pnpm build (to see errors)"
  ((ERRORS++))
fi
cd ../..
echo ""

# Summary
echo "=============================================="
if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}🎸 ALL CHECKS PASSED!${NC}"
  echo ""
  echo "Your build is clean and ready to deploy!"
else
  echo -e "${YELLOW}⚠️ Found $ERRORS issue(s)${NC}"
  echo ""
  echo "Run the suggested commands to fix issues."
fi
echo ""
echo "🍄 Health check complete!"






















