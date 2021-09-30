import { test, expect } from "@playwright/test";
import { authenticate } from './utils/auth'

test.describe('Uploading Files', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    console.log(baseURL)
    await authenticate(page, baseURL)
    await page.goto("/upload");
  })

  test('🔎 Should have the input to upload and the upload button initially disabled', async ({ page }) => {
    const input = page.locator('#file');
    await expect(input).toHaveAttribute('required', '');

    const button = page.locator('#upload-file');
    await expect(button).toBeDisabled();
  });

  test('⬆ Should upload a text file and navigate to the files page', async ({ page }) => {
    const input = page.locator('#file');
    input.setInputFiles({ name: 'Testy.txt', mimeType: 'text/raw', buffer: Buffer.from('Web3.storage is something else!') })

    const button = page.locator('#upload-file');
    await expect(button).not.toBeDisabled();

    await button.click();

    await page.waitForSelector('text="Upload More Files"');
    expect(await page.url()).toMatch(/\/files/g);

    const fileUploaded = page.locator('table.w-full td:nth-child(3)')
    expect(await fileUploaded.textContent()).toMatch(/Testy.txt/g);

    // 🕵️‍♀️ Let's make sure the CID matches
    const cid = page.locator('table.w-full td:nth-child(4)')
    expect(await cid.textContent()).toMatch(/bafybeicjm\.\.\.fjbk4m/g);
  });
});

test.describe('Deleting uploads', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await authenticate(page, baseURL)
  })

  test('🗑 Should be able to delete a upload', async ({ page }) => {
    await page.goto('/files')

    // 🎨 Delete Button shouldn't be clickable when not selecting anything
    const deleteButton = page.locator('text="Delete"')
    expect(deleteButton).toBeDisabled();

    const checkboxSelector = 'table.w-full td:nth-child(1)'
    await page.waitForSelector(checkboxSelector);
    await page.click(checkboxSelector);

    // 🎨 Should outline the table row
    const uploadInfoExcludingCheckbox = page.locator('table.w-full td:not(:first-child)')

    // 👀 Let's also test if we have the info elements while we're here
    for (let i = 0; i < 6; i++) {
      expect(uploadInfoExcludingCheckbox.nth(i)).toHaveClass(/bg-w3storage-red-accent/)
    }

    // 🎨 Delete Button should be clickable now!
    expect(deleteButton).not.toBeDisabled();

    // 🖱 Let's click it and see if an alert pops up!
    let dialogHasBeenShowed = false
    page.on('dialog', (dialog) => {
      dialogHasBeenShowed = true;
      dialog.accept();
    })
    await deleteButton.click();
    expect(dialogHasBeenShowed).toBeTruthy();

    // 👀 The file should be deleted
    expect(uploadInfoExcludingCheckbox).not.toBeVisible()
  })

  test('📄 Should show the blank state when no uploads are present', async ({ page }) => {
    await page.goto('/files')

    await page.waitForSelector('text="No files"')

    const uploadFilesButton = page.locator('text="Upload Files"')
    expect(uploadFilesButton).not.toBeDisabled();

    const emptyStateTableItems = page.locator('table th')
    expect(await emptyStateTableItems.count()).toBe(6);
  })
});
