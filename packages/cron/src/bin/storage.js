#!/usr/bin/env node

import { getDBClient, getPg } from '../lib/utils.js'
import { EmailService } from '../lib/email/service.js'
import { checkStorageUsed } from '../jobs/storage.js'
import { envConfig } from '../lib/env.js'

async function main () {
  const db = getDBClient(process.env)
  const roPg = await getPg(process.env, 'ro')
  const emailService = new EmailService({ db })
  await checkStorageUsed({ roPg, emailService })
}

envConfig()
main()
