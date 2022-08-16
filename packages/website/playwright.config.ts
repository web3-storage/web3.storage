import path from 'path';

import type { PlaywrightTestConfig } from '@playwright/test';
import { devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

const WEBSITE_TESTS_DIR_PATH = './tests';

// if an env var is defined, return it as a number
// if it can't be parsed, throw
const envNumber = (varName: string, defaultValue: number, env = process.env) => {
  if (!(varName in env)) {
    return defaultValue;
  }
  const parsedNum = parseInt(env[varName] ?? '', 10);
  if (isNaN(parsedNum)) {
    throw new Error(`error parsing env[${varName}] as number`);
  }
  return parsedNum;
};

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const config: PlaywrightTestConfig = {
  testDir: WEBSITE_TESTS_DIR_PATH,
  /* Maximum time one test can run for. */
  timeout: envNumber('PLAYWRIGHT_TIMEOUT', 30 * 1000),
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in `await expect(locator).toHaveText();`
     */
    timeout: 5000,
  },
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI
    ? [['list'], ['github'], ['json', { outputFile: path.join(__dirname, 'playwright-report.json') }]]
    : 'line',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
    actionTimeout: 0,
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:4000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      testDir: WEBSITE_TESTS_DIR_PATH,
      use: {
        ...devices['Desktop Chrome'],
      },
    },

    {
      name: 'firefox',
      testDir: WEBSITE_TESTS_DIR_PATH,
      use: {
        ...devices['Desktop Firefox'],
      },
    },

    {
      name: 'webkit',
      testDir: WEBSITE_TESTS_DIR_PATH,
      use: {
        ...devices['Desktop Safari'],
      },
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: {
    //     ...devices['Pixel 5'],
    //   },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: {
    //     ...devices['iPhone 12'],
    //   },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: {
    //     channel: 'msedge',
    //   },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: {
    //     channel: 'chrome',
    //   },
    // },
  ],

  /* Folder for test artifacts such as screenshots, videos, traces, etc. */
  // outputDir: 'test-results/',
  globalSetup: require.resolve('tests/playwright/globalSetup.js'),
};

export default config;
