import { test } from '@playwright/test';

import { E2EScreenshotPath } from './screenshots.js';

test.beforeEach(async ({ page }) => {
  // Sorry, just giving this a try
  await new Promise(r => setTimeout(r, 20000));
  await page.goto('/');
});

test.describe('homepage', () => {
  test('should be screenshottable', async ({ page }, testInfo) => {
    await page.screenshot({
      fullPage: true,
      path: await E2EScreenshotPath(testInfo, `homepage`),
    });
  });
});
