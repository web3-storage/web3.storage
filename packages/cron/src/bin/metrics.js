#!/usr/bin/env node

import dotenv from 'dotenv'
import { updateMetrics } from '../jobs/metrics.js'
import { getDBClient } from '../lib/utils.js'

async function main () {
  const env = process.env.ENV || 'dev'
  const db = getDBClient(process.env)

  await updateMetrics({ env, db })
}

dotenv.config()
main()
