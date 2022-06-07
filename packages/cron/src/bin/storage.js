#!/usr/bin/env node

import { getDBClient, getPg } from '../lib/utils.js'
import { EmailService } from '../lib/email/service.js'
import { checkStorageUsed } from '../jobs/storage.js'
import { envConfig } from '../lib/env.js'

async function main () {
  const db = getDBClient(process.env)
  const roPg = getPg(process.env, 'ro')
  const emailService = new EmailService({ db })
  console.log('About to run checkStorageUsed.')
  await checkStorageUsed({ roPg, emailService })
}

envConfig()
main()
