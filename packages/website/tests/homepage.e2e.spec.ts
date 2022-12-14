import { test } from '@playwright/test';

import { E2EScreenshotPath } from './screenshots.js';

test.beforeEach(async ({ page }, testInfo) => {
  console.log(`Running test: ${testInfo.title}`);
});

test.describe('homepage', () => {
  test('should be screenshottable', async ({ page }, testInfo) => {
    await page.goto('/');
    await page.screenshot({
      fullPage: true,
      path: await E2EScreenshotPath(testInfo, `homepage`),
    });
  });
});
