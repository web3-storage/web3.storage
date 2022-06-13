#!/usr/bin/env node

import { updateDagSizes } from '../jobs/dagcargo.js'
import { envConfig } from '../lib/env.js'
import { getPg } from '../lib/utils.js'

/**
 *
 * @param {number} days
 */
const xDaysAgo = (days) => new Date().setDate(new Date().getDate() - days)

async function main () {
  const rwPg = getPg(process.env, 'rw')
  const roPg = getPg(process.env, 'ro')
  rwPg.connect()
  roPg.connect()

  try {
    const after = new Date(process.env.AFTER || xDaysAgo(7))
    await updateDagSizes({ rwPg, roPg, after })
  } finally {
    await rwPg.end()
    await roPg.end()
  }
}

envConfig()
main()
