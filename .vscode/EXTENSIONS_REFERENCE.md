# 🛠️ VSCODE EXTENSIONS GUIDE
# Rock N' Roll Basement - Extension Recommendations

## 🔥 TIER 1: CRITICAL NETWORK STRENGTHENERS

### Prisma (`Prisma.prisma`)
- **What it does:** Auto-formats `.prisma` files, syntax highlighting, IntelliSense
- **Why essential:** You have complex DB schemas - this makes them readable
- **Install:** Search "Prisma" in Extensions tab

### Error Lens (`usernamehw.errorlens`)
- **What it does:** Shows errors INLINE (not on hover)
- **Why essential:** Tokyo Ant protocol - catches 404/500 instantly
- **Install:** Search "Error Lens" in Extensions tab

### Pretty TypeScript Errors (`yoavbls.pretty-ts-errors`)
- **What it does:** Makes TS errors human-readable
- **Why essential:** Saves 10+ mins per complex error
- **Install:** Search "Pretty TypeScript Errors" in Extensions tab

### Tailwind CSS IntelliSense (`bradlc.vscode-tailwindcss`)
- **What it does:** Autocomplete Tailwind classes, color previews
- **Why essential:** Massive productivity boost
- **Install:** Search "Tailwind CSS IntelliSense" in Extensions tab

### ESLint (`dbaeumer.vscode-eslint`)
- **What it does:** Auto-fix linting on save
- **Why essential:** Catches bugs before build
- **Install:** Search "ESLint" in Extensions tab

---

## 🔬 TIER 2: QUALITY ENHANCEMENT

### Import Cost (`wix.vscode-import-cost`)
- **What it does:** Shows package size inline
- **Why useful:** Prevents bundle bloat
- **Install:** Search "Import Cost" in Extensions tab

### Prettier (`esbenp.prettier-vscode`)
- **What it does:** Auto-format on save
- **Why useful:** Zero manual formatting
- **Install:** Search "Prettier" in Extensions tab

---

## 🛠️ TIER 3: WORKFLOW OPTIMIZERS

### Thunder Client (`rangav.vscode-thunder-client`)
- **What it does:** Test APIs without leaving VSCode
- **Why useful:** No context switching
- **Install:** Search "Thunder Client" in Extensions tab

### Todo Tree (`Gruntfuggly.todo-tree`)
- **What it does:** Visualize all TODO/FIXME comments
- **Why useful:** Keeps technical debt visible
- **Install:** Search "Todo Tree" in Extensions tab

### GitLens (`eamodio.gitlens`)
- **What it does:** Git blame + history
- **Why useful:** See who changed what
- **Install:** Search "GitLens" in Extensions tab

---

## 🎯 BONUS: NEXT.JS SPECIFIC

### Simple React Snippets (`burkeholland.simple-react-snippets`)
- **What it does:** React component snippets
- **Install:** Search "Simple React Snippets" in Extensions tab

### Auto Rename Tag (`formulahendry.auto-rename-tag`)
- **What it does:** Auto-rename paired HTML tags
- **Install:** Search "Auto Rename Tag" in Extensions tab

### ES7+ React Snippets (`dsznajder.es7-react-js-snippets`)
- **What it does:** ES7+ React snippets
- **Install:** Search "ES7 React/Redux" in Extensions tab

---

## 🚀 QUICK INSTALL (MANUAL)

If auto-install fails, run these commands in terminal:

```bash
# Tier 1: Critical
code --install-extension Prisma.prisma
code --install-extension usernamehw.errorlens
code --install-extension yoavbls.pretty-ts-errors
code --install-extension bradlc.vscode-tailwindcss
code --install-extension dbaeumer.vscode-eslint

# Tier 2: Quality
code --install-extension wix.vscode-import-cost
code --install-extension esbenp.prettier-vscode

# Tier 3: Workflow
code --install-extension rangav.vscode-thunder-client
code --install-extension Gruntfuggly.todo-tree
code --install-extension eamodio.gitlens

# Bonus: React
code --install-extension burkeholland.simple-react-snippets
code --install-extension formulahendry.auto-rename-tag
code --install-extension dsznajder.es7-react-js-snippets
```

---

## ❌ UNWANTED EXTENSIONS

These extensions conflict with our setup:
- ❌ `hookyqr.beautify` - Conflicts with Prettier
- ❌ `octref.vetur` - Vue-specific (not needed)
- ❌ `ms-python.python` - Python (not used in this project)

---

## 🔍 TROUBLESHOOTING

### Extensions Not Installing?
1. **Check Extension ID:** Make sure you're searching for the exact name
2. **Try Manual Install:** Use the `code --install-extension` commands above
3. **Reload Cursor:** Close and reopen after installing
4. **Check Conflicts:** Disable any extensions that might conflict

### Extensions Not Working?
1. **Check Settings:** Open `.vscode/settings.json` to verify config
2. **Reload Window:** Cmd+Shift+P → "Developer: Reload Window"
3. **Check Output:** View → Output → Select extension to see logs

### Still Having Issues?
- Make sure you're using **Cursor** (not VSCode)
- Some extensions may have slightly different IDs in Cursor
- Try installing from the Extensions marketplace directly

---

## 🍄 WHAT'S CONFIGURED

All extensions are pre-configured in `.vscode/settings.json`:
- ✅ Auto-format on save
- ✅ Auto-fix linting
- ✅ Inline error display
- ✅ Tailwind autocomplete
- ✅ Import cost tracking
- ✅ Git blame inline

**Just install the extensions and everything works automatically!** 🎸






