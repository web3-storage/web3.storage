#!/usr/bin/env node

import dotenv from 'dotenv'
import { pinToPinata } from '../jobs/pinata.js'
import { getPinata, getDBClient } from '../lib/utils.js'

async function main () {
  const env = process.env.ENV || 'dev'
  const db = getDBClient(process.env)
  const pinata = getPinata(process.env, { reqsPerSec: 3 })
  await pinToPinata({ db, pinata, env })
}

dotenv.config()
main()
