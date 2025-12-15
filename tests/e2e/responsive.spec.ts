import { test, expect } from '@playwright/test'

/**
 * Responsive Design Tests
 *
 * Question answered: Does the app adapt correctly to different screen sizes?
 */
test.describe('Mobile Navigation', () => {
  test.use({ viewport: { width: 375, height: 667 } }) // iPhone SE

  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.getByTestId('email-input').fill('user@example.com')
    await page.getByTestId('password-input').fill('password123')
    await page.getByTestId('submit-button').click()
  })

  test('shows hamburger menu on mobile', async ({ page }) => {
    await expect(page.getByTestId('menu-button')).toBeVisible()
  })

  test('sidebar is hidden by default on mobile', async ({ page }) => {
    const sidebar = page.getByTestId('sidebar')
    // Sidebar should be off-screen (not visible in viewport)
    const box = await sidebar.boundingBox()
    expect(box?.x).toBeLessThan(0)
  })

  test('opens sidebar when clicking hamburger menu', async ({ page }) => {
    await page.getByTestId('menu-button').click()

    // Wait for animation
    await page.waitForTimeout(300)

    const sidebar = page.getByTestId('sidebar')
    // Sidebar should now be visible (x >= 0)
    const box = await sidebar.boundingBox()
    expect(box?.x).toBeGreaterThanOrEqual(0)
  })

  test('shows backdrop when sidebar is open', async ({ page }) => {
    await page.getByTestId('menu-button').click()

    await expect(page.getByTestId('sidebar-backdrop')).toBeVisible()
  })

  test('closes sidebar when clicking backdrop', async ({ page }) => {
    await page.getByTestId('menu-button').click()
    await expect(page.getByTestId('sidebar-backdrop')).toBeVisible()

    // Click on the right side of the screen (away from sidebar)
    await page.getByTestId('sidebar-backdrop').click({ position: { x: 350, y: 300 } })

    await expect(page.getByTestId('sidebar-backdrop')).not.toBeVisible()
  })

  test('closes sidebar when clicking toggle button', async ({ page }) => {
    await page.getByTestId('menu-button').click()
    await expect(page.getByTestId('sidebar-toggle')).toBeVisible()

    await page.getByTestId('sidebar-toggle').click()

    // Wait for animation
    await page.waitForTimeout(300)
    const sidebar = page.getByTestId('sidebar')
    const box = await sidebar.boundingBox()
    expect(box?.x).toBeLessThan(0)
  })

  test('closes sidebar after navigation', async ({ page }) => {
    await page.getByTestId('menu-button').click()

    await page.getByRole('link', { name: 'Settings' }).click()

    await expect(page).toHaveURL('/settings')
    // Wait for animation
    await page.waitForTimeout(300)
    const sidebar = page.getByTestId('sidebar')
    const box = await sidebar.boundingBox()
    expect(box?.x).toBeLessThan(0)
  })

  test('can complete full navigation flow on mobile', async ({ page }) => {
    // Open menu and go to settings
    await page.getByTestId('menu-button').click()
    await page.getByRole('link', { name: 'Settings' }).click()
    await expect(page).toHaveURL('/settings')

    // Open menu and go back to dashboard
    await page.getByTestId('menu-button').click()
    await page.getByRole('link', { name: 'Dashboard' }).click()
    await expect(page).toHaveURL('/')
  })
})

test.describe('Desktop Layout', () => {
  test.use({ viewport: { width: 1280, height: 720 } })

  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.getByTestId('email-input').fill('user@example.com')
    await page.getByTestId('password-input').fill('password123')
    await page.getByTestId('submit-button').click()
  })

  test('hamburger menu is hidden on desktop', async ({ page }) => {
    await expect(page.getByTestId('menu-button')).not.toBeVisible()
  })

  test('sidebar is always visible on desktop', async ({ page }) => {
    const sidebar = page.getByTestId('sidebar')
    await expect(sidebar).toBeVisible()
    const box = await sidebar.boundingBox()
    expect(box?.x).toBeGreaterThanOrEqual(0)
  })

  test('sidebar toggle is visible on desktop', async ({ page }) => {
    await expect(page.getByTestId('sidebar-toggle')).toBeVisible()
  })
})

test.describe('Responsive Content', () => {
  test('stats grid is single column on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/login')
    await page.getByTestId('email-input').fill('user@example.com')
    await page.getByTestId('password-input').fill('password123')
    await page.getByTestId('submit-button').click()

    const statsGrid = page.getByTestId('stats-grid')
    const columns = await statsGrid.evaluate((el) => {
      return window.getComputedStyle(el).gridTemplateColumns.split(' ').length
    })
    expect(columns).toBe(1)
  })

  test('stats grid shows 4 columns on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto('/login')
    await page.getByTestId('email-input').fill('user@example.com')
    await page.getByTestId('password-input').fill('password123')
    await page.getByTestId('submit-button').click()

    const statsGrid = page.getByTestId('stats-grid')
    const columns = await statsGrid.evaluate((el) => {
      return window.getComputedStyle(el).gridTemplateColumns.split(' ').length
    })
    expect(columns).toBe(4)
  })
})
