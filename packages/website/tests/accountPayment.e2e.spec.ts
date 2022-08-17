import { expect, test } from '@playwright/test';

import { E2EScreenshotPath } from './screenshots';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test.describe('/account/payment', () => {
  test('redirects to /login/ when not authenticated', async ({ page }, testInfo) => {
    await Promise.all([
      page.waitForNavigation({
        waitUntil: 'networkidle',
      }),
      page.goto('/account/payment'),
    ]);
    await expect(page).toHaveURL('/login/');
    await page.screenshot({
      fullPage: true,
      path: await E2EScreenshotPath(testInfo, `accountPayment-noauth`),
    });
  });
});
