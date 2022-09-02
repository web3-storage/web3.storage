#!/usr/bin/env node

import fetch from '@web-std/fetch'
import { postNamesToW3name } from '../jobs/names.js'
import { envConfig } from '../lib/env.js'
import { getDBClient } from '../lib/utils.js'

/** @ts-ignore */
global.fetch = fetch

async function main () {
  const env = process.env.ENV || 'dev'
  const db = getDBClient(process.env)

  await postNamesToW3name({ env, db })
}

envConfig()

main()
