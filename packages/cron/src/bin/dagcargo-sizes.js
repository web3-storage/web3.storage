#!/usr/bin/env node

import { updateDagSizes } from '../jobs/dagcargo.js'
import { envConfig } from '../lib/env.js'
import { getPg } from '../lib/utils.js'

const oneMonthAgo = () => new Date().setMonth(new Date().getMonth() - 1)

async function main () {
  const rwPg = getPg(process.env, 'rw')
  const roPg = getPg(process.env, 'ro')

  try {
    const after = new Date(process.env.AFTER || oneMonthAgo())
    await updateDagSizes({ rwPg, roPg, after })
  } finally {
    await rwPg.end()
    await roPg.end()
  }
}

envConfig()
main()
