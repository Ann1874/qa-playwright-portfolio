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
 * Modal Component Tests
 *
 * Question answered: Do modal dialogs work correctly with proper focus management?
 */
test.describe('Modal Dialogs', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.getByTestId('email-input').fill('user@example.com')
    await page.getByTestId('password-input').fill('password123')
    await page.getByTestId('submit-button').click()
    await expect(page.getByTestId('sidebar')).toBeVisible()
    await openMobileMenuIfNeeded(page)
  })

  test('opens logout confirmation modal', async ({ page }) => {
    await page.getByTestId('logout-button').click()

    await expect(page.getByTestId('modal')).toBeVisible()
    await expect(page.getByText('Are you sure you want to sign out?')).toBeVisible()
  })

  test('closes modal when clicking Cancel', async ({ page }) => {
    await page.getByTestId('logout-button').click()
    await expect(page.getByTestId('modal')).toBeVisible()

    await page.getByTestId('modal-cancel').click()

    await expect(page.getByTestId('modal')).not.toBeVisible()
    await expect(page).toHaveURL('/') // Still on dashboard
  })

  test('closes modal when pressing Escape', async ({ page }) => {
    await page.getByTestId('logout-button').click()
    await expect(page.getByTestId('modal')).toBeVisible()

    await page.keyboard.press('Escape')

    await expect(page.getByTestId('modal')).not.toBeVisible()
  })

  test('confirms logout and redirects to login', async ({ page }) => {
    await page.getByTestId('logout-button').click()
    await page.getByTestId('modal-confirm').click()

    await expect(page).toHaveURL('/login')
  })

  test('shows toast after logout confirmation', async ({ page }) => {
    await page.getByTestId('logout-button').click()
    await page.getByTestId('modal-confirm').click()

    await expect(page.getByTestId('toast-success')).toBeVisible()
    await expect(page.getByText('You have been signed out')).toBeVisible()
  })

  test('traps focus within modal', async ({ page }) => {
    await page.getByTestId('logout-button').click()
    await expect(page.getByTestId('modal')).toBeVisible()

    // Tab through modal elements
    await page.keyboard.press('Tab')
    await expect(page.getByTestId('modal-cancel')).toBeFocused()

    await page.keyboard.press('Tab')
    await expect(page.getByTestId('modal-confirm')).toBeFocused()
  })
})
