---
description: Review CLAUDE.md and Plan.md for consistency, gaps, and drift from the codebase
argument-hint: [claude | plan | code | all] (default: all)
allowed-tools: Read, Grep, Glob, Bash(ls:*), Bash(cat:*), Bash(git log:*), Bash(git diff:*), Bash(git status:*)
---

# Doc Review — Pickle Ball Score

You are reviewing the project documentation for **Pickle Ball Score**.
Scope requested: **$ARGUMENTS** (if empty, treat as `all`).

- `claude` → review `CLAUDE.md` only
- `plan` → review `Plan.md` only
- `code` → check docs against the actual codebase only (section 3)
- `all` → do every section below

**This is a read-only review. Do NOT edit any file.** Report findings, then ask whether to apply fixes.

## Step 1 — Load context
1. Read `CLAUDE.md` (project root) and `planning/Plan.md` in full.
2. If `src/` exists, list the folder tree (skip `node_modules`, `.next`) and read `package.json`, `tailwind.config.ts`, `src/middleware.ts`, `.env.example`, `playwright.config.ts` if present.
3. If this is a git repo, check recent changes to the docs with `git log --oneline -10 -- CLAUDE.md planning/Plan.md`.

## Step 2 — Check the documents

### 2a. CLAUDE.md
- Stays concise (aim under ~100 lines) and points to `Plan.md` as the source of truth; flag content that duplicates Plan.md in detail
- Tech stack, commands, folder rules, Access Rule, and Theme Rule all match Plan.md
- Commands listed are ones that actually exist (or are planned in Phase 0)
- Workflow steps are clear and actionable

### 2b. Plan.md internal consistency
Cross-check every section against the others:
- **Features (§3) ↔ Data Model (§5):** every field mentioned in a feature exists in a type, and every type is used by a feature
- **Features ↔ Scaffold (§6):** every page/feature has a route, component folder, store, and lib file where needed
- **Features ↔ Phases (§7):** every feature has tasks in some phase; no task references something undefined
- **Features ↔ Testing (§8 + scaffold `tests/`):** every feature has a matching E2E spec and, for `src/lib` logic, a unit test
- **Confirmed Decisions (§9)** are reflected everywhere (knockout only, team score only, level dropdown, players on multiple teams, 3rd place, INR, manual announce, login required, single test account)
- **Open Questions (§9a):** list any still unanswered, and any that are answered elsewhere but not moved to Confirmed Decisions
- **Decisions Log (§11):** every major technical choice in the doc is logged
- No contradictions (e.g. a route listed as public in one place and protected in another, minimum team counts, status lifecycles)

### 2c. Quality of requirements
- Vague or untestable requirements (missing limits, validation rules, error messages, empty states)
- Edge cases not covered (e.g. deleting a player used in teams, editing a tournament after the draw, odd team counts, end date before start date, session expiry mid-action)
- Theme rule: any UI area without pickleball styling guidance
- Accessibility and mobile responsiveness mentioned where relevant

## Step 3 — Docs vs code (skip if no `src/` folder yet)
- Folders/files in the scaffold that are missing, and files in code that aren't in the scaffold
- Tasks marked `[x]` in Plan.md that aren't actually implemented, and implemented work still marked `[ ]`
- `package.json` scripts match the commands in CLAUDE.md
- Theme tokens in `tailwind.config.ts` match Plan.md §4; grep `src/components` for hard-coded hex colors
- `src/middleware.ts` public routes match exactly: `/login`, `/signup`, `/contact`, `/sponsors`
- `.env.example` contains the test account variables
- Spot-check interactive components for `data-testid`
- Any library in `package.json` not listed in the Tech Stack

## Step 4 — Report
Respond with this structure:

### Summary
2–3 sentences on overall doc health, plus counts by severity.

### Findings
| # | Severity | File & Section | Issue | Suggested Fix |
|---|---|---|---|---|

Severity levels:
- 🔴 **High** — contradiction or missing piece that would cause wrong code to be built
- 🟡 **Medium** — gap, ambiguity, or drift that will cause rework
- 🟢 **Low** — wording, formatting, or nice-to-have

Order by severity, then by file. Quote at most a short phrase from the doc to locate each issue.

### Open Questions for the Owner
Anything that needs a human decision (not a fix you can make yourself).

### Next Step
End by asking: "Want me to apply the 🔴 and 🟡 fixes now?" — and wait for the answer.
