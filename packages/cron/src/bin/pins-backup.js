#!/usr/bin/env node

import { backupPins } from '../jobs/pins-backup.js'
import { envConfig } from '../lib/env.js'
import { getCluster, getPgPool } from '../lib/utils.js'

async function main () {
  const rwPg = getPgPool(process.env, 'rw')
  const roPg = getPgPool(process.env, 'ro')
  const cluster = getCluster(process.env)

  try {
    await backupPins({ env: process.env, rwPg, roPg, cluster })
  } finally {
    await rwPg.end()
    await roPg.end()
  }
}

envConfig()
main()
