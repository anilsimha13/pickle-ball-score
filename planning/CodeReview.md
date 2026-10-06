# Code Review — Pickle Ball Score Phases 1–7

**Reviewer:** Lead Engineer  
**Date:** 2026-10-06  
**Branch reviewed:** feat/results (b0dcda7)  
**Files read:** auth.ts, middleware.ts, useSession.ts, all schemas, draw.ts, scoring.ts, bracket.ts, results.ts, standings.ts, sponsors.ts, validation.ts, all stores, Button.tsx, Modal.tsx, Tooltip.tsx, ConfirmDialog.tsx, Bracket.tsx, BracketRound.tsx, AnnounceButton.tsx, Confetti.tsx, backup.ts, storage.ts, rng.ts, dates.ts, Input.tsx + E2E pages

## Summary

The codebase is well-structured: strict TypeScript, consistent Zod-first types, correct Zustand + IndexedDB persistence, and thorough unit tests (98 passing). Business logic libraries (draw, scoring, standings, results) are clean and accurately implement the spec. Five issues need fixing before merge — two are correctness bugs visible to end users, two are data-integrity gaps, and one is an accessibility contract violation.

---

## Critical Issues (must fix before merge)

### CR-001 — aria-disabled Button still fires onClick via keyboard

**File:** `src/components/ui/Button.tsx`  
**Line:** ~39  
**Issue:** When `aria-disabled="true"`, the Button adds `pointer-events-none` (blocks mouse) but still spreads `{...props}` including `onClick`. A keyboard user who tabs to the button and presses Enter or Space will trigger the action despite the button appearing disabled.  
**Fix:** In the Button, intercept and suppress click/key activation when aria-disabled:
```tsx
onClick: isAriaDisabled ? (e) => e.preventDefault() : props.onClick,
onKeyDown: isAriaDisabled ? (e) => { if (e.key === 'Enter' || e.key === ' ') e.preventDefault() } : props.onKeyDown,
```
Remove `pointer-events-none` from the aria-disabled class string (it hides the tooltip on hover too, breaking the disabled-with-reason UX).  
**Assigned to:** Phase 1 (UI primitives engineer)

---

### CR-002 — Duplicate pair error message shows raw UUIDs, not player names

**File:** `src/store/useTeamStore.ts`  
**Line:** ~39–41  
**Issue:** `hasDuplicatePair(p1, p2, teams)` receives player IDs. The error message `${p1} & ${p2} are already team ${dup.name}` renders UUIDs like `"3f2a1b… & 7c9d4e… are already team Smash Bros"` — unreadable to users.  
**Fix:** Resolve player names before building the message. Look up players from `usePlayerStore.getState().players`:
```ts
const players = usePlayerStore.getState().players
const n1 = players.find(p => p.id === p1)?.name ?? p1
const n2 = players.find(p => p.id === p2)?.name ?? p2
throw new Error(`${n1} & ${n2} are already team ${dup.name}`)
```
**Assigned to:** Phase 3 (teams engineer)

---

### CR-003 — `recordWalkover` bypasses downstream edit check

**File:** `src/store/useTournamentStore.ts`  
**Line:** ~192–226  
**Issue:** Plan §3.5 requires that editing a completed match (including walkovers) is "allowed only if every match it feeds has no games saved and no walkover yet." `recordWalkover` does not call `canEditCompletedMatch` before overwriting a completed-by-walkover match. A walkover on a semi-final could overwrite the winner after the Final already has scores.  
**Fix:** Add the downstream check at the top of `recordWalkover`:
```ts
if (match.status === 'Completed') {
  if (!canEditCompletedMatch(t.matches, matchId)) {
    throw new Error('Cannot change walkover: a downstream match already has scores')
  }
}
```
**Assigned to:** Phase 6 (scoring engineer)

---

### CR-004 — `editMatchScores` skips tournament status → `Completed` transition

**File:** `src/store/useTournamentStore.ts`  
**Line:** ~229–254  
**Issue:** `saveGameScores` checks whether Final + ThirdPlace are both Completed and transitions the tournament to `Completed` (lines 181–185). `editMatchScores` omits this check entirely. If a re-edit of the final match determines its winner, the tournament remains `InProgress` instead of transitioning to `Completed`, blocking the Announce Results button forever.  
**Fix:** Add the same status-transition block that `saveGameScores` uses, after `advanceWinner`:
```ts
let newStatus: Tournament['status'] = t.status
const final = getFinalMatch(matches)
const third = getThirdPlaceMatch(matches)
if (final?.status === 'Completed' && third?.status === 'Completed') {
  newStatus = 'Completed'
}
return { ...t, matches, status: newStatus }
```
**Assigned to:** Phase 6 (scoring engineer)

---

### CR-005 — `backup.ts` uses `z.any()` for tournaments — import doesn't validate tournament data

**File:** `src/lib/backup.ts`  
**Line:** 7, 14  
**Issue:** The comment says "until the full schema is available in Phase 4," but Phase 4 is complete and `tournamentSchema` is exported from `src/lib/schemas/tournament.ts`. The current `z.any()` means a corrupted backup tournament object passes validation, potentially overwriting valid data with garbage.  
**Fix:** Replace `anyTournamentSchema` with the real import:
```ts
import { tournamentSchema } from '@/lib/schemas/tournament'
// ...
tournaments: z.array(tournamentSchema),
```
Also replace `unknown[]` / `{ id: string }[]` casts with `Tournament[]`.  
**Assigned to:** Phase 8 (settings engineer)

---

## Major Issues (should fix before merge)

### CR-010 — Modal uses static `id="modal-title"` — duplicates if two modals mount

**File:** `src/components/ui/Modal.tsx`  
**Line:** 80  
**Issue:** `<h2 id="modal-title">` is a fixed string. If two modals ever render simultaneously (e.g. a toast-triggered confirm while another dialog is open), duplicate IDs break `aria-labelledby` and violate HTML spec.  
**Fix:** Add `const titleId = useId()` inside Modal and use `id={titleId}` on the `<h2>` and `aria-labelledby={titleId}` on the dialog div.  
**Assigned to:** Phase 1

---

### CR-011 — Dead `validateGame` function with incorrect tie handling

**File:** `src/lib/scoring.ts`  
**Line:** 4–13  
**Issue:** `validateGame` (lines 4–13) is never called anywhere; the real exported function is `validateGameScore`. The dead function has a logic error on line 7: `if (teamA === teamB) return null` — a tie returns `null` (valid) instead of an error. If called by accident, ties would pass silently.  
**Fix:** Delete lines 1–13 (`validateGame` and the `MatchResult` type alias, which is also unused). Keep `validateGameScore` and the `GameScore` export.  
**Assigned to:** Phase 6

---

### CR-012 — `useSession` doesn't check expiry on mount, only on window focus

**File:** `src/hooks/useSession.ts`  
**Line:** 19–33  
**Issue:** The focus-event listener only fires when the window regains focus. A tab that has been open with an expired session will not be caught until the next focus event. Per Plan §3.0: "useSession re-checks expiresAt on window focus" — this is intentional — but there's no mount check. A user who leaves the tab idle until session expires, then clicks an in-page element (without changing tabs), would remain on the page with an expired session until they alt-tab away and back.  
**Fix:** Call `checkExpiry()` once synchronously inside the effect (before attaching the listener) so an already-expired session is caught immediately.  
**Assigned to:** Phase 2 (auth engineer)

---

### CR-013 — `safeRedirect` returns `/dashboard` for blocked paths instead of `/`

**File:** `src/lib/auth.ts`  
**Line:** 64  
**Issue:** Plan §3.0 says: "unsafe redirect values fall back to `/`." When the redirect value is `/login` or `/signup`, `safeRedirect` returns `/dashboard` instead of `/`. The two routes lead to the same place for a logged-in user (both go to dashboard via middleware), but the intent in the spec and unit-test description is `/`.  
**Fix:** Return `'/'` instead of `'/dashboard'` on line 64.  
**Assigned to:** Phase 2

---

## Minor / Nice-to-have

### CR-020 — Hex colors in SVG inline markup (Confetti, Spinner, EmptyState)

**Files:** `src/components/results/Confetti.tsx:13`, `src/components/ui/Spinner.tsx:21,26`, `src/components/ui/EmptyState.tsx:22`  
**Issue:** These files use hex literals (`#D7F04A`, `#1F2937`, `#1E5AA8`, `#F28C28`). Canvas and SVG `fill` attributes cannot read CSS custom properties without `getComputedStyle`, so Tailwind tokens are not applicable here. The violation of the "no hex in components" rule is unavoidable for these specific use cases.  
**Fix:** Add a one-line comment `// Canvas/SVG fill — CSS vars not supported here` above each occurrence to document the intentional exception. No code change required.  
**Assigned to:** Phase 7 / Phase 1

---

### CR-021 — `createTournamentSchema` allows missing `sponsors` field

**File:** `src/lib/schemas/tournament.ts`  
**Line:** 58–63  
**Issue:** `createTournamentSchema` is an omit of `tournamentSchema` and doesn't set a default for `sponsors`. The store patches this with `sponsors: input.sponsors ?? []`, but the schema itself will reject a `CreateTournamentInput` without `sponsors`. A future caller that passes a valid tournament object without sponsors will get a Zod error instead of a sensible default.  
**Fix:** Add `.extend({ sponsors: z.array(sponsorSchema).max(20).default([]) })` to `createTournamentSchema`.  
**Assigned to:** Phase 4

---

### CR-022 — `announceEligibility` doesn't guard against non-Completed tournament status

**File:** `src/lib/results.ts`  
**Line:** 16–34  
**Issue:** The function checks individual match statuses but not `tournament.status`. In theory a tournament could have both final matches Completed (status-wise) but be in a weird state if prior status transitions misfired. A status guard `tournament.status === 'Completed'` would make the eligibility check more robust.  
**Fix:** Add early check: `if (tournament.status === 'Announced') return { eligible: false, reasons: ['Already announced'] }` and consider requiring `tournament.status === 'Completed'` as a pre-condition.  
**Assigned to:** Phase 7

---

## Passed Checks

- ✅ `safeRedirect`: correctly rejects `//`, backslash, control chars, non-`/` prefix, same-origin check via `new URL`
- ✅ Cookie attributes: `SameSite=Lax`, `Path=/`, `Max-Age` correct for both durations (86400/2592000)
- ✅ `assertSession()` throws `Error('SESSION_EXPIRED')` — specific and catchable
- ✅ `useSession` guard only runs on non-public paths
- ✅ Middleware matcher correctly excludes `_next/static`, `_next/image`, `favicon.ico`, `images/`, `sample/`
- ✅ All Zod schemas match Plan §3.11 field rules and error messages exactly
- ✅ Bracket: `bracketSize`, `byeCount`, `roundCount` all correct; at-most-one-bye-per-match guaranteed
- ✅ `validateGameScore` correctly implements: `W===T && L<=T-2` OR `W>T && W-L===2`; tied scores caught first
- ✅ `announceEligibility` lists all reasons simultaneously (not short-circuit)
- ✅ `runnerUpId` correctly derived as the non-winner finalist
- ✅ `computeStandings`: byes excluded, walkovers add 0 points, sort order correct
- ✅ `normaliseName`: trim + lowercase + collapse spaces — correct
- ✅ `aggregateSponsors`: latest startDate wins logo/website conflict; sponsor appears in every tier it's held
- ✅ Every write action in player/team/tournament/contact stores calls `assertSession()` first — except `addMessage` which correctly omits it (public Contact form)
- ✅ Storage quota error propagates from IndexedDB via the persist middleware
- ✅ `deletePlayer` checks team membership before deleting
- ✅ `deleteTeam` checks tournament membership before deleting
- ✅ `addTeam` validates same-player check, case-insensitive unique name, order-insensitive duplicate pair
- ✅ `addTeamToTournament` runs `hasSharedPlayer` conflict check with correct error message
- ✅ `Button`: `aria-disabled` uses attribute (not native `disabled`); stays focusable for keyboard (tab stops work)
- ✅ Tooltip fires on `onFocusCapture` and `onMouseEnter` — both hover and focus covered
- ✅ `Modal`: Esc closes, focus trapped via Tab cycle, returns focus to trigger on close
- ✅ `Input`: visible `<label htmlFor>`, error linked via `aria-describedby`, `aria-invalid` set
- ✅ `BracketRound`: `<section aria-labelledby>` with `<ol>` of matches — correct semantics
- ✅ No `any` types in source files (except the intentional `z.any()` in backup.ts noted in CR-005)
- ✅ All IDs use `crypto.randomUUID()`
- ✅ `formatINR` used consistently in Podium, PrizeTable, TournamentCard
- ✅ E2E pages use `data-testid` selectors only — no CSS class or text selectors found
- ✅ Page Object Model implemented cleanly; storageState auth wired correctly
- ✅ `todayLocalDate` / `isOnOrAfter` are pure and correctly use local time (not UTC)
- ✅ `Confetti` checks `prefers-reduced-motion` before firing

---

## Issue Summary

| Severity | Count | IDs |
|---|---|---|
| Critical (must fix) | 5 | CR-001 through CR-005 |
| Major (should fix) | 4 | CR-010 through CR-013 |
| Minor | 3 | CR-020 through CR-022 |
