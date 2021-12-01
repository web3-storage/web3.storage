#!/usr/bin/env node

import dotenv from 'dotenv'
import debug from 'debug'
import { DBClient } from '@web3-storage/db'
import { Pinata } from './pinata.js'
import { pinToPinata } from './index.js'

const log = debug('pinpin')

const WAIT_BEFORE_CHECKING_AGAIN_SECONDS = 10

async function main () {
  const db = getDBClient(process.env)
  const pinata = getPinata(process.env, { reqsPerSec: 3 })
  while (true) {
    const { total } = await pinToPinata({ db, pinata })
    if (total === 0) {
      log(`Waiting ${WAIT_BEFORE_CHECKING_AGAIN_SECONDS}s before checking for new Pin Requests`)
      await (new Promise((resolve, reject) => {
        setTimeout(() => resolve(true), WAIT_BEFORE_CHECKING_AGAIN_SECONDS * 1000)
      }))
    }
  }
}

/**
 * Create a new Fauna DB client instance from the passed environment variables.
 * @param {Record<string, string|undefined>} env
 */
function getDBClient (env) {
  if (env.DATABASE === 'postgres') {
    const token = env.PG_REST_JWT
    const endpoint = env.PG_REST_URL
    if (!token) {
      throw new Error('missing PG_REST_JWT environment var')
    }
    if (!endpoint) {
      throw new Error('missing PG_REST_URL environment var')
    }
    return new DBClient({ token, endpoint, postgres: true })
  }

  const token = env.FAUNA_KEY
  if (!token) {
    throw new Error('missing FAUNA_KEY environment var')
  }
  return new DBClient({ token: env.FAUNA_KEY })
}

/**
 * Create a new Piñata client instance from the passed environment variables.
 * @param {Record<string, string|undefined>} env
 */
function getPinata (env, { reqsPerSec = 2 }) {
  const apiToken = env.PINATA_JWT
  if (!apiToken) {
    throw new Error('missing PINATA_JWT environment var')
  }
  return new Pinata({ apiToken, reqsPerSec })
}

dotenv.config()
main()
