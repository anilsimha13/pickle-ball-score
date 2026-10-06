# Plan.md — Pickle Ball Score

## 1. Overview
**Pickle Ball Score** is a frontend-only web app for organizing doubles pickleball tournaments. After logging in, users create players and teams of two, create tournaments with sponsors and prize money in Indian Rupees, randomly draw a knockout bracket, record team scores, and manually announce the Champion, Runner-up, and 3rd place once the tournament has ended.

**Scope (v1):** Frontend only, fully functional, with data saved in the browser (IndexedDB). No backend. Login is frontend-only and allows **one test account**; every action in the app requires being logged in.

> ℹ️ **v1 limitation:** all data (players, teams, tournaments, sponsors, contact messages) lives in the IndexedDB of the browser it was created in. Public pages and the organizer only see data from that same browser/device. Export/import (3.8) is the way to move data.
>
> 🔒 **Privacy:** player ages and photos and contact details stay readable in this browser after logout, and export files contain the same data. A privacy notice is shown in the footer and in Settings (3.8).

---

## 2. Tech Stack
| Area | Choice | Notes |
|---|---|---|
| Framework | Next.js (latest, App Router) + TypeScript strict | `src/` directory layout; pages that read stores are client components |
| Styling | Tailwind CSS | Custom pickleball theme tokens (Section 4) |
| Fonts | `next/font/google` | Bebas Neue (headings/scores), Inter (body) |
| State | Zustand + `persist` | Storage adapter → IndexedDB via `idb-keyval` (photos exceed localStorage limits) |
| Auth | Next.js `middleware.ts` + session cookie | Single test account from env vars; demo-grade only (see 3.0) |
| Forms | React Hook Form + Zod | Zod schemas in `src/lib/schemas` are the **single source of types** (`z.infer`) |
| Icons | lucide-react | Plus custom pickleball SVGs |
| Dates | date-fns | Local-date comparisons (see 5) |
| Confetti | canvas-confetti (+ `@types/canvas-confetti`) | Results page only; skipped when `prefers-reduced-motion` |
| Unit tests | Vitest (+ `fake-indexeddb`) | For `src/lib` pure logic; `node` environment; `fake-indexeddb/auto` for `storage` / `backup` tests |
| E2E tests | Playwright + TypeScript | Page Object Model |
| Lint/Format | ESLint + Prettier (+ `eslint-config-prettier`) | |

---

## 3. Features & Requirements

### 3.0 Access & Authentication
**Public pages (no login needed):** Login, Sign Up, Contact Us, Sponsors (view only).
**Everything else is protected:** dashboard, players, teams, tournaments, scoring, results, settings. Visiting any protected route while logged out redirects to `/login?redirect=<original-path>`, and after login the user returns to that page.

**Test account (the only account that can log in):**
- Credentials come from `.env.local` → `NEXT_PUBLIC_TEST_USER_EMAIL`, `NEXT_PUBLIC_TEST_USER_PASSWORD`, `NEXT_PUBLIC_TEST_USER_NAME`
- Defaults in `.env.example`: `test@pickleballscore.in` / `Pickle@123` / `Test Organizer`
- Any other email/password → error "Invalid email or password" (same message for both, no hint which is wrong)

**Login page (`/login`):** email + password, show/hide password toggle, "Remember me" (session 30 days instead of 24 hours), link to Sign Up, pickleball-court hero illustration.

**Sign Up page (`/signup`):** full form — Name, Email, Phone, Password, Confirm Password — with Zod validation (rules in 3.11). Because only the test account can log in for now, a valid submission **does not create an account and does not save the details anywhere**; it only shows a themed notice: "New registrations open soon. Please use the test account to explore." (Confirmed Decision #11).

**Session handling:**
- On successful login, set cookie `pbs_session` (URL-encoded JSON: `{ email, name, expiresAt }`) with `Path=/; SameSite=Lax; Max-Age=86400` (or `2592000` with Remember me), and mirror it in `useAuthStore`
- `src/middleware.ts` checks the cookie on every request; missing, unparseable or expired (`expiresAt` < server time) → redirect to `/login?redirect=<path>`. The matcher excludes `_next/static`, `_next/image`, `favicon.ico`, `/images/*`, `/sample/*`
- **Safe redirect:** `redirect` is only honoured if it starts with `/`, does not start with `//`, contains no `\` or control characters, resolves to the same origin via `new URL(value, location.origin)`, and is not `/login` or `/signup`; otherwise the user goes to `/` (dashboard). Implemented as `safeRedirect()` in `src/lib/auth.ts`
- Logged-in users visiting `/login` or `/signup` are redirected to the dashboard
- **Session expiry mid-action (protected areas only):**
  - Every action in the protected stores (`usePlayerStore`, `useTeamStore`, `useTournamentStore`, and the Settings actions of `useContactStore`: mark read/unread, delete) first calls `assertSession()` from `src/lib/auth.ts` (stores can't use hooks)
  - `useSession` re-checks `expiresAt` on window focus, **only on `(protected)` routes**
  - If expired, the action is cancelled, a toast shows "Your session has expired. Please log in again.", and the user is sent to `/login?redirect=<current-path>`. Unsaved form input is not preserved in v1
  - **Exempt:** all `(public)` pages and `useContactStore.addMessage`, so the public Contact form works while logged out
- Navbar shows the user's name + **Logout** (clears cookie & store, redirects to `/login`). Logged-out navbar on public pages shows **Login** and **Sign Up** links
- Auth logic lives in `src/lib/auth.ts` behind a small interface (`login`, `logout`, `getSession`, `assertSession`, `safeRedirect`) so a real backend can replace it later

**Done when:** any protected route requested while logged out redirects to `/login?redirect=…`; a valid login lands on the original path; an expired, missing or tampered cookie is treated as logged out; unsafe `redirect` values fall back to `/`; all public pages work while logged out, including submitting the Contact form.

> ⚠️ This is demo-grade auth: credentials are bundled in the frontend via `NEXT_PUBLIC_*` and the cookie is unsigned. Acceptable for v1 only; real auth is Future Scope.

### 3.1 Players
- Players are a **separate entity** and **can belong to multiple teams**
- Fields: **Name**, **Age**, **Place** (city/club), **Level** (dropdown), **Photo** (rules in 3.11)
- Level dropdown options: `Beginner`, `Intermediate`, `Advanced`, `Pro`
- Create / edit / delete players; player list with search (by name or place, case-insensitive)
- Player names don't have to be unique. Wherever players are listed or picked (list, `PlayerPicker`, team detail), show **photo · name · place · level** so same-named players can be told apart
- Player detail page shows all teams the player belongs to
- **Delete is blocked** while the player is on **any** team. The Delete button is shown disabled-with-reason (3.13): "Remove {name} from all teams before deleting." Deleting a team first is the only way to free a player
- Player edits (name, photo, etc.) are always allowed and show everywhere the player appears, including past tournaments

**Done when:** a player can be created, edited, searched and viewed; validation errors match 3.11; deleting a player who is on a team shows the blocked reason and leaves the data unchanged.

### 3.2 Teams
- Create / edit / delete a team (exactly **2 different players**)
- Team fields: **Team Name** (unique, trimmed, case-insensitive), **Team Photo**, **Player 1**, **Player 2**
- In the team form, each player slot lets you **pick an existing player** or **create a new one inline**. Inline-created players are only saved when the team itself saves successfully; cancelling or a failed save leaves no new players behind
- The same pair of players cannot form two different teams (order doesn't matter)
- Team list with search; team detail page showing players, tournaments played, and record (W/L — walkovers count, bye matches don't)
- **Delete is blocked** while the team is in **any** tournament (any status). Disabled-with-reason message: "This team is part of {n} tournament(s) and can't be deleted."
- **Changing Player 1 / Player 2:**
  - Blocked once the team is in any tournament that is past `Draft` (message: "Players are locked because this team is in a drawn tournament.")
  - If the team is only in `Draft` tournaments, the change re-runs the shared-player check (3.4) for each of them and the duplicate-pair check; on conflict the save fails with the conflicting tournament named
- Team name and photo can always be edited

**Done when:** a team with 2 different players and a unique name saves; a duplicate pair, a duplicate name or the same player picked twice each show their exact 3.11 error; cancelling a form with an inline-created player leaves no new player; player changes are locked for teams in drawn tournaments; deleting a team in a tournament is blocked.

### 3.3 Tournaments
- Create / edit / delete tournament
- Fields: **Name**, **Banner Image**, **Start Date**, **End Date** (≥ Start Date), **Venue**, **Points per game** (11 / 15 / 21, win by 2), **Best of** (1 or 3 games)
- Dates in the past are allowed (e.g. to record an event that already happened)
- Format: **Knockout (single elimination)** only
- **Prize Pool (₹ INR):** Champion, Runner-up, 3rd Place — whole rupees, each **at least ₹1 (₹0 not allowed)**, and **Champion ≥ Runner-up ≥ 3rd Place**
- **Sponsors:** list of { Name, Logo, Website (optional), Tier (Title / Gold / Silver) }, 0–20 per tournament, names unique within the tournament
- No date restriction on scoring: matches can be scored any time after the draw. Dates only gate the announcement (3.6)

**Status lifecycle** — one way only, never moves backwards. **The draw is final: a drawn tournament never returns to `Draft`.**

| Status | Entered when | Editable | Delete |
|---|---|---|---|
| `Draft` | Tournament created | Everything, including the team list | Allowed (confirm) |
| `Drawn` | "Generate Draw" succeeds (4–50 teams) | Name, banner, venue, dates, prizes, sponsors; **re-shuffle** the draw. Team list, Points per game and Best of are locked | Allowed (confirm) |
| `InProgress` | First game score **or walkover** is saved in any match | Name, banner, venue, dates, prizes, sponsors; scores (see 3.5 edit rule). Draw locked | Blocked |
| `Completed` | Final **and** 3rd Place matches are both `Completed` | Same as `InProgress` | Blocked |
| `Announced` | "Announce Results" confirmed (3.6) | Nothing — fully read-only | Blocked |

- Status badges use the colours in Section 4
- Blocked actions use the disabled-with-reason pattern (3.13)

**Done when:** a tournament saves only when it passes 3.11; each status allows exactly the edits and deletes in the table above, and locked fields show their reason; status changes happen only on the listed triggers.

### 3.4 Adding Teams & Random Draw
- Add existing teams to a tournament: **minimum 4, maximum 50 teams** (a 3rd-place match needs at least 4). The team list can only be changed in `Draft`
- **Rule:** two teams that share a player cannot be in the same tournament (error: "{Team A} and {Team B} share {Player} — only one can enter.")
- **"Generate Draw"** (enabled only in `Draft` with 4–50 teams) builds the bracket and moves the tournament to `Drawn`:
  1. Bracket size `S` = next power of 2 ≥ team count (max 64); number of rounds `R = log2(S)`; byes `B = S − teamCount`
  2. Shuffle the teams with Fisher–Yates (seeded RNG in test mode)
  3. Randomly pick `B` **different** first-round matches to get a bye — **never more than one bye per first-round match** (always possible because `B < S/2`). This guarantees every semi-final has two real teams, so the 3rd Place match always gets filled
  4. Fill the slots in order: a bye match gets one team, every other match gets two
- **Bye matches:** `isBye: true`, created as `Completed` with the single team as `winnerId` and no games. They are shown as "BYE" in the bracket and **don't count** in standings or W/L
- **Re-shuffle** (redo steps 2–4) allowed while `Drawn`; locked once the first score or walkover is saved
- **Round names** depend on how many teams are left: `Round of 64`, `Round of 32`, `Round of 16`, `Quarterfinal`, `Semifinal`, `Final` (from `bracket.ts`)
- The **3rd Place match** shares the Final's round number (`R`) with `position: 1` (the Final is `position: 0`), and is identified by `type: 'ThirdPlace'`
- Winners auto-advance; semi-final losers auto-fill the 3rd Place match
- Bracket view shows every round plus the 3rd Place match; scrolls horizontally on small screens with round headers kept in view (screen-reader structure in 3.13)

**Done when:** for any team count from 4 to 50, the bracket has `S` slots and `S − n` byes with at most one per first-round match; every semi-final has two real teams; the same seed always gives the same bracket; re-shuffle is unavailable after the first score or walkover.

### 3.5 Scoring (team score only)
- Per match: enter each game's score for both teams (whole numbers 0–99)
- A match can only be scored once both teams are known (no TBD slot) and the tournament isn't `Announced`
- **Valid game score** (`T` = Points per game, `W`/`L` = winner/loser points):
  - `W = T` and `L ≤ T − 2`, **or**
  - `W > T` and `W − L = 2` (deuce)
  - Ties are never valid. Examples at 11: `11–9` ✔, `13–11` ✔, `11–10` ✘, `14–11` ✘, `12–9` ✘
- **Best of 1:** exactly one game. **Best of 3:** play until a team has 2 game wins; a 3rd game can only be entered at 1–1; extra games are blocked
- Error messages:
  - "Game {n}: the winner must reach {T} points and win by 2."
  - "Game {n}: scores can't be tied."
  - "This match is already decided — remove the extra game."
- **Match states:** `Scheduled` (both teams known, no games) → `Live` (≥ 1 game saved, no winner yet) → `Completed` (winner decided). Matches with a TBD team show as "Waiting for {round} winner"
- **Walkover (forfeit / withdrawal):** on a `Scheduled` or `Live` match with both teams known, the organizer can choose **"Record walkover"**, pick the team that advances, and confirm ("{Team} advances by walkover. Any games entered for this match are removed."). The match becomes `Completed` with `isWalkover: true`, no games, and the chosen winner advances. Shown as "W/O" in the bracket
- **Editing a completed match** (including a walkover) is allowed only if every match it feeds has no games saved and no walkover yet. For a semi-final that means **both** the Final and the 3rd Place match.
  - The edit must save a **complete, valid result** (new game scores or a walkover). Games can be replaced but the result can't be cleared, so a `Completed` match never goes back to `Live` and the tournament status never moves backwards
  - If the edit changes the winner, the next-round (and 3rd Place) slots are updated
  - Not allowed once `Announced`
- **Team standings** per tournament: matches played, won, lost, points for, points against, point difference. Bye matches are excluded; a walkover counts as played and won/lost but adds no points for or against. Sort by wins ↓, point difference ↓, points for ↓, then team name A–Z

**Done when:** every example score in this section is accepted or rejected as listed, with the listed messages; best-of limits are enforced; winners and walkover winners advance; semi-final losers fill the 3rd Place match; blocked edits show their reason; standings match a hand-calculated seeded tournament.

### 3.6 Results & Announcement (manual)
- The **"Announce Results"** button is enabled only when **today's local date is on or after the End Date** (the End Date itself counts) **AND** the Final and 3rd Place matches are both `Completed` (i.e. status `Completed`)
- Before then, the button is disabled-with-reason (3.13) and its tooltip lists what's missing: "Available from {End Date}", "Final not completed", "3rd Place match not completed"
- Clicking it opens a confirm dialog, then saves `results` (champion, runner-up, 3rd place, `announcedAt`) and sets the status to `Announced`. The tournament becomes read-only
- Results page: **Champion**, **Runner-up**, **3rd Place** podium, team & player photos, **prize amounts in ₹** (e.g. ₹1,00,000 via `Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })`), sponsor banner, and a `canvas-confetti` animation (skipped when `prefers-reduced-motion`)
- Before announcement the results page shows an empty state: "Results will appear here once they're announced."
- Announced tournaments show a permanent results card on the tournament page and dashboard

**Done when:** Announce is disabled with the correct reasons the day before the End Date and enabled on the End Date once both final matches are Completed; after confirming, the tournament is read-only and the podium shows the right teams with ₹-formatted prizes.

### 3.7 Dashboard (Home)
- Quick stats: total players, total teams, **active tournaments** (`Drawn` + `InProgress`), **completed tournaments** (`Completed` + `Announced`)
- **Not started:** `Draft` / `Drawn` tournaments sorted by Start Date; any whose Start Date has already passed show a `kitchen` "Start date passed" badge. **Live:** `InProgress` tournaments. **Recent champions:** last 5 `Announced` tournaments by `announcedAt`
- Buttons: Create Player, Create Team, Create Tournament
- Empty state for a new user: "No tournaments yet — create your first player to get started." with the Create buttons

**Done when:** for the seeded dataset, the stat counts and lists match the status definitions above; an empty store shows the empty state.

### 3.8 Data Management (Settings)
- **Privacy notice** (Settings and footer): "All data is stored only in this browser and stays here after you log out. Use Reset all data to remove it."
- **Export:** downloads `pickle-ball-score-backup-YYYY-MM-DD.json` → `{ schemaVersion: 1, exportedAt, players, teams, tournaments, contactMessages }`. The session is never exported. Before downloading, a confirm dialog warns: "This file contains personal data (ages, photos, contact details). Store it safely."
- **Import (merge):**
  1. The file is checked against `backupSchema` (Zod). Invalid JSON, the wrong shape, or an unsupported `schemaVersion` → error "This file isn't a valid Pickle Ball Score backup." and nothing changes
  2. Records are merged **by `id`**: new ids are added; when an id already exists, the **imported record replaces the existing one**
  3. The merged result must pass the integrity checks (`validation.ts`): unique team names, no duplicate player pairs, every reference (team → player, tournament → team, match → team) exists, no shared players within a tournament, prize and limit rules
  4. It must also respect the **status locks** (3.2, 3.3):
     - An existing `Announced` tournament can't be changed
     - An existing tournament past `Draft` can only be replaced by a version with the same `teamIds`, `pointsPerGame`, `bestOf` and draw (same match ids and pairings), and not with a lower status
     - An existing team's `playerIds` can't change while it is in a tournament past `Draft`
  5. If any check fails, the **whole import is rolled back** and the errors are listed
  6. On success a toast shows: "Imported {n} records ({a} added, {u} updated)."
- **Load sample data:** merged with the same rules (sample records have fixed ids, so loading twice updates instead of duplicating). The confirm dialog says: "Sample records you've edited will be reset to their original values."
- **Reset all data:** confirm dialog ("This permanently deletes all players, teams, tournaments and contact messages."). Clears all four stores; the user stays logged in
- **Contact messages** tab: newest first, unread badge count, mark as read/unread, delete (confirm), empty state "No messages yet."
- **Storage full:** if IndexedDB rejects a write (quota), toast "Storage is full. Remove some photos, or export and reset your data." and the change is not saved

**Done when:** export → reset → import restores identical data; an invalid file changes nothing; an import that breaks an integrity check or status lock rolls back fully and lists the errors; reset empties all four stores without logging out.

### 3.9 Contact Us (public, `/contact`)
- Form: Name, Email, Phone (optional), Subject (dropdown: General, Tournament Enquiry, Sponsorship, Support), Message (rules in 3.11)
- `?subject=Sponsorship` (or any other subject value) pre-selects the subject
- Zod validation; on submit, save to `useContactStore` (IndexedDB) and show the success message "Thanks! Your message has been received." Works while logged out (no session check)
- A small `muted` note under the form: "Demo: messages are stored on this device only."
- Side panel with contact details (email, phone, address placeholders) styled as a court card
- The logged-in user reads submissions in Settings → Contact messages (same browser only — see v1 limitation in Section 1)

**Done when:** a logged-out visitor can submit a valid message and see the success message; invalid input shows the 3.11 errors; `?subject=` pre-selects the subject; the message appears unread in Settings → Contact messages after logging in.

### 3.10 Sponsors (public, `/sponsors`)
- **Everything public:** read-only showcase of sponsors from **every tournament in any status** (including `Draft`)
- De-duplicated by **normalised name** (trimmed, lower-case, repeated spaces collapsed) using `normaliseName()` in `src/lib/sponsors.ts`. The same function enforces unique sponsor names within a tournament (3.11)
- Grouped by tier: **Title → Gold → Silver**. A sponsor appears in **every tier section it has held**, and each section lists the tournaments it sponsored at that tier
- Each card shows logo, name, website link (opens in a new tab, `rel="noopener noreferrer"`), and tournaments. If tournaments disagree on logo or website, use the one from the tournament with the latest Start Date
- Empty state: "No sponsors yet — be the first!" with the Become a Sponsor button
- "Become a Sponsor" button → `/contact?subject=Sponsorship`
- Adding/editing sponsors stays inside the tournament form (login required)

**Done when:** a sponsor used at two tiers across tournaments appears in both tier sections with the correct tournaments; names differing only in case or spacing are merged; an empty store shows the empty state; the page works while logged out.

### 3.11 Validation Rules
All rules live in Zod schemas (`src/lib/schemas`). Text is trimmed before validation. Errors show under the field, linked via `aria-describedby`.

| Form | Field | Rule | Error message |
|---|---|---|---|
| Login | Email / Password | Valid email; password required | "Enter a valid email" / "Password is required" |
| Sign Up | Name | 2–50 chars | "Name must be 2–50 characters" |
| Sign Up | Email | Valid email | "Enter a valid email" |
| Sign Up | Phone | `^[6-9]\d{9}$` | "Enter a valid 10-digit Indian mobile number" |
| Sign Up | Password | ≥ 8 chars, upper, lower, number, special | "Use 8+ characters with upper & lower case, a number and a symbol" |
| Sign Up | Confirm Password | Matches Password | "Passwords don't match" |
| Player | Name | Required, 2–50 chars (not unique) | "Name must be 2–50 characters" |
| Player | Age | Whole number 5–99 | "Age must be between 5 and 99" |
| Player | Place | Required, 2–50 chars | "Place must be 2–50 characters" |
| Player | Level | One of the 4 levels | "Select a level" |
| Player / Team / Tournament / Sponsor | Photo / Banner / Logo | Optional; JPEG, PNG or WebP; ≤ 5 MB before compression; stored as JPEG — ≤ 1600px wide for tournament banners, ≤ 800px for photos and logos | "Use a JPEG, PNG or WebP image under 5 MB" |
| Team | Name | Required, 2–40 chars, unique (case-insensitive) | "A team with this name already exists" |
| Team | Player 1 / Player 2 | Both required, different | "Pick two different players" |
| Team | Pair | Pair not already used by another team | "{Player 1} & {Player 2} are already team {Team}" |
| Tournament | Name | Required, 3–80 chars | "Name must be 3–80 characters" |
| Tournament | Venue | Required, 2–100 chars | "Venue must be 2–100 characters" |
| Tournament | Start / End Date | Both required; End ≥ Start; past dates allowed | "End date can't be before the start date" |
| Tournament | Prizes | Whole rupees, ₹1 – ₹1,00,00,000; Champion ≥ Runner-up ≥ 3rd Place | "Prize must be at least ₹1" / "Runner-up prize can't exceed the Champion prize" / "3rd Place prize can't exceed the Runner-up prize" |
| Tournament | Sponsors | 0–20; name 2–60 chars, unique within the tournament (compared with `normaliseName()`); tier required; website optional `http(s)://` URL | "Sponsor name already added" / "Enter a valid website URL" |
| Tournament | Teams | 4–50; no shared players | "Add at least 4 teams" / "Maximum 50 teams" / shared-player message (3.4) |
| Score | Game points | Whole numbers 0–99; scoring rules in 3.5 | See 3.5 |
| Contact | Name / Email | 2–50 chars / valid email | as above |
| Contact | Phone | Optional; `^[6-9]\d{9}$` if given | "Enter a valid 10-digit Indian mobile number" |
| Contact | Subject | Required | "Select a subject" |
| Contact | Message | 10–1000 chars, live character counter | "Message must be 10–1000 characters" |

### 3.12 Loading, Empty States & Feedback
- **Loading:** store data loads from IndexedDB asynchronously. Every data page waits for `useHydrated()`; until then it shows the pickleball Spinner (lists show `Skeleton` cards). Empty states and "not found" are only shown **after** hydration
- **Not found:** an unknown `playerId` / `teamId` / `tournamentId` / `matchId` after hydration shows a themed `NotFoundCard` ("We couldn't find that {player/team/tournament/match}.") with a link back to its list. Unknown routes use the same card via `app/not-found.tsx`
- Pages that read stores are client components (`'use client'`); route `page.tsx` files stay thin wrappers
- Every list or data view has a themed empty state (pickleball illustration + one-line message + main action): players, teams, tournaments, tournament team list ("Add at least 4 teams to generate the draw"), bracket before draw ("Generate the draw to see the bracket"), standings before any scores, results before announcement, dashboard, sponsors, contact messages
- Success, warning and error feedback uses `Toast` (auto-dismiss after 4 s; errors stay until closed)
- Destructive actions (delete, reset, re-shuffle, walkover, announce) always go through `ConfirmDialog`

### 3.13 Accessibility & Responsive
- WCAG 2.1 AA colour contrast (text-on-colour rules in Section 4)
- Every input has a visible label; errors linked via `aria-describedby`; images have `alt` text (decorative SVGs `aria-hidden`)
- Fully keyboard operable; visible focus ring (Section 4); modals trap focus, close on `Esc`, and return focus to the button that opened them
- **Disabled-with-reason pattern:** blocked actions use `aria-disabled="true"` (not the `disabled` attribute), stay focusable, and show the reason in a `Tooltip` on hover **and** focus, linked via `aria-describedby`. Used for Delete (players/teams/tournaments), Generate Draw, Re-shuffle, Announce Results, locked fields
- **Bracket semantics:** each round is a `<section aria-labelledby>` with a round heading and an ordered list (`<ol>`) of matches. Each match has an accessible name such as "Semifinal 1: Smash Bros 11–9, 11–7 Net Ninjas, completed", "Quarterfinal 3: Dink Masters, bye" or "… walkover"
- `prefers-reduced-motion`: no confetti; the spinner fades instead of bouncing
- Mobile-first, supported from 360px wide: navbar collapses into a menu; tables (standings, messages) scroll horizontally; the bracket scrolls horizontally; tap targets ≥ 44px; score entry uses numeric keypads (`inputMode="numeric"`)

---

## 4. Theme — Pickleball (mandatory across entire app)
Only these tokens may be used in components (no hard-coded hex values).

| Token | Value | Usage | Text on it |
|---|---|---|---|
| `ball` | `#D7F04A` (optic yellow) | Primary actions, highlights, Announced badge | `net` |
| `ball-dark` | `#B5CC2E` | Hover on primary | `net` |
| `court` | `#1E5AA8` (court blue) | Headers, nav, secondary buttons, focus ring on light backgrounds | `line` |
| `court-green` | `#2E7D4F` | Court cards, success, Completed badge | `line` |
| `kitchen` | `#F28C28` (orange) | Warnings, "Live"/InProgress badges, card kitchen strip | `net` |
| `danger` | `#C53030` | Errors, destructive buttons (delete, reset) | `line` |
| `line` | `#FFFFFF` | Court-line borders/dividers on coloured surfaces, text on dark | — |
| `net` | `#1F2937` | Body text, dark surfaces | `line` |
| `muted` | `#6B7280` | Secondary text, Draft badge, BYE / W/O slots, input borders | `line` |
| `surface` | `#FFFFFF` | Form cards, tables, modals | `net` |
| `bg` | `#F3F6EE` | Page background (behind the hole pattern) | `net` |
| `gold` / `silver` / `bronze` | `#D4A017` / `#A8B2BD` / `#B8733A` | Podium paddles, medal icons only | `net` |

**Rules:**
- Never put `line` (white) text on `ball`, `ball-dark` or `kitchen` — use `net`
- `line` borders are only used on coloured surfaces (`court`, `court-green`, `net`); on `surface` use `muted`/`court` borders
- Focus ring: 2px `court` on light backgrounds, `ball` on dark backgrounds

**UI area guidance:**
| Area | Styling |
|---|---|
| Navbar | `court` background, `line` text, `ball` underline for the active link |
| Footer | `net` background, `line` text, privacy notice in small type |
| Buttons | Primary `ball` / hover `ball-dark`; Secondary `court`; Destructive `danger`; aria-disabled = 50% opacity + `not-allowed` cursor |
| Forms | `surface` card with a `kitchen` top strip, `muted` input borders, `court` focus ring, `danger` error text with an icon |
| Tables (standings, messages) | `court` header with `line` text, alternating `bg` rows, numbers in Bebas Neue |
| Status badges | Draft `muted`, Drawn `court`, InProgress/Live `kitchen`, Completed `court-green`, Announced `ball` |
| Modals / ConfirmDialog | `surface` card with a `kitchen` strip; destructive confirm button in `danger` |
| Toasts | Success `court-green`, warning `kitchen`, error `danger` |
| Auth & public pages | Court hero illustration; form on a court card |
| Loading | Bouncing-ball Spinner; `Skeleton` cards in `bg` with a subtle pulse (none under reduced motion) |
| Empty states / Not found | Pickleball/paddle illustration, `muted` text, primary `ball` button |
| Bracket | Court-line connectors; BYE and W/O slots dashed `muted`; Live match `kitchen` outline |

**Visual motifs:**
- Court cards: `court`/`court-green` fill with `line` borders and a `kitchen` strip accent
- Subtle pickleball hole-pattern SVG background on `bg`
- Loading spinner = bouncing pickleball; paddle icons for actions
- Bracket connectors drawn like court lines; scoreboard-style font for scores (Bebas Neue for headings/scores, Inter for body)
- Podium styled as `gold` / `silver` / `bronze` paddles

---

## 5. Data Model
**Source of truth:** Zod schemas in `src/lib/schemas/*`. Types are derived with `z.infer` and re-exported from `src/types/index.ts` — never written by hand. The shapes below are reference only.

- IDs: `crypto.randomUUID()` (exception: `sampleData` uses fixed ids so it can be re-loaded and merged)
- Timestamps (`createdAt`, `announcedAt`, `exportedAt`, `expiresAt`): ISO-8601 strings
- Calendar dates (`startDate`, `endDate`): `YYYY-MM-DD` strings, compared as **local** dates (`src/lib/dates.ts`)

```ts
type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Pro';

interface Player {
  id: string; name: string; age: number; place: string;
  level: SkillLevel; photo?: string;      // compressed JPEG data URL (≤ 800px)
  createdAt: string;
}

interface Team {
  id: string; name: string; photo?: string;
  playerIds: [string, string];            // references Player.id (players reusable across teams)
  createdAt: string;
}

interface Sponsor {
  id: string; name: string; logo?: string; website?: string;
  tier: 'Title' | 'Gold' | 'Silver';
}

interface Prizes { champion: number; runnerUp: number; thirdPlace: number; } // whole INR, each ≥ 1, champion ≥ runnerUp ≥ thirdPlace

type TournamentStatus = 'Draft' | 'Drawn' | 'InProgress' | 'Completed' | 'Announced';

interface Tournament {
  id: string; name: string; bannerImage?: string; venue: string; // banner ≤ 1600px
  startDate: string; endDate: string;     // YYYY-MM-DD, endDate ≥ startDate, past dates allowed
  pointsPerGame: 11 | 15 | 21; bestOf: 1 | 3;
  prizes: Prizes; sponsors: Sponsor[];    // 0–20 sponsors
  teamIds: string[];                      // 4–50 to draw
  status: TournamentStatus;
  matches: Match[];
  results?: { championId: string; runnerUpId: string; thirdPlaceId: string; announcedAt: string };
  createdAt: string;
}

interface GameScore { teamA: number; teamB: number; }

interface Match {
  id: string;
  round: number;                          // 1 = first round … R = final (ThirdPlace also uses R)
  position: number;                       // slot within the round (0-based); Final = 0, ThirdPlace = 1
  type: 'Knockout' | 'ThirdPlace';
  isBye: boolean;                         // true = first-round bye: one team, no games, auto-Completed
  isWalkover: boolean;                    // true = decided by walkover: no games, winner chosen by organizer
  teamAId: string | null; teamBId: string | null; // null = TBD (not decided yet), or the empty side of a bye
  games: GameScore[];                     // always empty when isBye or isWalkover
  winnerId?: string;
  status: 'Scheduled' | 'Live' | 'Completed';
}
```
```ts
interface Session { email: string; name: string; expiresAt: string; }

type ContactSubject = 'General' | 'TournamentEnquiry' | 'Sponsorship' | 'Support';
// Display labels via SUBJECT_LABELS in src/lib/schemas/contact.ts ('TournamentEnquiry' → "Tournament Enquiry")

interface ContactMessage {
  id: string; name: string; email: string; phone?: string;
  subject: ContactSubject;
  message: string; read: boolean; createdAt: string;
}

interface Backup {
  schemaVersion: 1; exportedAt: string;
  players: Player[]; teams: Team[]; tournaments: Tournament[]; contactMessages: ContactMessage[];
}
```
Currency is fixed to INR app-wide (constant in `src/lib/currency.ts`), so it isn't stored per tournament.

---

## 6. Project Scaffold
```
pickle-ball-score/
├── .env.example           # test account credentials + NEXT_PUBLIC_TEST_SEED (copy to .env.local)
├── .gitignore             # node_modules, .next, .env.local, tests/e2e/.auth/, test-results/, playwright-report/
├── CLAUDE.md
├── README.md
├── planning/
│   ├── Plan.md            # this file — source of truth
│   └── Review.md          # latest plan review (plan-reviewer agent)
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── playwright.config.ts
├── vitest.config.ts       # environment: node
├── public/
│   ├── images/            # logo, placeholders, court textures, empty-state illustrations
│   └── sample/            # sample data photos
├── src/
│   ├── middleware.ts                  # route protection via pbs_session cookie
│   ├── app/
│   │   ├── layout.tsx                 # theme, fonts, navbar, footer
│   │   ├── not-found.tsx              # themed NotFoundCard for unknown routes
│   │   ├── globals.css
│   │   ├── (public)/                  # no login required
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   ├── contact/page.tsx
│   │   │   └── sponsors/page.tsx
│   │   └── (protected)/               # login required (middleware)
│   │       ├── page.tsx               # dashboard
│   │       ├── players/
│   │       │   ├── page.tsx
│   │       │   ├── new/page.tsx
│   │       │   └── [playerId]/{page.tsx, edit/page.tsx}
│   │       ├── teams/
│   │       │   ├── page.tsx
│   │       │   ├── new/page.tsx
│   │       │   └── [teamId]/{page.tsx, edit/page.tsx}
│   │       ├── tournaments/
│   │       │   ├── page.tsx
│   │       │   ├── new/page.tsx
│   │       │   └── [tournamentId]/
│   │       │       ├── page.tsx           # overview, sponsors, prizes, status
│   │       │       ├── edit/page.tsx
│   │       │       ├── teams/page.tsx     # add/remove teams (Draft only)
│   │       │       ├── bracket/page.tsx   # draw + bracket + 3rd place
│   │       │       ├── matches/[matchId]/page.tsx  # score entry + walkover
│   │       │       ├── standings/page.tsx
│   │       │       └── results/page.tsx
│   │       └── settings/page.tsx      # data tools + contact messages
│   ├── components/
│   │   ├── auth/        # LoginForm, SignupForm, LogoutButton, UserMenu
│   │   ├── public/      # ContactForm, ContactInfoCard, SponsorShowcase, SponsorTierSection
│   │   ├── ui/          # Button, Card, Input, Select, Modal, Badge, StatusBadge, ImageUpload, Toast, Spinner, Skeleton, ConfirmDialog, Tooltip, EmptyState, NotFoundCard, Table, HydrationGate
│   │   ├── layout/      # Navbar, MobileMenu, Footer (privacy notice), PageHeader, CourtBackground
│   │   ├── dashboard/   # StatCard, TournamentStrip (not started/live), RecentChampions
│   │   ├── players/     # PlayerForm, PlayerCard, PlayerList, PlayerPicker (photo · name · place · level), LevelSelect
│   │   ├── teams/       # TeamForm, TeamCard, TeamList, TeamRecord
│   │   ├── tournaments/ # TournamentForm, SponsorFields, PrizeFields, TournamentCard, TeamPicker
│   │   ├── matches/     # Bracket, BracketRound, BracketMatch, ThirdPlaceMatch, ScoreEntry, WalkoverDialog, Scoreboard, StandingsTable
│   │   ├── results/     # AnnounceButton, Podium, PrizeTable, SponsorStrip, Confetti (canvas-confetti)
│   │   └── settings/    # PrivacyNotice, ExportButton, ImportButton, SampleDataButton, ResetDataButton, ContactMessagesTable
│   ├── lib/
│   │   ├── auth.ts          # login/logout/getSession/assertSession/safeRedirect, cookie helpers, test-account check
│   │   ├── sponsors.ts      # normaliseName, aggregate + de-duplicate sponsors across tournaments (by tier)
│   │   ├── draw.ts          # bracket size, Fisher–Yates shuffle, one-bye-per-match placement
│   │   ├── bracket.ts       # advance winners, fill 3rd place match, round names, downstream edit checks
│   │   ├── scoring.ts       # game/match validation, walkover, winner determination, match state
│   │   ├── standings.ts     # team standings + tie-break sort, team W/L record
│   │   ├── results.ts       # announce eligibility (+ missing reasons), podium calc
│   │   ├── tournament.ts    # status transitions, editable-field/delete rules per status
│   │   ├── validation.ts    # shared-player conflicts, duplicate pairs, delete-block checks, integrity + status-lock checks
│   │   ├── backup.ts        # export, import merge-by-id with rollback
│   │   ├── dates.ts         # local-date helpers (today, isOnOrAfter)
│   │   ├── rng.ts           # seeded RNG (NEXT_PUBLIC_TEST_SEED, ignored in production builds) / Math.random
│   │   ├── currency.ts      # INR formatter (en-IN)
│   │   ├── image.ts         # checkImageFile (type/size, pure) + resize/compress to JPEG data URL
│   │   ├── storage.ts       # idb-keyval adapter for Zustand persist, quota error handling; exports DB/store names + persist key/envelope used by the E2E seed
│   │   ├── sampleData.ts    # fixed-id sample dataset (grown phase by phase)
│   │   └── schemas/         # auth.ts, contact.ts, player.ts, team.ts, tournament.ts, match.ts, backup.ts (Zod)
│   ├── store/
│   │   ├── useAuthStore.ts
│   │   ├── useContactStore.ts
│   │   ├── usePlayerStore.ts
│   │   ├── useTeamStore.ts
│   │   └── useTournamentStore.ts
│   ├── hooks/               # useSession (focus check on protected routes), useHydrated, usePlayer, useTeam, useTournament
│   └── types/index.ts       # re-exports z.infer types from lib/schemas
└── tests/
    ├── unit/                # auth, sponsors, draw, bracket, scoring, standings, results, tournament, validation, backup, storage, image, rng, dates, currency, schemas
    └── e2e/
        ├── global-setup.ts  # logs in once, saves storageState → tests/e2e/.auth/user.json
        ├── fixtures/        # test images, seed.ts (writes sampleData into IndexedDB, then reloads), invalid backup files
        ├── pages/           # Page Objects: LoginPage, SignupPage, ContactPage, SponsorsPage, DashboardPage, PlayersPage, TeamsPage, TournamentPage, BracketPage, ScorePage, StandingsPage, ResultsPage, SettingsPage
        ├── auth.spec.ts
        ├── contact.spec.ts
        ├── sponsors.spec.ts
        ├── dashboard.spec.ts
        ├── players.spec.ts
        ├── teams.spec.ts
        ├── tournaments.spec.ts
        ├── draw.spec.ts
        ├── scoring.spec.ts  # incl. walkovers and standings
        ├── results.spec.ts
        └── settings.spec.ts
```

---

## 7. Phased Task Plan

### Phase 0 — Setup
- [ ] `create-next-app` (TS, App Router, Tailwind, ESLint, `src/`)
- [ ] Install: zustand, idb-keyval, react-hook-form, zod, @hookform/resolvers, date-fns, lucide-react, canvas-confetti
- [ ] Install dev: @playwright/test, vitest, fake-indexeddb, prettier, eslint-config-prettier, @types/canvas-confetti
- [ ] Add npm scripts (`typecheck`, `test:unit`, `test:e2e`)
- [ ] `.gitignore` and `.env.example` (test account + `NEXT_PUBLIC_TEST_SEED`)
- [ ] Create folder scaffold from Section 6
- [ ] Configure Vitest (`node` environment) and Playwright (baseURL, webServer `npm run dev`, Desktop Chromium + Pixel 7 projects, global setup)

### Phase 1 — Theme & Layout
- [ ] Tailwind theme tokens (all of Section 4) + fonts via `next/font`
- [ ] UI primitives in `components/ui` with `data-testid` support, incl. `Tooltip`, `EmptyState`, `NotFoundCard`, `Skeleton`, `Table`, `StatusBadge`, `ConfirmDialog`
- [ ] Disabled-with-reason pattern (`aria-disabled` + Tooltip) in `Button`
- [ ] `useHydrated` + `HydrationGate` (spinner/skeleton until IndexedDB hydration finishes); `app/not-found.tsx`
- [ ] Navbar (responsive with MobileMenu), Footer with privacy notice, court-pattern background, PageHeader, pickleball Spinner (reduced-motion variant)
- [ ] Dashboard shell

### Phase 2 — Auth & Public Pages
- [ ] `lib/auth.ts` (`safeRedirect` incl. backslash/same-origin checks, `assertSession`, cookie attributes) + `useAuthStore` + unit tests
- [ ] `middleware.ts` route protection with `?redirect=` support and asset matcher; route groups `(public)` / `(protected)`
- [ ] `useSession` focus check on protected routes only (toast + redirect)
- [ ] Login page (show/hide password, remember me, error state)
- [ ] Sign Up page (validation + "registrations open soon" notice; nothing saved)
- [ ] Navbar user menu + Logout; logged-out links
- [ ] Contact Us page + `useContactStore` (`addMessage` without session check) + `?subject=` pre-select + demo note
- [ ] E2E: `auth.spec.ts` (incl. unsafe redirects, expired cookie, client-side expiry), `contact.spec.ts` (incl. logged-out submission)

### Phase 3 — Players & Teams
- [ ] Zod schemas → `z.infer` types; `usePlayerStore`, `useTeamStore` with IndexedDB persistence, `assertSession()` in actions, quota error handling
- [ ] `lib/storage.ts` exports DB/store names + persist envelope; unit tests with `fake-indexeddb`
- [ ] `lib/sampleData.ts` (players + teams) and `tests/e2e/fixtures/seed.ts` (seed → reload)
- [ ] `ImageUpload` with `checkImageFile` (+ unit tests) and client-side compression (800px / 1600px for banners); `LevelSelect` dropdown
- [ ] Player create/edit/list/search/detail; delete blocked while on any team; not-found handling
- [ ] Team form with `PlayerPicker` (choose existing or create inline, saved only with the team), list, search, detail, delete blocked while in any tournament
- [ ] Validation (3.11): 2 different players, unique team name, no duplicate pairs + unit tests
- [ ] E2E: `players.spec.ts`, `teams.spec.ts` (incl. blocked deletes, no orphan inline players)

### Phase 4 — Tournaments & Sponsors
- [ ] Tournament + Sponsor Zod schemas; `useTournamentStore` with `assertSession()` in actions
- [ ] `lib/tournament.ts` status rules (editable fields, delete permissions) + unit tests
- [ ] Tournament form incl. sponsors (0–20, `normaliseName` uniqueness), ₹ prizes (≥ ₹1, Champion ≥ Runner-up ≥ 3rd), dates (End ≥ Start, past allowed), settings; fields locked by status
- [ ] Tournament list + overview page (status badge, sponsor strip, prize table); delete in Draft/Drawn only
- [ ] TeamPicker to add/remove teams (Draft only, 4–50, shared-player conflict check)
- [ ] Team player lock / re-validation when the team is in Draft tournaments (3.2)
- [ ] Sponsors page: `lib/sponsors.ts` (`normaliseName`, aggregation by tier) + unit tests, tier grouping, empty state, Become a Sponsor link
- [ ] Extend `sampleData` with Draft tournaments + sponsors (incl. a sponsor at two tiers and a case/spacing variant)
- [ ] E2E: `tournaments.spec.ts`, `sponsors.spec.ts`

### Phase 5 — Draw & Bracket
- [ ] `lib/rng.ts` (seed ignored in production) + `lib/draw.ts` (bracket size, shuffle, one bye per first-round match, `isBye`) + unit tests for 4, 5, 7, 8, 33 and 50 teams (seeded RNG)
- [ ] `lib/bracket.ts` round names (up to Round of 64) + 3rd Place placement (`position: 1`) + unit tests
- [ ] Generate draw (→ `Drawn`) / re-shuffle; lock after first score or walkover
- [ ] Bracket view (court-line style, BYE slots, accessible round/match structure, horizontal scroll on mobile) including 3rd Place match
- [ ] E2E: `draw.spec.ts`

### Phase 6 — Scoring & Standings
- [ ] `lib/scoring.ts` validation (exact win-by-2 rule, best-of limits, error messages, match states) + unit tests
- [ ] Score entry page (team game scores, numeric keypad)
- [ ] Walkover: `WalkoverDialog`, `isWalkover` handling, W/O display + unit tests
- [ ] Status transitions `Drawn → InProgress → Completed`
- [ ] Auto-advance winners; byes auto-complete; semi-final losers → 3rd Place match
- [ ] Completed-match edit rule (complete result only, downstream incl. 3rd Place) + unit tests
- [ ] `lib/standings.ts` (byes excluded, walkovers without points, tie-break sort) + unit tests; standings table
- [ ] Team detail: tournaments played + W/L record
- [ ] Extend `sampleData` with an InProgress tournament (incl. a walkover) and a Completed tournament
- [ ] E2E: `scoring.spec.ts` (incl. walkovers and standings)

### Phase 7 — Results & Announcement
- [ ] `lib/dates.ts` + `lib/results.ts` eligibility (local date on/after End Date + Final & 3rd Place done, missing reasons) + podium; unit tests (mocked date)
- [ ] Manual "Announce Results" button (disabled-with-reason tooltip) + confirm dialog → `Announced`, read-only
- [ ] Results page: podium, ₹ prizes, sponsors, canvas-confetti (reduced-motion aware), pre-announce empty state
- [ ] Extend `sampleData` with an Announced tournament
- [ ] E2E: `results.spec.ts` (use `page.clock` before/on/after end date)

### Phase 8 — Dashboard & Settings
- [ ] Dashboard: stats, not started (with "Start date passed" badge) / live, recent champions, empty state
- [ ] `lib/backup.ts` export / import merge-by-id with integrity + status-lock checks & rollback + unit tests (`fake-indexeddb`)
- [ ] Settings: privacy notice, export (with personal-data warning), import, load sample data, reset, contact messages tab
- [ ] E2E: `dashboard.spec.ts`, `settings.spec.ts`

### Phase 9 — Polish
- [ ] Empty states, loading skeletons and not-found pages across all routes (3.12)
- [ ] Toasts and confirm dialogs on every destructive action
- [ ] Accessibility pass against 3.13 (keyboard, focus, contrast, bracket semantics, reduced motion)
- [ ] Responsive pass from 360px (navbar, tables, bracket, score entry)
- [ ] Full regression: lint, typecheck, unit, e2e on both Playwright projects

---

## 8. Testing Strategy
- **Unit (Vitest, `node` environment):** all `src/lib` logic — auth check, `assertSession` & `safeRedirect` (incl. `//`, `/\`, absolute URLs), sponsor aggregation (normalisation, multi-tier), draw/byes (one bye per match, 4–50 teams), bracket advancement, round names & 3rd Place position, score validation, walkovers & edit rule, standings & tie-breaks, status rules, announce eligibility (End Date inclusive), shared-player/duplicate-pair/delete-block checks, backup merge, status locks & rollback, storage adapter, `checkImageFile`, seeded RNG (ignored in production), local-date helpers, INR formatting, schema rules (3.11). `storage` and `backup` tests import `fake-indexeddb/auto`; image compression (canvas) is covered by E2E
- **E2E (Playwright + TS):** Page Object Model; selectors via `data-testid` only
- **Auth in tests:** `global-setup.ts` logs in with the test account once and saves `storageState` to `tests/e2e/.auth/user.json` (git-ignored); protected specs reuse it. `auth.spec.ts` runs without it and covers: valid login, invalid login, protected-route redirect, `?redirect=` return, unsafe redirects (`//evil.com`, `/\evil.com`, `https://evil.com`) fall back to `/`, logout, logged-in user blocked from `/login`
- **Session expiry in tests:**
  - **Middleware path:** add a `pbs_session` cookie whose `expiresAt` is in the past (via `context.addCookies`), then visit a protected route → redirected to `/login`. Don't use `page.clock` here: it only fakes browser time, not server time
  - **Client guard:** log in, then use `page.clock` to move past `expiresAt` and trigger a protected action or window focus → toast + redirect
  - **Public exemption:** with an expired or missing cookie, submitting the Contact form still succeeds
- **Seeding:** each spec starts with cleared IndexedDB. `tests/e2e/fixtures/seed.ts` opens a same-origin page, writes the `sampleData` dataset into IndexedDB using the DB/store names and persist envelope exported by `src/lib/storage.ts`, then **reloads** so the stores hydrate from the seed. This avoids racing Zustand `persist`, and specs don't depend on the Settings UI. `settings.spec.ts` tests the Load sample data button itself
- **Key edge cases to cover in E2E:** blocked player/team delete, no orphan inline players, shared-player conflict, draw with 5 teams (byes), invalid scores, walkover advancing a team, editing a semi-final after the Final started (blocked), announce before/on/after End Date, invalid backup import, import blocked by a status lock, import merge, deep link to an unknown id (not found after loading)
- **Randomness:** seeded RNG in test mode (`NEXT_PUBLIC_TEST_SEED`) so draws are deterministic; the seed is ignored in production builds
- **Dates:** Playwright `page.clock` to test the Announce button before, on and after the end date (client-side logic only)
- **Projects:** Desktop Chromium + Mobile (Pixel 7) viewport
- **Definition of Done per task:** lint ✔ typecheck ✔ unit ✔ e2e ✔, plus the feature's **Done when** criteria in Section 3

---

## 9. Confirmed Decisions
| # | Topic | Decision |
|---|---|---|
| 1 | Tournament format | Knockout (single elimination) only |
| 2 | Scoring | Team score only — no individual player stats |
| 3 | Player level | Label via dropdown: Beginner / Intermediate / Advanced / Pro |
| 4 | Players on multiple teams | Yes — players are a separate, reusable entity |
| 5 | 3rd place | Yes — 3rd Place match between semi-final losers, with its own prize |
| 6 | Currency | Indian Rupee (₹ INR), fixed app-wide, `en-IN` formatting |
| 7 | Results | Manual "Announce Results" button, enabled **on or after** the End Date (local date) **and** once the Final and 3rd Place matches are completed |
| 8 | Backend | Future scope — not in v1 |
| 9 | Access | Login required for every action; public pages: Login, Sign Up, Contact Us, Sponsors |
| 10 | Accounts | Only one test account (from env vars) can log in |
| 11 | Sign Up | Page + validation built; a valid submission **only shows the "registrations open soon" notice** — details are not saved |
| 12 | Deleting | Players on any team and teams in any tournament **cannot be deleted** |
| 13 | Draw | The draw is final — no return to `Draft`; team list and match format lock at draw (re-shuffle allowed until the first score) |
| 14 | Team limits | 4–50 teams per tournament |
| 15 | Prizes | Whole ₹, each ≥ ₹1 (₹0 not allowed), Champion ≥ Runner-up ≥ 3rd Place |
| 16 | Sponsors page | Everything public — sponsors from all tournaments in any status, shown in every tier they've held |
| 17 | Import | Merge by `id` (imported record wins), all-or-nothing with integrity checks |
| 18 | Confetti | `canvas-confetti` library |
| 19 | Types | Zod schemas are the source; types via `z.infer` |

---

## 9a. Open Questions
None blocking. The following defaults were chosen while writing the spec — confirm or change:

**From the first spec pass:**
1. **Tournament delete:** allowed in `Draft` / `Drawn` only; blocked from `InProgress` onward (3.3)
2. **Scoring dates:** matches can be scored any time after the draw, even before the Start Date (3.3)
3. **Sponsor logo/website conflicts:** the tournament with the latest Start Date wins (3.10)
4. **Reset all data:** keeps the user logged in and clears contact messages too (3.8)
5. **Validation limits:** age 5–99, prize max ₹1,00,00,000, sponsors 0–20, image ≤ 5 MB (3.11)

**From the plan review (planning/Review.md, Q1–Q6):**
6. **Walkovers:** supported — the organizer picks the team that advances; it counts as a win/loss but adds no points (3.5)
7. **Privacy on shared devices:** a privacy notice and an export warning only; no "clear data on logout" option in v1 (3.8)
8. **Import overwrites:** imports may not change `Announced` tournaments or locked fields of tournaments past `Draft` (3.8)
9. **Player names:** duplicates allowed; place and level are shown to tell them apart (3.1)
10. **Editing a finished match:** must be replaced with another complete result; it can't be cleared (3.5)
11. **Past dates:** tournaments may be created with dates in the past (3.3)

---

## 10. Future Scope (not in v1)
- Backend API + database (shared data across devices for public pages and contact messages)
- Real authentication (hashed passwords, server sessions), working Sign Up, password reset, multiple users & roles
- Contact form delivering email to the organizer
- Option to clear local data on logout / encrypted local storage
- Swap the Zustand persistence layer for API calls (business logic in `src/lib` stays unchanged)
- Round-robin / pool-play formats
- Individual player statistics
- Public shareable tournament and results pages

---

## 11. Decisions Log
| Date | Decision | Reason |
|---|---|---|
| 2026-10-06 | IndexedDB over localStorage | Photos exceed ~5MB localStorage limit |
| 2026-10-06 | Zustand for state | Lightweight, built-in persist middleware |
| 2026-10-06 | Players as separate entity | Players can belong to multiple teams |
| 2026-10-06 | Min 4 / max 50 teams per tournament | 4 needed for a 3rd Place match; 50 keeps the bracket ≤ 64 slots |
| 2026-10-06 | Block teams sharing a player in one tournament | A player can't play against themselves |
| 2026-10-06 | Cookie session + Next.js middleware | Protects routes before page render; easy to swap for real auth |
| 2026-10-06 | Route groups `(public)` / `(protected)` | Clear separation of access levels in the folder structure |
| 2026-10-06 | Demo credentials via `NEXT_PUBLIC_*` env vars, unsigned cookie | Frontend-only v1; accepted security trade-off, replaced by real auth later |
| 2026-10-06 | Knockout only, team scores only | Keeps v1 scope small |
| 2026-10-06 | INR fixed app-wide, `en-IN` formatting | Single market; no per-tournament currency |
| 2026-10-06 | Manual announcement on/after End Date | Organizer stays in control of when results go out |
| 2026-10-06 | Fisher–Yates shuffle + seeded RNG in tests | Unbiased random draw that can still be tested deterministically |
| 2026-10-06 | At most one bye per first-round match | Guarantees full semi-finals and a filled 3rd Place match |
| 2026-10-06 | One-way status lifecycle; draw is final | Prevents results drifting after teams are committed |
| 2026-10-06 | Block deletes of referenced players/teams | Keeps tournament history and brackets intact |
| 2026-10-06 | Photos stored as compressed JPEG data URLs | Simple to persist/export in IndexedDB and JSON backups |
| 2026-10-06 | Sponsors stored inside each tournament, merged by normalised name | No separate sponsor CRUD needed in v1; public page aggregates them |
| 2026-10-06 | Sign Up shows notice only; nothing saved | No backend to register against yet |
| 2026-10-06 | Contact messages stored locally | No backend/email in v1; organizer reads them in Settings |
| 2026-10-06 | Import merges by id, all-or-nothing | Lets users combine backups without corrupting data |
| 2026-10-06 | Zod schemas as type source (`z.infer`) | One definition for validation and types |
| 2026-10-06 | `canvas-confetti` for celebrations | Small, proven library; easy reduced-motion handling |
| 2026-10-06 | `data-testid`-only E2E selectors, Page Object Model | Stable tests that survive styling changes |
| 2026-10-06 | Session guard via `assertSession()` in protected store actions; public pages exempt | Stores can't use hooks; the public Contact form must work while logged out (PR-001, PR-012) |
| 2026-10-06 | Sponsors page moved to Phase 4 | It needs the Tournament schema and store (PR-002) |
| 2026-10-06 | Old Phase 7 split into Phases 7–9 | It was too large to deliver as one phase (PR-010) |
| 2026-10-06 | Walkover result type | Lets a tournament finish when a team can't play (PR-005) |
| 2026-10-06 | Hydration gate + not-found after hydration | Avoids empty/not-found flashes while IndexedDB loads (PR-006) |
| 2026-10-06 | E2E seed writes IndexedDB then reloads; middleware expiry tested via expired cookie | Avoids the persist race; `page.clock` can't fake server time (PR-007, PR-008) |
| 2026-10-06 | `fake-indexeddb` for unit tests | Lets `storage` / `backup` logic run in Vitest's node environment (PR-020) |
| 2026-10-06 | Import respects status locks | Prevents backups from rewriting announced or drawn tournaments (PR-004) |
| 2026-10-06 | Claude Code Stop hook writes `change-review-<date>-<slug>.md` to repo root (git-ignored) | Every change Claude makes gets an automatic review + summary before it's committed; dev tooling only, no new libraries |
