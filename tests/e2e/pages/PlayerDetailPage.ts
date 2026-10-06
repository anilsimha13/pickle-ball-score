import { type Page, type Locator } from '@playwright/test'

export class PlayerDetailPage {
  readonly editBtn: Locator
  readonly deleteBtn: Locator
  readonly confirmOkBtn: Locator
  readonly confirmCancelBtn: Locator

  constructor(private page: Page) {
    this.editBtn = page.locator('[data-testid="edit-player-btn"]')
    this.deleteBtn = page.locator('[data-testid="delete-player-btn"]')
    this.confirmOkBtn = page.locator('[data-testid="confirm-ok"]')
    this.confirmCancelBtn = page.locator('[data-testid="confirm-cancel"]')
  }

  async goto(playerId: string) {
    await this.page.goto(`/players/${playerId}`)
    await this.page.waitForLoadState('networkidle')
  }

  async clickEdit() {
    await this.editBtn.click()
  }

  async clickDelete() {
    await this.deleteBtn.click()
  }

  async confirmDelete() {
    await this.confirmOkBtn.click()
  }

  async cancelDelete() {
    await this.confirmCancelBtn.click()
  }

  isDeleteDisabled() {
    return this.deleteBtn.getAttribute('aria-disabled')
  }

  getTooltip() {
    return this.page.locator('[role="tooltip"]')
  }

  getNotFound() {
    return this.page.locator('[data-testid="not-found-back"]')
  }

  getTeamLink(teamId: string) {
    return this.page.locator(`[data-testid="player-team-link-${teamId}"]`)
  }
}
