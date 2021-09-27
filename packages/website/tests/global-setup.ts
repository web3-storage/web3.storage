// import { chromium } from '@playwright/test';
// import { authenticate } from './utils/auth'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function globalSetup(/* config */) {
  // const { baseURL, storageState } = config.projects[0].use;
  // const browser = await chromium.launch();
  // const page = await browser.newPage();
  // await authenticate(page, baseURL, './state.json')
  // await browser.close();
}

export default globalSetup;