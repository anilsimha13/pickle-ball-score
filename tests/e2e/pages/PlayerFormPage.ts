import { type Page, type Locator } from '@playwright/test'

export class PlayerFormPage {
  readonly nameInput: Locator
  readonly ageInput: Locator
  readonly placeInput: Locator
  readonly levelSelect: Locator
  readonly submitBtn: Locator

  constructor(private page: Page) {
    this.nameInput = page.locator('[data-testid="player-name"]')
    this.ageInput = page.locator('[data-testid="player-age"]')
    this.placeInput = page.locator('[data-testid="player-place"]')
    this.levelSelect = page.locator('[data-testid="player-level-select"]')
    this.submitBtn = page.locator('[data-testid="player-submit"]')
  }

  async gotoNew() {
    await this.page.goto('/players/new')
  }

  async fillName(name: string) {
    await this.nameInput.fill(name)
  }

  async fillAge(age: number) {
    await this.ageInput.fill(String(age))
  }

  async fillPlace(place: string) {
    await this.placeInput.fill(place)
  }

  async selectLevel(level: string) {
    await this.levelSelect.selectOption(level)
  }

  async submit() {
    await this.submitBtn.click()
  }

  async fillValidPlayer(overrides?: { name?: string; age?: number; place?: string; level?: string }) {
    await this.fillName(overrides?.name ?? 'Test Player')
    await this.fillAge(overrides?.age ?? 25)
    await this.fillPlace(overrides?.place ?? 'Chennai')
    await this.selectLevel(overrides?.level ?? 'Intermediate')
  }

  getNameError() {
    return this.page.locator('#player-name-error')
  }

  getAgeError() {
    return this.page.locator('#player-age-error')
  }

  getPlaceError() {
    return this.page.locator('#player-place-error')
  }

  getLevelError() {
    return this.page.locator('#player-level-error')
  }
}
