import { test, expect } from '@playwright/test'

// Helper to open mobile menu if needed
async function openMobileMenuIfNeeded(page: import('@playwright/test').Page) {
  const menuButton = page.getByTestId('menu-button')
  if (await menuButton.isVisible()) {
    await menuButton.click()
    await expect(page.getByTestId('sidebar')).toBeVisible()
  }
}

/**
 * Authentication Flow Tests
 *
 * Question answered: Can a user successfully log in and access protected routes?
 */
test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('redirects unauthenticated users to login', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL('/login')
  })

  test('allows user to log in with valid credentials', async ({ page }) => {
    await page.getByTestId('email-input').fill('user@example.com')
    await page.getByTestId('password-input').fill('password123')
    await page.getByTestId('submit-button').click()

    await expect(page).toHaveURL('/')
    await expect(page.getByTestId('sidebar')).toBeVisible()
  })

  test('displays user info after login', async ({ page }) => {
    await page.getByTestId('email-input').fill('john@example.com')
    await page.getByTestId('password-input').fill('password123')
    await page.getByTestId('submit-button').click()

    await openMobileMenuIfNeeded(page)
    await expect(page.getByTestId('user-name')).toHaveText('john')
  })

  test('allows user to log out', async ({ page }) => {
    // Login first
    await page.getByTestId('email-input').fill('user@example.com')
    await page.getByTestId('password-input').fill('password123')
    await page.getByTestId('submit-button').click()

    await expect(page.getByTestId('sidebar')).toBeVisible()
    await openMobileMenuIfNeeded(page)

    // Logout - now requires confirmation
    await page.getByTestId('logout-button').click()
    await page.getByTestId('modal-confirm').click()
    await expect(page).toHaveURL('/login')
  })

  test('persists authentication across navigation', async ({ page }) => {
    await page.getByTestId('email-input').fill('user@example.com')
    await page.getByTestId('password-input').fill('password123')
    await page.getByTestId('submit-button').click()

    await openMobileMenuIfNeeded(page)
    await page.getByRole('link', { name: 'Settings' }).click()
    await expect(page).toHaveURL('/settings')

    await openMobileMenuIfNeeded(page)
    await page.getByRole('link', { name: 'Dashboard' }).click()
    await expect(page).toHaveURL('/')
  })
})
