#!/usr/bin/env node

import { updateMetrics } from '../jobs/metrics.js'
import { envConfig } from '../lib/env.js'
import { getPgPool } from '../lib/utils.js'

async function main () {
  const rwPg = await getPgPool(process.env, 'rw')
  const roPg = await getPgPool(process.env, 'ro')

  try {
    await updateMetrics({ rwPg, roPg })
  } finally {
    await rwPg.end()
    await roPg.end()
  }
}

envConfig()
main()
