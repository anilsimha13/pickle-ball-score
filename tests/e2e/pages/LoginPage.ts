import { type Page, type Locator } from '@playwright/test'

export class LoginPage {
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly submitBtn: Locator
  readonly togglePasswordBtn: Locator
  readonly rememberMeCheckbox: Locator
  readonly serverError: Locator

  constructor(private page: Page) {
    this.emailInput = page.locator('[data-testid="login-email"]')
    this.passwordInput = page.locator('[data-testid="login-password"]')
    this.submitBtn = page.locator('[data-testid="login-submit"]')
    this.togglePasswordBtn = page.locator('[data-testid="login-toggle-password"]')
    this.rememberMeCheckbox = page.locator('[data-testid="login-remember"]')
    this.serverError = page.locator('[data-testid="login-error"]')
  }

  async goto() {
    await this.page.goto('/login')
  }

  async fillEmail(email: string) {
    await this.emailInput.fill(email)
  }

  async fillPassword(password: string) {
    await this.passwordInput.fill(password)
  }

  async submit() {
    await this.submitBtn.click()
  }

  async login(email: string, password: string) {
    await this.fillEmail(email)
    await this.fillPassword(password)
    await this.submit()
  }

  async loginWithDefaults() {
    await this.login(
      process.env.NEXT_PUBLIC_TEST_USER_EMAIL ?? 'test@pickleballscore.in',
      process.env.NEXT_PUBLIC_TEST_USER_PASSWORD ?? 'Pickle@123',
    )
  }

  getEmailError() {
    return this.page.locator('#email-error')
  }

  getPasswordError() {
    return this.page.locator('#password-error')
  }
}
