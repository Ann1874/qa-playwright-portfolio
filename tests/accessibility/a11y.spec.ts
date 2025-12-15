import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

// Helper to open mobile menu if needed
async function openMobileMenuIfNeeded(page: import('@playwright/test').Page) {
  const menuButton = page.getByTestId('menu-button')
  if (await menuButton.isVisible()) {
    await menuButton.click()
    await expect(page.getByTestId('sidebar')).toBeVisible()
  }
}

/**
 * Accessibility Tests (WCAG 2.1 AA)
 *
 * Question answered: Does the application meet basic accessibility standards?
 */
test.describe('Accessibility Compliance', () => {
  test('login page has no critical violations', async ({ page }) => {
    await page.goto('/login')

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()

    const criticalViolations = results.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    )

    expect(criticalViolations).toEqual([])
  })

  test('dashboard has no critical violations', async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.getByTestId('email-input').fill('user@example.com')
    await page.getByTestId('password-input').fill('password123')
    await page.getByTestId('submit-button').click()

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()

    const criticalViolations = results.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    )

    expect(criticalViolations).toEqual([])
  })

  test('settings page has no critical violations', async ({ page }) => {
    await page.goto('/login')
    await page.getByTestId('email-input').fill('user@example.com')
    await page.getByTestId('password-input').fill('password123')
    await page.getByTestId('submit-button').click()

    // Wait for toast to disappear before navigating
    await page.getByTestId('toast-close').click()

    await openMobileMenuIfNeeded(page)
    await page.getByRole('link', { name: 'Settings' }).click()

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze()

    const criticalViolations = results.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    )

    expect(criticalViolations).toEqual([])
  })
})

test.describe('Keyboard Navigation', () => {
  test('login form is fully navigable with keyboard', async ({ page }) => {
    await page.goto('/login')

    // Tab to email input
    await page.keyboard.press('Tab')
    await expect(page.getByTestId('email-input')).toBeFocused()

    // Tab to password input
    await page.keyboard.press('Tab')
    await expect(page.getByTestId('password-input')).toBeFocused()

    // Tab to submit button
    await page.keyboard.press('Tab')
    await expect(page.getByTestId('submit-button')).toBeFocused()
  })

  test('can complete login using only keyboard', async ({ page }) => {
    await page.goto('/login')

    await page.keyboard.press('Tab')
    await page.keyboard.type('user@example.com')

    await page.keyboard.press('Tab')
    await page.keyboard.type('password123')

    await page.keyboard.press('Tab')
    await page.keyboard.press('Enter')

    await expect(page).toHaveURL('/')
  })

  test('sidebar navigation works with keyboard', async ({ page }) => {
    await page.goto('/login')
    await page.getByTestId('email-input').fill('user@example.com')
    await page.getByTestId('password-input').fill('password123')
    await page.getByTestId('submit-button').click()

    await openMobileMenuIfNeeded(page)

    // Focus on Settings link and activate
    const settingsLink = page.getByRole('link', { name: 'Settings' })
    await settingsLink.focus()
    await page.keyboard.press('Enter')

    await expect(page).toHaveURL('/settings')
  })
})

test.describe('Screen Reader Support', () => {
  test('form inputs have associated labels', async ({ page }) => {
    await page.goto('/login')

    const emailInput = page.getByTestId('email-input')
    const passwordInput = page.getByTestId('password-input')

    // Check inputs have accessible names
    await expect(emailInput).toHaveAttribute('id', 'email')
    await expect(passwordInput).toHaveAttribute('id', 'password')

    // Check labels exist
    await expect(page.locator('label[for="email"]')).toBeVisible()
    await expect(page.locator('label[for="password"]')).toBeVisible()
  })

  test('error messages are announced', async ({ page }) => {
    await page.goto('/login')
    await page.getByTestId('submit-button').click()

    const errorMessage = page.getByTestId('error-message')
    await expect(errorMessage).toHaveAttribute('role', 'alert')
  })

  test('navigation has proper landmarks', async ({ page }) => {
    await page.goto('/login')
    await page.getByTestId('email-input').fill('user@example.com')
    await page.getByTestId('password-input').fill('password123')
    await page.getByTestId('submit-button').click()

    // Check main content area exists
    await expect(page.getByTestId('main-content')).toBeVisible()

    // Check navigation exists
    await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible()
  })

  test('alerts have proper ARIA roles', async ({ page }) => {
    await page.goto('/login')
    await page.getByTestId('email-input').fill('user@example.com')
    await page.getByTestId('password-input').fill('password123')
    await page.getByTestId('submit-button').click()

    const alertsList = page.getByTestId('alerts-list')
    await expect(alertsList).toHaveAttribute('role', 'region')

    const alerts = page.locator('[role="alert"]')
    await expect(alerts).toHaveCount(3)
  })
})
