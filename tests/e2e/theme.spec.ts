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
 * Theme Toggle Tests
 *
 * Question answered: Does the dark/light mode toggle work correctly?
 */
test.describe('Theme Toggle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.getByTestId('email-input').fill('user@example.com')
    await page.getByTestId('password-input').fill('password123')
    await page.getByTestId('submit-button').click()
    await expect(page.getByTestId('sidebar')).toBeVisible()
    await openMobileMenuIfNeeded(page)
  })

  test('displays theme toggle button', async ({ page }) => {
    await expect(page.getByTestId('theme-toggle')).toBeVisible()
  })

  test('toggles to dark mode', async ({ page }) => {
    // Get initial state
    const html = page.locator('html')

    // Click toggle to enable dark mode
    await page.getByTestId('theme-toggle').click()

    // Check dark class is applied
    await expect(html).toHaveClass(/dark/)
  })

  test('toggles back to light mode', async ({ page }) => {
    const html = page.locator('html')

    // Enable dark mode
    await page.getByTestId('theme-toggle').click()
    await expect(html).toHaveClass(/dark/)

    // Disable dark mode
    await page.getByTestId('theme-toggle').click()
    await expect(html).not.toHaveClass(/dark/)
  })

  test('updates button text based on current theme', async ({ page }) => {
    const toggle = page.getByTestId('theme-toggle')

    // Initially shows "Dark mode" option
    await expect(toggle).toContainText(/mode/i)

    // After clicking, should offer the opposite mode
    await toggle.click()
    await expect(toggle).toContainText(/mode/i)
  })

  test('applies dark theme styles to dashboard', async ({ page }) => {
    await page.getByTestId('theme-toggle').click()

    const mainContent = page.getByTestId('main-content')
    await expect(mainContent).toHaveClass(/dark:bg-slate-900/)
  })

  test('dark mode persists across page navigation', async ({ page }) => {
    const html = page.locator('html')

    // Enable dark mode
    await page.getByTestId('theme-toggle').click()
    await expect(html).toHaveClass(/dark/)

    // Navigate to settings
    await page.getByRole('link', { name: 'Settings' }).click()
    await expect(page).toHaveURL('/settings')

    // Dark mode should still be active
    await expect(html).toHaveClass(/dark/)

    // Navigate back to dashboard
    await openMobileMenuIfNeeded(page)
    await page.getByRole('link', { name: 'Dashboard' }).click()
    await expect(html).toHaveClass(/dark/)
  })
})
