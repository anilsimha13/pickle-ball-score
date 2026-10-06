import { test, expect } from '@playwright/test'
import { PlayersPage } from './pages/PlayersPage'
import { PlayerFormPage } from './pages/PlayerFormPage'
import { PlayerDetailPage } from './pages/PlayerDetailPage'
import { seedDatabase, clearDatabase, SAMPLE_PLAYERS, SAMPLE_TEAMS } from './fixtures/seed'

// All player tests use the pre-authenticated session
test.use({ storageState: 'tests/e2e/.auth/user.json' })

test.beforeEach(async ({ page }) => {
  // Arrange: start each test with a clean database
  await page.goto('/')
  await clearDatabase(page)
  await page.reload()
  await page.waitForLoadState('networkidle')
})

// ---------------------------------------------------------------------------
// Players List
// ---------------------------------------------------------------------------

test.describe('Players list', () => {
  test('shows empty state when no players exist', async ({ page }) => {
    const playersPage = new PlayersPage(page)
    await playersPage.goto()
    await expect(playersPage.getEmptyState()).toBeVisible()
  })

  test('shows player cards after seeding sample data', async ({ page }) => {
    // Arrange
    await page.goto('/')
    await seedDatabase(page)

    // Act
    const playersPage = new PlayersPage(page)
    await playersPage.goto()

    // Assert — 6 sample players
    await expect(playersPage.getPlayerCards()).toHaveCount(6)
  })

  test('searches players by name (case-insensitive)', async ({ page }) => {
    await page.goto('/')
    await seedDatabase(page)
    const playersPage = new PlayersPage(page)
    await playersPage.goto()

    await playersPage.searchPlayers('arjun')
    await expect(playersPage.getPlayerCards()).toHaveCount(1)
    await expect(playersPage.getPlayerCard(SAMPLE_PLAYERS[0].id)).toBeVisible()
  })

  test('searches players by place (case-insensitive)', async ({ page }) => {
    await page.goto('/')
    await seedDatabase(page)
    const playersPage = new PlayersPage(page)
    await playersPage.goto()

    // Hyderabad has 2 players (Arjun and Sneha)
    await playersPage.searchPlayers('hyderabad')
    await expect(playersPage.getPlayerCards()).toHaveCount(2)
  })

  test('shows no-results state for a non-matching query', async ({ page }) => {
    await page.goto('/')
    await seedDatabase(page)
    const playersPage = new PlayersPage(page)
    await playersPage.goto()

    await playersPage.searchPlayers('zzznomatch')
    await expect(playersPage.getNoResultsState()).toBeVisible()
  })
})

// ---------------------------------------------------------------------------
// Create Player
// ---------------------------------------------------------------------------

test.describe('Create player', () => {
  test('creates a player with all valid fields and redirects to detail', async ({ page }) => {
    const playersPage = new PlayersPage(page)
    const formPage = new PlayerFormPage(page)

    await playersPage.goto()
    await playersPage.clickNewPlayer()
    await formPage.fillValidPlayer()
    await formPage.submit()

    // Should redirect to the player detail page
    await expect(page).toHaveURL(/\/players\/[a-z0-9-]+$/)
  })

  test('shows error for name shorter than 2 characters', async ({ page }) => {
    const formPage = new PlayerFormPage(page)
    await formPage.gotoNew()
    await formPage.fillName('A')
    await formPage.submit()
    await expect(formPage.getNameError()).toContainText('Name must be 2')
  })

  test('shows error for name longer than 50 characters', async ({ page }) => {
    const formPage = new PlayerFormPage(page)
    await formPage.gotoNew()
    await formPage.fillName('A'.repeat(51))
    await formPage.submit()
    await expect(formPage.getNameError()).toContainText('50 characters')
  })

  test('shows error for age below 5', async ({ page }) => {
    const formPage = new PlayerFormPage(page)
    await formPage.gotoNew()
    await formPage.fillName('Valid Name')
    await formPage.fillAge(4)
    await formPage.fillPlace('Chennai')
    await formPage.selectLevel('Beginner')
    await formPage.submit()
    await expect(formPage.getAgeError()).toContainText('5')
  })

  test('shows error for age above 99', async ({ page }) => {
    const formPage = new PlayerFormPage(page)
    await formPage.gotoNew()
    await formPage.fillName('Valid Name')
    await formPage.fillAge(100)
    await formPage.fillPlace('Chennai')
    await formPage.selectLevel('Beginner')
    await formPage.submit()
    await expect(formPage.getAgeError()).toContainText('99')
  })

  test('shows error for place shorter than 2 characters', async ({ page }) => {
    const formPage = new PlayerFormPage(page)
    await formPage.gotoNew()
    await formPage.fillName('Valid Name')
    await formPage.fillAge(25)
    await formPage.fillPlace('X')
    await formPage.selectLevel('Beginner')
    await formPage.submit()
    await expect(formPage.getPlaceError()).toContainText('Place must be 2')
  })

  test('newly created player appears in the player list', async ({ page }) => {
    const formPage = new PlayerFormPage(page)
    await formPage.gotoNew()
    await formPage.fillValidPlayer({ name: 'Unique QA Player' })
    await formPage.submit()
    await page.waitForURL(/\/players\/[a-z0-9-]+$/)

    const playersPage = new PlayersPage(page)
    await playersPage.goto()
    await playersPage.searchPlayers('Unique QA Player')
    await expect(playersPage.getPlayerCards()).toHaveCount(1)
  })
})

// ---------------------------------------------------------------------------
// Edit Player
// ---------------------------------------------------------------------------

test.describe('Edit player', () => {
  test('pre-fills form with existing player data', async ({ page }) => {
    await page.goto('/')
    await seedDatabase(page)

    const detailPage = new PlayerDetailPage(page)
    await detailPage.goto(SAMPLE_PLAYERS[0].id)
    await detailPage.clickEdit()

    await expect(page).toHaveURL(new RegExp(`/players/${SAMPLE_PLAYERS[0].id}/edit`))
    const formPage = new PlayerFormPage(page)
    await expect(formPage.nameInput).toHaveValue(SAMPLE_PLAYERS[0].name)
    await expect(formPage.ageInput).toHaveValue(String(SAMPLE_PLAYERS[0].age))
    await expect(formPage.placeInput).toHaveValue(SAMPLE_PLAYERS[0].place)
  })

  test('saves updated player name and reflects on detail page', async ({ page }) => {
    await page.goto('/')
    await seedDatabase(page)

    await page.goto(`/players/${SAMPLE_PLAYERS[1].id}/edit`)
    await page.waitForLoadState('networkidle')

    const formPage = new PlayerFormPage(page)
    await formPage.nameInput.fill('Updated Name QA')
    await formPage.submit()

    await expect(page).toHaveURL(new RegExp(`/players/${SAMPLE_PLAYERS[1].id}`))
    await expect(page.getByText('Updated Name QA')).toBeVisible()
  })
})

// ---------------------------------------------------------------------------
// Delete Player
// ---------------------------------------------------------------------------

test.describe('Delete player', () => {
  test('can delete a player not on any team', async ({ page }) => {
    // Arrange: create a standalone player
    const formPage = new PlayerFormPage(page)
    await formPage.gotoNew()
    await formPage.fillValidPlayer({ name: 'Standalone Player' })
    await formPage.submit()
    const url = page.url()
    const playerId = url.split('/').pop()!

    // Act
    const detailPage = new PlayerDetailPage(page)
    await detailPage.goto(playerId)
    await detailPage.clickDelete()
    await detailPage.confirmDelete()

    // Assert: redirected to players list
    await expect(page).toHaveURL('/players')

    // Verify player is gone
    const playersPage = new PlayersPage(page)
    await playersPage.searchPlayers('Standalone Player')
    await expect(playersPage.getEmptyState().or(playersPage.getNoResultsState())).toBeVisible()
  })

  test('delete button is aria-disabled when player is on a team', async ({ page }) => {
    // Arrange: player-001 is on teams 001 and 004
    await page.goto('/')
    await seedDatabase(page)

    const detailPage = new PlayerDetailPage(page)
    await detailPage.goto(SAMPLE_PLAYERS[0].id)

    // Assert: button has aria-disabled="true"
    await expect(detailPage.deleteBtn).toHaveAttribute('aria-disabled', 'true')
  })

  test('tooltip is shown when hovering over disabled delete button', async ({ page }) => {
    await page.goto('/')
    await seedDatabase(page)

    const detailPage = new PlayerDetailPage(page)
    await detailPage.goto(SAMPLE_PLAYERS[0].id)

    await detailPage.deleteBtn.hover()
    await expect(detailPage.getTooltip()).toBeVisible()
    await expect(detailPage.getTooltip()).toContainText('Remove')
  })

  test('aria-disabled delete button is still keyboard-focusable', async ({ page }) => {
    await page.goto('/')
    await seedDatabase(page)

    const detailPage = new PlayerDetailPage(page)
    await detailPage.goto(SAMPLE_PLAYERS[0].id)

    // Focus the button via keyboard
    await detailPage.deleteBtn.focus()
    await expect(detailPage.deleteBtn).toBeFocused()
  })

  test('cancelling delete dialog leaves player unchanged', async ({ page }) => {
    // Arrange: create a deletable player
    const formPage = new PlayerFormPage(page)
    await formPage.gotoNew()
    await formPage.fillValidPlayer({ name: 'Cancel Delete Player' })
    await formPage.submit()
    const playerId = page.url().split('/').pop()!

    // Act: click delete, then cancel
    const detailPage = new PlayerDetailPage(page)
    await detailPage.goto(playerId)
    await detailPage.clickDelete()
    await detailPage.cancelDelete()

    // Assert: still on detail page, player exists
    await expect(page).toHaveURL(new RegExp(`/players/${playerId}`))
    await expect(page.getByText('Cancel Delete Player')).toBeVisible()
  })

  test('shows not-found card for an unknown player id', async ({ page }) => {
    await page.goto('/players/nonexistent-player-id-xyz')
    await page.waitForLoadState('networkidle')
    // HydrationGate needs a moment before showing not-found
    await page.waitForTimeout(400)

    const detailPage = new PlayerDetailPage(page)
    await expect(detailPage.getNotFound()).toBeVisible()
  })

  test('player detail shows teams the player belongs to', async ({ page }) => {
    await page.goto('/')
    await seedDatabase(page)

    // player-001 is in team-001 (Smash Bros) and team-004 (Kitchen Kings)
    const detailPage = new PlayerDetailPage(page)
    await detailPage.goto(SAMPLE_PLAYERS[0].id)
    await expect(detailPage.getTeamLink(SAMPLE_TEAMS[0].id)).toBeVisible()
    await expect(detailPage.getTeamLink(SAMPLE_TEAMS[3].id)).toBeVisible()
  })
})
