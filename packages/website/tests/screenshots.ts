import { extname } from 'path';

import type { TestInfo } from '@playwright/test';

/**
 * Given a screenshot name, return an absolute path to a good place to store it.
 * The resulting path will be to a '.png' file unless 'name' already has an extname.
 * @param testInfo - @playwright/test TestInfo
 * @param name - logical name of screenshot
 * @returns absolute path to a good place to store a screenshot
 */
export async function E2EScreenshotPath(testInfo: Pick<TestInfo, 'outputPath'>, name: string) {
  if (!extname(name)) {
    name = `${name}.png`;
  }
  const path = testInfo.outputPath(name);
  return path;
}
