#!/usr/bin/env node
import { updateDagSizes } from '../jobs/dagcargo.js'
import { envConfig } from '../lib/env.js'
import { getDBClient } from '../lib/utils.js'

const oneMonthAgo = () => new Date().setMonth(new Date().getMonth() - 1)

async function main () {
  const dbClient = getDBClient(process.env)

  const after = new Date(process.env.AFTER || oneMonthAgo())
  await updateDagSizes({ dbClient, after })
}

envConfig()
main()
