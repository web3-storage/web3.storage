#!/usr/bin/env node

import { deleteRemotePins } from '../jobs/delete-remote-pins.js'
import { envConfig } from '../lib/env.js'
import { getPgPool } from '../lib/utils.js'

async function main () {
  const rwPgPool = getPgPool(process.env, 'rw')
  const batchSize = process.env.BATCH_SIZE ? parseInt(process.env.BATCH_SIZE, 10) : undefined

  try {
    await deleteRemotePins({ rwPgPool, batchSize })
  } finally {
    await rwPgPool.end()
  }
}

envConfig()
main()
