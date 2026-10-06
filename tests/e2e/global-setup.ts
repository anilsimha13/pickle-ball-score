import { chromium, type FullConfig } from '@playwright/test'
import path from 'path'
import fs from 'fs'

const AUTH_FILE = path.join(__dirname, '.auth', 'user.json')

export default async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0]?.use?.baseURL ?? 'http://localhost:3000'

  fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true })

  const browser = await chromium.launch()
  const page = await browser.newPage()

  await page.goto(`${baseURL}/login`)
  await page.fill('[data-testid="login-email"]', process.env.NEXT_PUBLIC_TEST_USER_EMAIL ?? 'test@pickleballscore.in')
  await page.fill('[data-testid="login-password"]', process.env.NEXT_PUBLIC_TEST_USER_PASSWORD ?? 'Pickle@123')
  await page.click('[data-testid="login-submit"]')
  await page.waitForURL(`${baseURL}/`)

  await page.context().storageState({ path: AUTH_FILE })
  await browser.close()
}
