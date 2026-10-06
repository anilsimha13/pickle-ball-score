import { type Page, type Locator } from '@playwright/test'

export class TeamFormPage {
  readonly nameInput: Locator
  readonly player1Select: Locator
  readonly player2Select: Locator
  readonly submitBtn: Locator

  constructor(private page: Page) {
    this.nameInput = page.locator('[data-testid="team-name"]')
    this.player1Select = page.locator('[data-testid="team-player1"]')
    this.player2Select = page.locator('[data-testid="team-player2"]')
    this.submitBtn = page.locator('[data-testid="team-submit"]')
  }

  async gotoNew() {
    await this.page.goto('/teams/new')
    await this.page.waitForLoadState('networkidle')
  }

  async fillName(name: string) {
    await this.nameInput.fill(name)
  }

  async selectPlayer1ByValue(playerId: string) {
    await this.player1Select.selectOption(playerId)
  }

  async selectPlayer2ByValue(playerId: string) {
    await this.player2Select.selectOption(playerId)
  }

  async selectPlayer1ByText(playerText: string) {
    await this.player1Select.selectOption({ label: playerText })
  }

  async selectPlayer2ByText(playerText: string) {
    await this.player2Select.selectOption({ label: playerText })
  }

  /** Triggers the "＋ Create new player" option in Player 1 slot */
  async openInlinePlayer1() {
    await this.player1Select.selectOption('__new__')
  }

  /** Triggers the "＋ Create new player" option in Player 2 slot */
  async openInlinePlayer2() {
    await this.player2Select.selectOption('__new__')
  }

  async submit() {
    await this.submitBtn.click()
  }

  getNameError() {
    return this.page.locator('#team-name-error')
  }

  /** Error displayed under the player picker (aria error) */
  getPlayerError() {
    return this.page.locator('[role="alert"]').first()
  }

  /** The inline player form that appears within the picker */
  getInlinePlayerForm() {
    return this.page.locator('[data-testid="player-submit"]')
  }

  async fillInlinePlayer(name: string, age: number, place: string, level: string) {
    await this.page.locator('[data-testid="player-name"]').fill(name)
    await this.page.locator('[data-testid="player-age"]').fill(String(age))
    await this.page.locator('[data-testid="player-place"]').fill(place)
    await this.page.locator('[data-testid="player-level-select"]').selectOption(level)
    await this.page.locator('[data-testid="player-submit"]').click()
  }
}
