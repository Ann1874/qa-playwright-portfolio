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
 * Toast Notification Tests
 *
 * Question answered: Do toast notifications appear and dismiss correctly?
 */
test.describe('Toast Notifications', () => {
  test('shows welcome toast after login', async ({ page }) => {
    await page.goto('/login')
    await page.getByTestId('email-input').fill('user@example.com')
    await page.getByTestId('password-input').fill('password123')
    await page.getByTestId('submit-button').click()

    await expect(page.getByTestId('toast-success')).toBeVisible()
    await expect(page.getByText('Welcome back!')).toBeVisible()
  })

  test('shows success toast after saving settings', async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.getByTestId('email-input').fill('user@example.com')
    await page.getByTestId('password-input').fill('password123')
    await page.getByTestId('submit-button').click()

    // Wait for login toast to disappear
    await page.getByTestId('toast-close').click()

    // Go to settings and save
    await openMobileMenuIfNeeded(page)
    await page.getByRole('link', { name: 'Settings' }).click()
    await page.getByTestId('save-button').click()

    await expect(page.getByTestId('toast-success')).toBeVisible()
    await expect(page.getByTestId('toast-success')).toContainText('Settings saved')
  })

  test('toast can be dismissed by clicking close button', async ({ page }) => {
    await page.goto('/login')
    await page.getByTestId('email-input').fill('user@example.com')
    await page.getByTestId('password-input').fill('password123')
    await page.getByTestId('submit-button').click()

    await expect(page.getByTestId('toast')).toBeVisible()

    await page.getByTestId('toast-close').click()

    await expect(page.getByTestId('toast')).not.toBeVisible()
  })

  test('toast auto-dismisses after timeout', async ({ page }) => {
    await page.goto('/login')
    await page.getByTestId('email-input').fill('user@example.com')
    await page.getByTestId('password-input').fill('password123')
    await page.getByTestId('submit-button').click()

    await expect(page.getByTestId('toast')).toBeVisible()

    // Wait for auto-dismiss (default is 3 seconds)
    await expect(page.getByTestId('toast')).not.toBeVisible({ timeout: 5000 })
  })

  test('toast has correct ARIA attributes for accessibility', async ({ page }) => {
    await page.goto('/login')
    await page.getByTestId('email-input').fill('user@example.com')
    await page.getByTestId('password-input').fill('password123')
    await page.getByTestId('submit-button').click()

    const toast = page.getByTestId('toast')
    await expect(toast).toHaveAttribute('role', 'status')
    await expect(toast).toHaveAttribute('aria-live', 'polite')
  })

  test('logout shows toast notification', async ({ page }) => {
    await page.goto('/login')
    await page.getByTestId('email-input').fill('user@example.com')
    await page.getByTestId('password-input').fill('password123')
    await page.getByTestId('submit-button').click()

    // Dismiss welcome toast
    await page.getByTestId('toast-close').click()

    // Logout
    await openMobileMenuIfNeeded(page)
    await page.getByTestId('logout-button').click()
    await page.getByTestId('modal-confirm').click()

    await expect(page.getByTestId('toast-success')).toBeVisible()
    await expect(page.getByText('You have been signed out')).toBeVisible()
  })
})
