async function authenticate(page, baseURL, debug = false) {
  debug && console.log("🐙 Started Github login");
  await page.goto(`${baseURL}/login/`);

  await page.click("form > div > button");

  await page.waitForSelector("#login_field");

  await page.fill("#login_field", process.env.E2E_GITHUB_TEST_EMAIL);
  await page.fill("#password", process.env.E2E_GITHUB_TEST_PASSWORD);
  await page.click('text="Sign in"');

  debug && console.log("🐙 Finished Github login");

  await page.waitForSelector('text="Your account"');
  // await page.context().storageState({ path: storageState });

  // debug && console.log("✅ Saved authentication state to ", storageState);
}

export { authenticate };
