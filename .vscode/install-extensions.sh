#!/bin/bash
# 🍄 Rock N' Roll Basement - Extension Auto-Installer
# Last Updated: 2025-11-23 @ Agent 72

echo "🍄 INSTALLING VSCODE EXTENSIONS FOR ROCK N' ROLL BASEMENT..."
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counter
INSTALLED=0
FAILED=0

# Function to install extension
install_extension() {
  local ext_id=$1
  local ext_name=$2
  
  echo -n "Installing ${ext_name}... "
  
  if code --install-extension "$ext_id" > /dev/null 2>&1; then
    echo -e "${GREEN}✅${NC}"
    ((INSTALLED++))
  else
    echo -e "${RED}❌${NC}"
    ((FAILED++))
  fi
}

echo "🔥 TIER 1: CRITICAL EXTENSIONS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
install_extension "Prisma.prisma" "Prisma"
install_extension "usernamehw.errorlens" "Error Lens"
install_extension "yoavbls.pretty-ts-errors" "Pretty TypeScript Errors"
install_extension "bradlc.vscode-tailwindcss" "Tailwind CSS IntelliSense"
install_extension "dbaeumer.vscode-eslint" "ESLint"

echo ""
echo "🔬 TIER 2: QUALITY ENHANCEMENT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
install_extension "wix.vscode-import-cost" "Import Cost"
install_extension "esbenp.prettier-vscode" "Prettier"

echo ""
echo "🛠️ TIER 3: WORKFLOW OPTIMIZERS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
install_extension "rangav.vscode-thunder-client" "Thunder Client"
install_extension "Gruntfuggly.todo-tree" "Todo Tree"
install_extension "eamodio.gitlens" "GitLens"

echo ""
echo "🎯 BONUS: NEXT.JS SPECIFIC"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
install_extension "burkeholland.simple-react-snippets" "Simple React Snippets"
install_extension "formulahendry.auto-rename-tag" "Auto Rename Tag"
install_extension "dsznajder.es7-react-js-snippets" "ES7+ React Snippets"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 INSTALLATION SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "✅ Installed: ${GREEN}${INSTALLED}${NC}"
echo -e "❌ Failed: ${RED}${FAILED}${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}🎸 All extensions installed successfully!${NC}"
  echo ""
  echo "🚀 NEXT STEPS:"
  echo "1. Reload Cursor (Cmd+Shift+P → 'Developer: Reload Window')"
  echo "2. Extensions will auto-configure from .vscode/settings.json"
  echo "3. Try 'pnpm format' to test Prettier"
  echo ""
else
  echo -e "${YELLOW}⚠️ Some extensions failed to install${NC}"
  echo ""
  echo "🔍 TROUBLESHOOTING:"
  echo "1. Make sure you're using VSCode/Cursor (not another editor)"
  echo "2. Try installing manually from Extensions tab"
  echo "3. Check .vscode/EXTENSIONS_REFERENCE.md for manual install commands"
  echo ""
fi

echo "🍄 Extension setup complete!"


