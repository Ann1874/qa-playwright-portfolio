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
 * Dashboard Navigation & Components Tests
 *
 * Question answered: Can users navigate the dashboard and interact with widgets?
 */
test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login')
    await page.getByTestId('email-input').fill('user@example.com')
    await page.getByTestId('password-input').fill('password123')
    await page.getByTestId('submit-button').click()
    await expect(page.getByTestId('sidebar')).toBeVisible()
  })

  test('displays all stat cards', async ({ page }) => {
    const statCards = page.getByTestId('stat-card')
    await expect(statCards).toHaveCount(4)
  })

  test('displays activity feed with entries', async ({ page }) => {
    const activityFeed = page.getByTestId('activity-feed')
    await expect(activityFeed).toBeVisible()

    const activityItems = activityFeed.locator('li')
    await expect(activityItems).toHaveCount(5)
  })

  test('displays system alerts', async ({ page }) => {
    const alertsList = page.getByTestId('alerts-list')
    await expect(alertsList).toBeVisible()

    await expect(page.getByTestId('alert-warning')).toBeVisible()
    await expect(page.getByTestId('alert-error')).toBeVisible()
    await expect(page.getByTestId('alert-info')).toBeVisible()
  })

  test('displays data table with projects', async ({ page }) => {
    const dataTable = page.getByTestId('data-table')
    await expect(dataTable).toBeVisible()

    const rows = page.getByTestId('table-row')
    await expect(rows).toHaveCount(5)
  })

  test('allows filtering table data', async ({ page }) => {
    const searchInput = page.getByTestId('table-search')
    await searchInput.fill('Alpha')

    const rows = page.getByTestId('table-row')
    await expect(rows).toHaveCount(1)

    await searchInput.clear()
    await expect(rows).toHaveCount(5)
  })

  test('allows sorting table by clicking headers', async ({ page }) => {
    const dataTable = page.getByTestId('data-table')

    // Click on Progress header to sort
    await dataTable.getByRole('columnheader', { name: /Progress/ }).click()

    // First row should have lowest progress after ascending sort
    const firstRow = page.getByTestId('table-row').first()
    await expect(firstRow).toContainText('Project Epsilon')
  })

  test('navigates between dashboard and settings', async ({ page }) => {
    await openMobileMenuIfNeeded(page)
    await page.getByRole('link', { name: 'Settings' }).click()
    await expect(page).toHaveURL('/settings')
    await expect(page.getByText('Manage your account preferences')).toBeVisible()

    await openMobileMenuIfNeeded(page)
    await page.getByRole('link', { name: 'Dashboard' }).click()
    await expect(page).toHaveURL('/')
    await expect(page.getByText("Here's what's happening today")).toBeVisible()
  })
})
