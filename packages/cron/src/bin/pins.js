#!/usr/bin/env node

import fetch from '@web-std/fetch'
import { updatePinStatuses } from '../jobs/pins.js'
import { envConfig } from '../lib/env.js'
import { getCluster, getClusterIPFSProxy, getDBClient } from '../lib/utils.js'

/** @ts-ignore */
global.fetch = fetch

async function main () {
  const env = process.env.ENV || 'dev'
  const cluster = getCluster(process.env)
  const ipfs = getClusterIPFSProxy(process.env)
  const db = getDBClient(process.env)

  await updatePinStatuses({ env, db, cluster, ipfs })
}

envConfig()

main()
