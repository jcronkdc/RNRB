# 🔄 BUILDER → REVIEWER WORKFLOW - CRITICAL PROCESS

## ⚠️ **THIS IS MANDATORY - READ CAREFULLY**

**ALL CODE MUST GO BACK TO REVIEWER BEFORE PRODUCTION DEPLOYMENT**

---

## 📋 **BUILDER MUST DO (In This Exact Order)**

### **1. READ Security Audit**
- ✅ Read `PLANNING_KICKBACK.md` - Complete list of 20+ vulnerabilities
- ✅ Understand each critical vulnerability
- ✅ Prioritize: Critical (🔴) → High (🟠) → Medium (🟡)

### **2. FIX All Vulnerabilities**
- ✅ Fix ALL 20+ critical security vulnerabilities
- ✅ Follow instructions in `PLANNING_KICKBACK.md`
- ✅ Fix Critical vulnerabilities FIRST (production blockers)

### **3. TEST Your Fixes**
- ✅ Run `tests/security/failing-tests.spec.ts`
- ✅ Ensure ALL security tests now PASS (they currently FAIL)
- ✅ Verify each vulnerability is actually resolved

### **4. DOCUMENT Your Work**
- ✅ **CREATE** `REVIEWER_KICKBACK.md` document
- ✅ List every vulnerability you fixed
- ✅ Provide evidence (test results, code changes)
- ✅ Confirm ALL critical issues resolved

### **5. UPDATE Documents**
- ✅ Update `PLANNING_KICKBACK.md` - Mark as ✅ FIXED
- ✅ Update `BUILDER_PLAN.md` - Mark tasks complete

### **6. SIGNAL Completion**
- ✅ Say **"ready"** when ALL fixes done and ALL tests pass
- ⚠️ **DO NOT** say "ready" until everything is complete

---

## 🔍 **REVIEWER WILL DO (After Builder Says "ready")**

### **1. REVIEW Builder's Documentation**
- ✅ Read `REVIEWER_KICKBACK.md` (Builder created this)
- ✅ Read `PLANNING_KICKBACK.md` (Check Builder's fix claims)
- ✅ Read `BUILDER_PLAN.md` (Check task completion)

### **2. VERIFY Fixes Work**
- ✅ Review code changes Builder made
- ✅ Verify fixes match documented vulnerabilities
- ✅ Check code quality and security best practices
- ✅ Ensure no new vulnerabilities introduced

### **3. TEST Security Fixes**
- ✅ Run `tests/security/failing-tests.spec.ts` - ALL must pass
- ✅ Run `pnpm typecheck` - Must pass with 0 errors
- ✅ Run `pnpm lint` - Must pass (warnings OK)
- ✅ Run `pnpm build` - Must build successfully

### **4. DECIDE**

**✅ APPROVE** if:
- All Critical vulnerabilities fixed correctly
- All security tests pass
- No TypeScript errors
- No critical linting errors
- Code follows security best practices
- No new vulnerabilities introduced

**❌ REJECT** if:
- Critical vulnerabilities not properly fixed
- Security tests still fail
- New vulnerabilities introduced
- Code quality issues
- Missing required fixes

### **5. TAKE ACTION**

**If APPROVED ✅:**
- Code automatically pushes to GitHub production
- Application approved for production
- Builder's work complete

**If REJECTED ❌:**
- Create kickback with remaining issues
- Builder must fix and say "ready" again
- Process repeats until approved

---

## 📄 **KEY DOCUMENTS**

### **Builder Reads:**
1. ✅ `PLANNING_KICKBACK.md` - Security vulnerabilities (20+)
2. ✅ `BUILDER_INSTRUCTIONS.md` - Workflow guide
3. ✅ `tests/security/failing-tests.spec.ts` - Security tests

### **Builder Creates:**
4. ⏳ `REVIEWER_KICKBACK.md` - Documentation of fixes

### **Builder Updates:**
5. ✅ `PLANNING_KICKBACK.md` - Mark vulnerabilities as ✅ FIXED
6. ✅ `BUILDER_PLAN.md` - Mark tasks complete

### **Reviewer Reviews:**
7. ✅ `REVIEWER_KICKBACK.md` - Builder's documentation
8. ✅ `PLANNING_KICKBACK.md` - Verify fix claims
9. ✅ `BUILDER_PLAN.md` - Verify task completion

---

## 🔄 **COMPLETE FLOW**

```
BUILDER:
1. Read PLANNING_KICKBACK.md
2. Fix all vulnerabilities
3. Run tests until ALL pass
4. Create REVIEWER_KICKBACK.md
5. Update documents
6. Say "ready"
   ↓
REVIEWER:
1. Read REVIEWER_KICKBACK.md
2. Verify fixes work
3. Re-run security tests
4. DECIDE: APPROVE ✅ or REJECT ❌
   ↓
IF APPROVED:
→ Auto-push to GitHub production
→ Builder done

IF REJECTED:
→ Kickback with issues
→ Builder fixes and says "ready" again
→ Process repeats
```

---

## ⚠️ **CRITICAL RULES**

### **For Builder:**
- ❌ **NEVER** say "ready" until ALL critical fixes done
- ❌ **NEVER** say "ready" until ALL tests pass
- ❌ **NEVER** skip creating `REVIEWER_KICKBACK.md`
- ✅ **ALWAYS** document every fix thoroughly
- ✅ **ALWAYS** provide test evidence

### **For Reviewer:**
- ✅ **MUST** review Builder's `REVIEWER_KICKBACK.md`
- ✅ **MUST** verify fixes actually work
- ✅ **MUST** re-run security tests
- ✅ **MUST** approve or reject with clear feedback
- ✅ **MUST** update documents with review status

---

## 🎯 **SUCCESS = APPROVAL**

**Builder succeeds when Reviewer approves.**

**Reviewer approves when all criteria met.**

**Code deploys automatically when approved.**

---

**THIS WORKFLOW IS MANDATORY. NO EXCEPTIONS.**

