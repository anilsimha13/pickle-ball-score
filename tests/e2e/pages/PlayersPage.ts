import { type Page, type Locator } from '@playwright/test'

export class PlayersPage {
  readonly newPlayerBtn: Locator
  readonly searchInput: Locator
  readonly playerList: Locator

  constructor(private page: Page) {
    this.newPlayerBtn = page.locator('[data-testid="new-player-btn"]')
    this.searchInput = page.locator('[data-testid="player-search"]')
    this.playerList = page.locator('[data-testid="player-list"]')
  }

  async goto() {
    await this.page.goto('/players')
    await this.page.waitForLoadState('networkidle')
  }

  async clickNewPlayer() {
    await this.newPlayerBtn.click()
  }

  async searchPlayers(query: string) {
    await this.searchInput.fill(query)
    // Allow debounce (200ms) to settle
    await this.page.waitForTimeout(300)
  }

  getPlayerCards() {
    return this.page.locator('[data-testid^="player-card-"]')
  }

  getPlayerCard(id: string) {
    return this.page.locator(`[data-testid="player-card-${id}"]`)
  }

  getEmptyState() {
    return this.page.getByText('No players yet')
  }

  getNoResultsState() {
    return this.page.getByText('No players found')
  }
}
