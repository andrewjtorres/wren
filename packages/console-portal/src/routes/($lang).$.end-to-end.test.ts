import { AxeBuilder } from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('should not have any automatically detectable accessibility issues', async ({ page }, testInfo) => {
  const axeBuilder = new AxeBuilder({
    page,
  }).options({
    reporter: 'v2',
  })

  await page.goto('/en/not-found')
  await page.getByTestId('nh9h797tr2').waitFor()

  const accessibilityAnalysisResults = await axeBuilder.analyze()

  await testInfo.attach('accessibility-analysis-results', {
    body: JSON.stringify(accessibilityAnalysisResults, undefined, 2),
    contentType: 'application/json',
  })

  expect(accessibilityAnalysisResults.violations).toEqual([])
})
