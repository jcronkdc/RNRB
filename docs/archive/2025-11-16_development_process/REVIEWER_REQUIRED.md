# ⚠️ CRITICAL: REVIEWER APPROVAL REQUIRED

## 🚨 THIS IS A MANDATORY PROCESS

**ALL CODE CHANGES MUST BE REVIEWED BY THE REVIEWER AGENT BEFORE:**
- ✅ Marking tasks as COMPLETE
- ✅ Moving to next task (S3, S4, etc.)
- ✅ Deploying to production
- ✅ Marking vulnerabilities as RESOLVED

---

## 🔄 The Review Cycle

```
1. Builder implements fixes
   ↓
2. Builder updates PLANNING_KICKBACK.md and BUILDER_PLAN.md
   ↓
3. Builder says "ready for review"
   ↓
4. ⚠️ REVIEWER MUST REVIEW CODE ← YOU ARE HERE
   ↓
5. Reviewer approves ✅ OR rejects ❌ OR requests changes 🔄
   ↓
6. If approved → Builder can proceed
   If rejected → Builder fixes and sends back
   If changes needed → Builder fixes and sends back
```

---

## 📋 When Code Comes to Reviewer

The Builder Agent will send code to you when:

1. **After Critical Vulnerabilities Fixed** (REQUIRED)
   - All 🔴 Critical vulnerabilities addressed
   - Builder says "ready for review"

2. **After High Severity Fixes** (REQUIRED)
   - All 🟠 High severity vulnerabilities addressed
   - Builder says "ready for review"

3. **After Task Completion** (REQUIRED)
   - S1, S2, S3, etc. tasks completed
   - Builder says "ready for review"

4. **When Builder Needs Help** (RECOMMENDED)
   - Builder encounters blockers
   - Builder needs clarification

---

## ✅ What Reviewer Must Do

When Builder says "ready for review":

### 1. Read Documents (REQUIRED)
- [ ] Read `PLANNING_KICKBACK.md` - See what was fixed
- [ ] Read `BUILDER_PLAN.md` - See what tasks were completed
- [ ] Read `REVIEWER_KICKBACK.md` if exists - Previous feedback

### 2. Verify Code Changes (REQUIRED)
- [ ] Check that fixes match documented vulnerabilities
- [ ] Verify code changes are correct
- [ ] Ensure no new vulnerabilities introduced
- [ ] Check code quality and best practices

### 3. Run Tests (REQUIRED)
- [ ] `pnpm typecheck` - Must pass with 0 errors
- [ ] `pnpm lint` - Must pass (warnings OK, errors not)
- [ ] `pnpm build` - Must build successfully
- [ ] Security tests - Must pass if they exist

### 4. Make Decision (REQUIRED)
- [ ] ✅ APPROVE - If everything is correct
- [ ] ❌ REJECT - If fixes are wrong or incomplete
- [ ] 🔄 REQUEST CHANGES - If minor improvements needed

### 5. Update Documents (REQUIRED)
- [ ] Update `PLANNING_KICKBACK.md` with review status
- [ ] Update `BUILDER_PLAN.md` with review status
- [ ] Create/Update `REVIEWER_KICKBACK.md` with feedback

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

After review, you MUST update:

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
6. **BUILDER CANNOT PROCEED WITHOUT YOUR APPROVAL**

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
3. Reviews code → Checks that DEMO_BYPASS was removed ✅
4. Runs tests → `pnpm typecheck` passes ✅, `pnpm lint` passes ✅
5. Updates PLANNING_KICKBACK.md → Marks Critical #1 as ✅ APPROVED
6. Updates BUILDER_PLAN.md → Marks S2 as ✅ REVIEWED
7. Creates REVIEWER_KICKBACK.md → Documents approval

**Result:** Builder can proceed to next task

---

**Remember:** The review process is MANDATORY. Builder cannot proceed without your approval.


