#!/usr/bin/env node

import { getDBClient } from '../lib/utils.js'
import { checkStorageUsed } from '../jobs/storage.js'
import { envConfig } from '../lib/env.js'

async function main () {
  const db = getDBClient(process.env)
  await checkStorageUsed(db)
}

envConfig()
main()
