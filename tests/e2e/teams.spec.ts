import { test, expect, type Page } from '@playwright/test'
import { PlayersPage } from './pages/PlayersPage'
import { PlayerFormPage } from './pages/PlayerFormPage'
import { TeamsPage } from './pages/TeamsPage'
import { TeamFormPage } from './pages/TeamFormPage'
import { TeamDetailPage } from './pages/TeamDetailPage'
import { seedDatabase, clearDatabase, SAMPLE_PLAYERS, SAMPLE_TEAMS } from './fixtures/seed'

test.use({ storageState: 'tests/e2e/.auth/user.json' })

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await clearDatabase(page)
  await page.reload()
  await page.waitForLoadState('networkidle')
})

// ---------------------------------------------------------------------------
// Teams List
// ---------------------------------------------------------------------------

test.describe('Teams list', () => {
  test('shows empty state when no teams exist', async ({ page }) => {
    const teamsPage = new TeamsPage(page)
    await teamsPage.goto()
    await expect(teamsPage.getEmptyState()).toBeVisible()
  })

  test('shows team cards after seeding sample data', async ({ page }) => {
    await page.goto('/')
    await seedDatabase(page)
    const teamsPage = new TeamsPage(page)
    await teamsPage.goto()
    await expect(teamsPage.getTeamCards()).toHaveCount(4)
  })

  test('searches teams by name (case-insensitive)', async ({ page }) => {
    await page.goto('/')
    await seedDatabase(page)
    const teamsPage = new TeamsPage(page)
    await teamsPage.goto()

    await teamsPage.searchTeams('smash')
    await expect(teamsPage.getTeamCards()).toHaveCount(1)
    await expect(teamsPage.getTeamCard(SAMPLE_TEAMS[0].id)).toBeVisible()
  })

  test('shows no-results state for a non-matching query', async ({ page }) => {
    await page.goto('/')
    await seedDatabase(page)
    const teamsPage = new TeamsPage(page)
    await teamsPage.goto()

    await teamsPage.searchTeams('zzznomatch')
    await expect(teamsPage.getNoResultsState()).toBeVisible()
  })
})

// ---------------------------------------------------------------------------
// Create Team
// ---------------------------------------------------------------------------

test.describe('Create team', () => {
  // Create two players first so the team form can pick them
  async function createTwoPlayers(page: Page) {
    const formPage = new PlayerFormPage(page)
    await formPage.gotoNew()
    await formPage.fillValidPlayer({ name: 'Player Alpha', place: 'Delhi' })
    await formPage.submit()
    const p1Url = page.url()
    const p1Id = p1Url.split('/').pop()!

    await formPage.gotoNew()
    await formPage.fillValidPlayer({ name: 'Player Beta', place: 'Mumbai', level: 'Advanced' })
    await formPage.submit()
    const p2Url = page.url()
    const p2Id = p2Url.split('/').pop()!

    return { p1Id, p2Id }
  }

  test('creates a team with two different players and redirects to detail', async ({ page }) => {
    const { p1Id, p2Id } = await createTwoPlayers(page)

    const formPage = new TeamFormPage(page)
    await formPage.gotoNew()
    await formPage.fillName('QA Test Team')
    await formPage.selectPlayer1ByValue(p1Id)
    await formPage.selectPlayer2ByValue(p2Id)
    await formPage.submit()

    await expect(page).toHaveURL(/\/teams\/[a-z0-9-]+$/)
  })

  test('shows error for team name shorter than 2 characters', async ({ page }) => {
    const { p1Id, p2Id } = await createTwoPlayers(page)

    const formPage = new TeamFormPage(page)
    await formPage.gotoNew()
    await formPage.fillName('A')
    await formPage.selectPlayer1ByValue(p1Id)
    await formPage.selectPlayer2ByValue(p2Id)
    await formPage.submit()

    await expect(formPage.getNameError()).toBeVisible()
  })

  test('shows error when same player is selected for both slots', async ({ page }) => {
    const { p1Id } = await createTwoPlayers(page)

    const formPage = new TeamFormPage(page)
    await formPage.gotoNew()
    await formPage.fillName('Duplicate Players Team')
    await formPage.selectPlayer1ByValue(p1Id)
    await formPage.selectPlayer2ByValue(p1Id)
    await formPage.submit()

    // Should see a validation error about picking different players
    await expect(page.locator('[role="alert"]')).toContainText('different')
  })

  test('shows error for duplicate team name (case-insensitive)', async ({ page }) => {
    const { p1Id, p2Id } = await createTwoPlayers(page)

    const formPage = new TeamFormPage(page)

    // Create first team
    await formPage.gotoNew()
    await formPage.fillName('Duplicate Name Team')
    await formPage.selectPlayer1ByValue(p1Id)
    await formPage.selectPlayer2ByValue(p2Id)
    await formPage.submit()
    await expect(page).toHaveURL(/\/teams\/[a-z0-9-]+$/)

    // Try to create second team with same name (different case)
    const formPage2 = new TeamFormPage(page)
    await formPage2.gotoNew()
    await formPage2.fillName('duplicate name team')
    // Need two different players — create them
    const formP = new PlayerFormPage(page)
    await formP.gotoNew()
    await formP.fillValidPlayer({ name: 'Player Gamma', place: 'Pune' })
    await formP.submit()
    const p3Id = page.url().split('/').pop()!

    await formP.gotoNew()
    await formP.fillValidPlayer({ name: 'Player Delta', place: 'Kolkata' })
    await formP.submit()
    const p4Id = page.url().split('/').pop()!

    await formPage2.gotoNew()
    await formPage2.fillName('duplicate name team')
    await formPage2.selectPlayer1ByValue(p3Id)
    await formPage2.selectPlayer2ByValue(p4Id)
    await formPage2.submit()

    await expect(formPage2.getNameError()).toContainText('already exists')
  })

  test('shows error for duplicate player pair', async ({ page }) => {
    const { p1Id, p2Id } = await createTwoPlayers(page)

    const formPage = new TeamFormPage(page)

    // Create first team
    await formPage.gotoNew()
    await formPage.fillName('First Pair Team')
    await formPage.selectPlayer1ByValue(p1Id)
    await formPage.selectPlayer2ByValue(p2Id)
    await formPage.submit()
    await expect(page).toHaveURL(/\/teams\/[a-z0-9-]+$/)

    // Try same pair with reversed order and a different name
    await formPage.gotoNew()
    await formPage.fillName('Second Pair Team')
    await formPage.selectPlayer1ByValue(p2Id)
    await formPage.selectPlayer2ByValue(p1Id)
    await formPage.submit()

    // Should show "already team" error
    await expect(page.locator('[role="alert"]')).toContainText('already team')
  })
})

// ---------------------------------------------------------------------------
// Inline Player Creation
// ---------------------------------------------------------------------------

test.describe('Inline player creation in team form', () => {
  test('saves inline player when team is saved successfully', async ({ page }) => {
    // Create one existing player for the second slot
    const formP = new PlayerFormPage(page)
    await formP.gotoNew()
    await formP.fillValidPlayer({ name: 'Existing Player For Inline Test' })
    await formP.submit()
    const existingId = page.url().split('/').pop()!

    // Record initial player count
    const playersPage = new PlayersPage(page)
    await playersPage.goto()
    const initialCount = await playersPage.getPlayerCards().count()

    // Fill team form: inline player 1, existing player 2
    const teamForm = new TeamFormPage(page)
    await teamForm.gotoNew()
    await teamForm.fillName('Inline Test Team')
    await teamForm.openInlinePlayer1()
    await teamForm.fillInlinePlayer('Inline Created Player', 28, 'Goa', 'Intermediate')
    await teamForm.selectPlayer2ByValue(existingId)
    await teamForm.submit()

    await expect(page).toHaveURL(/\/teams\/[a-z0-9-]+$/)

    // Inline player should now be in the players list
    await playersPage.goto()
    const finalCount = await playersPage.getPlayerCards().count()
    expect(finalCount).toBe(initialCount + 1)

    await playersPage.searchPlayers('Inline Created Player')
    await expect(playersPage.getPlayerCards()).toHaveCount(1)
  })

  test('does NOT save inline player when team form is cancelled (navigated away)', async ({ page }) => {
    // Record initial player count (empty DB)
    const playersPage = new PlayersPage(page)
    await playersPage.goto()
    const initialCount = await playersPage.getPlayerCards().count()

    // Open team form, trigger inline player form, then navigate away WITHOUT submitting
    const teamForm = new TeamFormPage(page)
    await teamForm.gotoNew()
    await teamForm.fillName('Team That Will Be Cancelled')
    await teamForm.openInlinePlayer1()
    await teamForm.fillInlinePlayer('Orphan Player Should Not Exist', 22, 'Noida', 'Beginner')

    // Navigate away without submitting the team form
    await page.goto('/players')
    await page.waitForLoadState('networkidle')

    const finalCount = await playersPage.getPlayerCards().count()
    // No orphan player should have been saved
    expect(finalCount).toBe(initialCount)
  })
})

// ---------------------------------------------------------------------------
// Edit Team
// ---------------------------------------------------------------------------

test.describe('Edit team', () => {
  test('pre-fills form with existing team data', async ({ page }) => {
    await page.goto('/')
    await seedDatabase(page)

    const detailPage = new TeamDetailPage(page)
    await detailPage.goto(SAMPLE_TEAMS[0].id)
    await detailPage.clickEdit()

    await expect(page).toHaveURL(new RegExp(`/teams/${SAMPLE_TEAMS[0].id}/edit`))
    const formPage = new TeamFormPage(page)
    await expect(formPage.nameInput).toHaveValue(SAMPLE_TEAMS[0].name)
  })

  test('saves updated team name', async ({ page }) => {
    await page.goto('/')
    await seedDatabase(page)

    await page.goto(`/teams/${SAMPLE_TEAMS[0].id}/edit`)
    await page.waitForLoadState('networkidle')

    const formPage = new TeamFormPage(page)
    await formPage.nameInput.fill('Renamed QA Team')
    await formPage.submit()

    await expect(page).toHaveURL(new RegExp(`/teams/${SAMPLE_TEAMS[0].id}`))
    await expect(page.getByText('Renamed QA Team')).toBeVisible()
  })

  // TODO: Test that player fields are locked when team is in a drawn tournament
  // Requires tournament + draw seed data from Phase 5.
})

// ---------------------------------------------------------------------------
// Delete Team
// ---------------------------------------------------------------------------

test.describe('Delete team', () => {
  test('can delete a team not in any tournament', async ({ page }) => {
    // Create two players + a team
    const formP = new PlayerFormPage(page)
    await formP.gotoNew()
    await formP.fillValidPlayer({ name: 'Del Team P1' })
    await formP.submit()
    const p1Id = page.url().split('/').pop()!

    await formP.gotoNew()
    await formP.fillValidPlayer({ name: 'Del Team P2', place: 'Surat' })
    await formP.submit()
    const p2Id = page.url().split('/').pop()!

    const teamForm = new TeamFormPage(page)
    await teamForm.gotoNew()
    await teamForm.fillName('Team To Delete')
    await teamForm.selectPlayer1ByValue(p1Id)
    await teamForm.selectPlayer2ByValue(p2Id)
    await teamForm.submit()
    const teamId = page.url().split('/').pop()!

    // Delete it
    const detailPage = new TeamDetailPage(page)
    await detailPage.goto(teamId)
    await detailPage.clickDelete()
    await detailPage.confirmDelete()

    await expect(page).toHaveURL('/teams')

    // Verify gone
    const teamsPage = new TeamsPage(page)
    await teamsPage.searchTeams('Team To Delete')
    await expect(teamsPage.getEmptyState().or(teamsPage.getNoResultsState())).toBeVisible()
  })

  test('cancelling delete dialog leaves team unchanged', async ({ page }) => {
    await page.goto('/')
    await seedDatabase(page)

    const detailPage = new TeamDetailPage(page)
    await detailPage.goto(SAMPLE_TEAMS[0].id)
    await detailPage.clickDelete()
    await detailPage.cancelDelete()

    await expect(page).toHaveURL(new RegExp(`/teams/${SAMPLE_TEAMS[0].id}`))
    await expect(page.getByText(SAMPLE_TEAMS[0].name)).toBeVisible()
  })

  test('shows not-found card for unknown team id', async ({ page }) => {
    await page.goto('/teams/nonexistent-team-id-xyz')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(400)

    const detailPage = new TeamDetailPage(page)
    await expect(detailPage.getNotFound()).toBeVisible()
  })

  // TODO: Test delete is aria-disabled when team is in a tournament.
  // Requires tournament seed data from Phase 4.
})

// ---------------------------------------------------------------------------
// Accessibility
// ---------------------------------------------------------------------------

test.describe('Accessibility', () => {
  test('team detail delete is aria-disabled and focusable when in tournament', async ({
    page,
  }) => {
    // TODO: Seed a tournament that contains a team, then verify aria-disabled on delete.
    // Requires tournament seed data (Phase 4). Skipping until then.
    test.skip(true, 'Requires tournament seed data from Phase 4')
  })

  test('team list search has accessible aria-label', async ({ page }) => {
    const teamsPage = new TeamsPage(page)
    await teamsPage.goto()
    await expect(teamsPage.searchInput).toHaveAttribute('aria-label', 'Search teams')
  })

  test('player list search has accessible aria-label', async ({ page }) => {
    const playersPage = new PlayersPage(page)
    await playersPage.goto()
    await expect(playersPage.searchInput).toHaveAttribute('aria-label', 'Search players')
  })
})
