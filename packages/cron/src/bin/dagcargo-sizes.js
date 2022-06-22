#!/usr/bin/env node

import { updateDagSizes } from '../jobs/dagcargo.js'
import { envConfig } from '../lib/env.js'
import { getCargoPgPool, getPg } from '../lib/utils.js'

/**
 *
 * @param {number} days
 */
const xDaysAgo = (days) => new Date().setDate(new Date().getDate() - days)

async function main () {
  const rwPg = await getPg(process.env, 'rw')
  const cargoPool = getCargoPgPool(process.env)

  try {
    const after = new Date(process.env.AFTER || xDaysAgo(7))
    await updateDagSizes({ rwPg, cargoPool, after })
  } finally {
    await rwPg.end()
    await cargoPool.end()
  }
}

envConfig()
main()
