# Reviewer Workflow - Critical Process Document

## ⚠️ CRITICAL: This Document Defines the Review Process

**Purpose:** Ensure all code changes are properly reviewed before deployment.

---

## 🔄 Review Cycle Workflow

```
Builder Agent
    ↓
    Implements fixes
    Updates PLANNING_KICKBACK.md
    Updates BUILDER_PLAN.md
    ↓
    Says "ready for review"
    ↓
Reviewer Agent (YOU)
    ↓
    Reviews code changes
    Verifies fixes work
    Runs security tests
    Checks code quality
    ↓
    APPROVES ✅ OR REQUESTS CHANGES ❌
    ↓
    Updates documents with review status
    Creates REVIEWER_KICKBACK.md
    ↓
    If APPROVED: Builder can mark as COMPLETE
    If CHANGES NEEDED: Builder fixes and sends back
```

---

## 📋 When Builder Sends Code to Reviewer

The Builder Agent MUST send code to Reviewer in these situations:

### 1. **After Critical Vulnerabilities Fixed** (REQUIRED)
- After fixing ALL 🔴 Critical vulnerabilities
- Before marking vulnerabilities as RESOLVED
- Before deployment consideration

### 2. **After High Severity Fixes** (REQUIRED)
- After fixing 🟠 High severity vulnerabilities
- Before marking as complete

### 3. **After Task Completion** (REQUIRED)
- After completing S1, S2, S3, etc. tasks
- Before marking tasks as COMPLETE in BUILDER_PLAN.md
- Before moving to next task

### 4. **When Blocked** (RECOMMENDED)
- If Builder encounters blockers
- If Builder needs clarification
- If Builder finds additional issues

---

## ✅ Reviewer Responsibilities

When Builder says "ready for review", you MUST:

### 1. Read Updated Documents
- [ ] Read `PLANNING_KICKBACK.md` - Check what was fixed
- [ ] Read `BUILDER_PLAN.md` - Check task completion status
- [ ] Review `REVIEWER_KICKBACK.md` if it exists (previous feedback)

### 2. Verify Code Changes
- [ ] Check that fixes match the documented vulnerabilities
- [ ] Verify code changes are correct
- [ ] Ensure no new vulnerabilities introduced
- [ ] Check code quality and best practices

### 3. Run Tests
- [ ] Run security tests (`tests/security/failing-tests.spec.ts`)
- [ ] Run TypeScript type checking (`pnpm typecheck`)
- [ ] Run linting (`pnpm lint`)
- [ ] Run build (`pnpm build`)
- [ ] Verify all tests pass

### 4. Update Documents
- [ ] Update `PLANNING_KICKBACK.md` with review status
- [ ] Update `BUILDER_PLAN.md` with review status
- [ ] Create/update `REVIEWER_KICKBACK.md` with feedback

### 5. Provide Clear Feedback
- [ ] APPROVE if fixes are correct and complete
- [ ] REJECT if fixes are incorrect or incomplete
- [ ] REQUEST CHANGES if fixes need improvement
- [ ] Document specific issues found

---

## ✅ Approval Criteria

Code is APPROVED when:

- ✅ All Critical vulnerabilities are fixed correctly
- ✅ All security tests pass
- ✅ No TypeScript errors
- ✅ No critical linting errors
- ✅ Code follows security best practices
- ✅ No new vulnerabilities introduced
- ✅ Documentation is updated

---

## ❌ Rejection Criteria

Code is REJECTED when:

- ❌ Critical vulnerabilities not properly fixed
- ❌ Security tests still fail
- ❌ New vulnerabilities introduced
- ❌ Code quality issues
- ❌ Missing required fixes
- ❌ Tests don't pass

---

## 🔄 Change Request Process

If changes are needed:

1. **Document Issues** in `REVIEWER_KICKBACK.md`
2. **Update Status** in `PLANNING_KICKBACK.md` (mark as 🔄 IN PROGRESS)
3. **Update Status** in `BUILDER_PLAN.md` (mark task as 🔄 NEEDS REVISION)
4. **Provide Specific Feedback** on what needs to be fixed
5. **Builder Fixes Issues** and sends back for review
6. **Review Again** until approved

---

## 📝 Document Updates Required

After review, update:

### PLANNING_KICKBACK.md
- Mark vulnerabilities as ✅ APPROVED or ❌ REJECTED
- Add review notes and test results
- Update overall status

### BUILDER_PLAN.md
- Mark tasks as ✅ REVIEWED/APPROVED or 🔄 NEEDS REVISION
- Add review notes
- Update task status

### REVIEWER_KICKBACK.md (Create/Update)
- Document review findings
- List approved fixes
- List rejected fixes with reasons
- Provide specific feedback
- Include test results

---

## 🚨 Critical Reminders

1. **NEVER approve code without verification**
2. **ALWAYS run tests before approving**
3. **ALWAYS update documents with review status**
4. **ALWAYS provide clear feedback**
5. **ALWAYS require fixes for rejected code**

---

## 📊 Review Status Indicators

Use these consistently:

- ✅ **APPROVED** - Fixes verified, tests pass, ready to proceed
- ❌ **REJECTED** - Fixes incorrect or incomplete, needs revision
- 🔄 **IN PROGRESS** - Under review or being fixed
- ⚠️ **NEEDS CHANGES** - Minor issues, fix and resubmit
- 📋 **PENDING REVIEW** - Waiting for reviewer

---

## Example Review Process

**Builder says:** "ready for review"

**Reviewer does:**
1. Reads PLANNING_KICKBACK.md → Sees Critical #1 marked as ✅ FIXED
2. Reads BUILDER_PLAN.md → Sees S2 task marked as complete
3. Reviews code → Checks that DEMO_BYPASS was removed
4. Runs tests → Security test #1 now passes ✅
5. Updates PLANNING_KICKBACK.md → Marks Critical #1 as ✅ APPROVED
6. Updates BUILDER_PLAN.md → Marks S2 as ✅ REVIEWED
7. Creates REVIEWER_KICKBACK.md → Documents approval

**Result:** Builder can proceed to next task

---

**Remember:** The review process is CRITICAL for security and quality. Never skip it.


