# CLAUDE.md — Pickle Ball Score

> **Source of truth:** `planning/Plan.md` holds the full project plan (features, data model, phases, tasks).
> Read `planning/Plan.md` before starting any task. Update its checkboxes and "Decisions Log" as work is completed.

## Project Summary
Frontend-only Next.js app (login required, single test account) to create players and doubles teams (2 players; players can be on multiple teams), create tournaments, randomly draw a knockout bracket (with a 3rd Place match), record team scores, and manually announce Champion, Runner-up, and 3rd Place with ₹ INR cash prizes after the tournament end date.

## Tech Stack
- **Framework:** Next.js (App Router) + TypeScript (strict)
- **Styling:** Tailwind CSS with a custom pickleball theme (see `planning/Plan.md` → Theme)
- **State/Persistence:** Zustand + `persist` middleware backed by IndexedDB (`idb-keyval`) — no backend
- **Forms/Validation:** React Hook Form + Zod
- **Other libs:** lucide-react (icons), date-fns (dates), canvas-confetti (results)
- **Testing:** Playwright with TypeScript (E2E) + Vitest for pure logic (`src/lib`)

## Commands
```bash
npm run dev          # start dev server (http://localhost:3000)
npm run build        # production build
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npm run test:unit    # Vitest
npm run test:e2e     # Playwright
```

## Folder Rules (full scaffold in `planning/Plan.md`)
- `src/app/` → routes only; keep pages thin
- `src/components/ui/` → generic themed primitives (Button, Card, Input…)
- `src/components/<feature>/` → feature components (players, teams, tournaments, matches, results)
- `src/lib/` → pure logic (draw, scoring, standings, image utils) — no React
- `src/store/` → Zustand stores, one per domain
- `src/lib/schemas/` → Zod schemas (source of truth); `src/types/` → re-exports `z.infer` types only
- `tests/e2e/` → Playwright specs + page objects in `tests/e2e/pages/`

## Coding Conventions
- TypeScript strict, no `any`; derive types from Zod schemas (`z.infer`)
- Functional components, named exports, PascalCase components, camelCase utils
- All business logic (random draw, winner calc) lives in `src/lib/` and is unit tested
- IDs via `crypto.randomUUID()` (except fixed ids in `src/lib/sampleData.ts`); timestamps as ISO strings; calendar dates (`startDate`/`endDate`) as `YYYY-MM-DD`, compared as local dates
- Money: always INR, formatted via `src/lib/currency.ts` (`en-IN`)
- Images: compress/resize client-side before storing (JPEG; max ~800px for photos and logos, ~1600px for tournament banners)
- Every interactive element gets a `data-testid` for Playwright
- Accessible: labels on inputs, alt text on images, keyboard navigable

## Access Rule (mandatory)
- Public routes only: `/login`, `/signup`, `/contact`, `/sponsors` (in `src/app/(public)/`)
- Every other route lives in `src/app/(protected)/` and is guarded by `src/middleware.ts`
- Only the test account in `.env.local` can log in (see `.env.example`); all auth goes through `src/lib/auth.ts`
- E2E specs reuse the logged-in `storageState` from `tests/e2e/global-setup.ts`

## Theme Rule (mandatory)
Whole app must feel pickleball: optic-yellow ball, court blue/green, white court lines, kitchen zone motifs. Use only theme tokens from `tailwind.config.ts` — no ad-hoc hex colors in components.

## Automatic Change Review
A `Stop` hook (`.claude/settings.json` → `.claude/hooks/review-changes.mjs`) reviews what changed since the last review each time Claude finishes, in the background, and writes `change-review-<date>-<slug>.md` to the repo root (git-ignored). Disable with `SKIP_CHANGE_REVIEW=1`; change model with `CHANGE_REVIEW_MODEL`. Errors go to `.git/claude-review.log`.

## Workflow for Claude
1. Check `planning/Plan.md` → find the next unchecked task in the current phase
2. Implement → add/update tests → run `lint`, `typecheck`, `test:unit`, `test:e2e`
3. Tick the task in `planning/Plan.md`; log any new decision in its Decisions Log
4. Respect "Confirmed Decisions" in `planning/Plan.md`; do not add a backend, auth, or new libraries without noting it there first
