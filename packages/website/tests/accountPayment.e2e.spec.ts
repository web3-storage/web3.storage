import { expect, Page, test } from '@playwright/test';

import { E2EScreenshotPath } from './screenshots';

// https://magic.link/docs/auth/introduction/test-mode#usage
const MAGIC_SUCCESS_EMAIL = 'test+success@magic.link';

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
  test('can access when authenticated', async ({ page }, testInfo) => {
    await Promise.all([
      page.waitForNavigation({
        waitUntil: 'networkidle',
      }),
      page.goto('/account/payment'),
    ]);
    await page.locator('.login-email').fill(MAGIC_SUCCESS_EMAIL);
    await page.locator('.login-content .section-email button').click();
    console.log('clicked login form button');
    await page.waitForTimeout(30 * 1000);
    await expect(page).toHaveURL('/account/payment/');
    await page.screenshot({
      fullPage: true,
      path: await E2EScreenshotPath(testInfo, `accountPayment`),
    });
  });
});

function AccountPaymentTester() {
  async function fillLoginForm(page: Page, email: string) {
    await page.locator('.login-email').fill(email);
  }
  async function submitLoginForm(page: Page) {
    await page.waitForTimeout(1000);
    await page.locator('.login-content .section-email button').click();
  }
  async function login(
    page: Page,
    {
      url = '/login/',
      email,
    }: {
      url?: string;
      email: string;
    }
  ) {
    await fillLoginForm(page, email);
    await submitLoginForm(page);
  }
  return { login, submitLoginForm };
}
