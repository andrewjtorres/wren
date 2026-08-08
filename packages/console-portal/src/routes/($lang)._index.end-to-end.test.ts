import { AxeBuilder } from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('should not have any automatically detectable accessibility issues', async ({ page }, testInfo) => {
  const axeBuilder = new AxeBuilder({
    page,
  }).options({
    reporter: 'v2',
  })

  await page.goto('/en')
  await page.getByTestId('2r85lcpfl9').waitFor()

  const accessibilityAnalysisResults = await axeBuilder.analyze()

  await testInfo.attach('accessibility-analysis-results', {
    body: JSON.stringify(accessibilityAnalysisResults, undefined, 2),
    contentType: 'application/json',
  })

  expect(accessibilityAnalysisResults.violations).toEqual([])
})

test(
  'should render the root index route in english',
  {
    tag: ['@visual'],
  },
  async ({ page }) => {
    await page.goto('/en')
    await page.getByTestId('2r85lcpfl9').waitFor()

    await expect(page).toHaveScreenshot({
      fullPage: true,
    })
  },
)

test(
  'should render the root index route in spanish',
  {
    tag: ['@visual'],
  },
  async ({ page }) => {
    await page.goto('/es')
    await page.getByTestId('2r85lcpfl9').waitFor()

    await expect(page).toHaveScreenshot({
      fullPage: true,
    })
  },
)
