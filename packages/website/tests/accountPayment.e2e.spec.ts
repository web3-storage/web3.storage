import { expect, Page, test } from '@playwright/test';

import { E2EScreenshotPath } from './screenshots';

// https://magic.link/docs/auth/introduction/test-mode#usage
const MAGIC_SUCCESS_EMAIL = 'test+success@magic.link';

test.beforeEach(async ({ page }) => {
  await page.goto('/', { waitUntil: 'commit' });
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
    page.on('pageerror', err => {
      console.error('pageerror', err);
    });
    const goToPayment = (page: Page) =>
      Promise.all([
        page.waitForNavigation({
          waitUntil: 'networkidle',
        }),
        page.goto('/account/payment'),
      ]);
    await goToPayment(page);
    await LoginTester().login(page, {
      email: MAGIC_SUCCESS_EMAIL,
    });
    // @todo - this should redirect you back to where you wanted to go: /account/payment
    await expect(page).toHaveURL('/account/');
    await goToPayment(page);
    await expect(page).toHaveURL('/account/payment/');
    await page.screenshot({
      fullPage: true,
      path: await E2EScreenshotPath(testInfo, `accountPayment`),
    });
  });
  test('can enter credit card details', async ({ page }) => {
    await LoginTester().login(page, { email: MAGIC_SUCCESS_EMAIL });
    await page.goto(AccountPaymentTester().url);
    await AccountPaymentTester().fillCreditCardDetails(page);
    await AccountPaymentTester().clickAddCardButton(page);
  });
});

function LoginTester() {
  async function fillLoginForm(page: Page, email: string) {
    await page.locator('.login-email').fill(email);
  }
  async function submitLoginForm(page: Page) {
    const loginButton = page.locator('.login-content .section-email button');
    await loginButton.isVisible();
    await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle' }), loginButton.click()]);
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
    if (new URL(page.url()).pathname !== url) {
      await page.goto(url);
    }
    await fillLoginForm(page, email);
    await submitLoginForm(page);
  }
  return { login, submitLoginForm };
}

function AccountPaymentTester() {
  return {
    url: '/account/payment',
    async fillCreditCardDetails(page: Page) {
      const stripeFrame = page.frameLocator('.billing-card iframe').first();
      await stripeFrame.locator('[placeholder="Card number"]').fill('4242424242424242');
      await stripeFrame.locator('[placeholder="MM / YY"]').fill('04/30');
      await stripeFrame.locator('[placeholder="CVC"]').fill('242');
    },
    async clickAddCardButton(page: Page) {
      await page.locator('text=Payment MethodsAdd Card >> button').click();
    },
  };
}
