import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

// FIXME: Issue with magic auth + playwright, tracking on https://github.com/microsoft/playwright/issues/9112
async function globalSetup(/* config */) {}

export default globalSetup;