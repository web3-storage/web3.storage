#!/usr/bin/env node

import { getDBClient } from '../lib/utils.js'
import { EmailService, EMAIL_PROVIDERS } from '../lib/email/service.js'
import { checkStorageUsed } from '../jobs/storage.js'
import { envConfig } from '../lib/env.js'

async function main () {
  const db = getDBClient(process.env)
  const emailService = new EmailService({ db, provider: EMAIL_PROVIDERS.dummy })
  await checkStorageUsed({ db, emailService })
}

envConfig()
main()
