import { type Page, type Locator } from '@playwright/test'

export class TeamsPage {
  readonly newTeamBtn: Locator
  readonly searchInput: Locator
  readonly teamList: Locator

  constructor(private page: Page) {
    this.newTeamBtn = page.locator('[data-testid="new-team-btn"]')
    this.searchInput = page.locator('[data-testid="team-search"]')
    this.teamList = page.locator('[data-testid="team-list"]')
  }

  async goto() {
    await this.page.goto('/teams')
    await this.page.waitForLoadState('networkidle')
  }

  async clickNewTeam() {
    await this.newTeamBtn.click()
  }

  async searchTeams(query: string) {
    await this.searchInput.fill(query)
    await this.page.waitForTimeout(300)
  }

  getTeamCards() {
    return this.page.locator('[data-testid^="team-card-"]')
  }

  getTeamCard(id: string) {
    return this.page.locator(`[data-testid="team-card-${id}"]`)
  }

  getEmptyState() {
    return this.page.getByText('No teams yet')
  }

  getNoResultsState() {
    return this.page.getByText('No teams found')
  }
}
