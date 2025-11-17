# 🔁 Review Kickbacks Tracker

**Role:** Reviewer Agent (GPT-5 Codex High)
**Purpose:** Track review feedback and kickbacks for the Builder.
**Last Updated:** 2025-11-11 16:08:00 CST

---

## 🧭 Process Overview

1. **Planner** prepares context and writes instructions for the Builder in `HANDOFF_TO_BUILDER.md`.
2. **Builder** reads `HANDOFF_TO_BUILDER.md`, implements the requested changes, and updates the codebase.
3. **Builder** records their outputs in the relevant implementation file(s) **and** updates `HANDOFF_TO_REVIEWER.md`.
4. **Reviewer** (this file) inspects the work. Any issues are logged below as **Kickbacks**.
5. **Builder** resolves each kickback from this file, marks it complete, and hands the cycle back to the Reviewer.

---

## 📣 Builder Prompt

> **Read this before writing any code.**
> 
> 1. Open `HANDOFF_TO_BUILDER.md` to get the current task list from the Planner.
> 2. Make only the code/documentation changes requested there. Do **not** edit reviewer tracking files unless explicitly told to do so.
> 3. When your implementation is finished:
>    - Save the code changes in the appropriate project files.
>    - Document what you built and any tests you ran in `HANDOFF_TO_REVIEWER.md`.
>    - Check the **Open Kickbacks** list below. If you resolved any, move them to **Resolved Kickbacks** with a brief note (include the kickback ID).
> 4. Notify the Planner/Reviewer that the build phase is complete so the review cycle can begin.

---

## 🚨 Open Kickbacks

_No open kickbacks._

---

## ✅ Resolved Kickbacks

1. **Z21-KB1 – Prisma JSON handling in events helper** ✅ RESOLVED
   - File: `packages/db/src/helpers/events.ts`  
   - Issue: JSON field `lineup` used `Prisma.DbNull` and update path cast to `object`.
   - Fix Applied: 
     - Changed `Prisma.DbNull` to `Prisma.JsonNull` in create path
     - Updated create path to cast via `input.lineup as unknown as Prisma.InputJsonValue`
     - Fixed update path to properly handle undefined vs null vs array cases
     - Used conditional: `input.lineup !== undefined ? (input.lineup ? cast : JsonNull) : undefined`
   - Verification: ✅ Typecheck passes

2. **Z21-KB2 – Prisma JSON handling in podcasts helper** ✅ RESOLVED
   - File: `packages/db/src/helpers/podcasts.ts`  
   - Issue: Update path cast `input.guests` to `object` instead of proper Prisma types.
   - Fix Applied:
     - Updated update path to cast through `unknown` to `Prisma.InputJsonValue`
     - Added proper null handling: `input.guests !== undefined ? (input.guests ? cast : JsonNull) : undefined`
     - Matches the create-path approach for consistency
   - Verification: ✅ Typecheck passes

---

*Reviewer updates this file after each review cycle. Builder must check this file before starting any new work.*
