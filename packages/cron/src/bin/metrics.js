#!/usr/bin/env node

import { updateMetrics } from '../jobs/metrics.js'
import { envConfig } from '../lib/env.js'
import { getDBClient } from '../lib/utils.js'

async function main () {
  const env = process.env.ENV || 'dev'
  const db = getDBClient(process.env)

  await updateMetrics({ env, db })
}

envConfig()
main()
