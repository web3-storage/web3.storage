/* global MAGIC_SECRET_KEY SALT CLUSTER_BASIC_AUTH_TOKEN CLUSTER_API_URL SENTRY_DSN SENTRY_RELEASE DANGEROUSLY_BYPASS_MAGIC_AUTH PG_REST_URL PG_REST_JWT */
/* global S3_BUCKET_ENDPOINT S3_BUCKET_NAME S3_BUCKET_REGION S3_ACCESS_KEY_ID S3_SECRET_ACCESS_KEY_ID ENV MAINTENANCE_MODE VERSION COMMITHASH BRANCH */
import Toucan from 'toucan-js'
import { S3Client } from '@aws-sdk/client-s3/dist-es/S3Client.js'
import { Magic } from '@magic-sdk/admin'
import { DBClient } from '@web3-storage/db'
import { Cluster } from '@nftstorage/ipfs-cluster'

import { DEFAULT_MODE } from './maintenance.js'
import pkg from '../package.json'

/**
 * @typedef {object} Env
 * @property {Cluster} cluster
 * @property {Magic} magic
 * @property {DBClient} db
 * @property {string} SALT
 * @property {import('./maintenance').Mode} MODE
 * @property {S3Client} [s3Client]
 * @property {string} [s3BucketName]
 * @property {string} [s3BucketRegion]
 */

/**
 * @param {Request} req
 * @param {Env} env
 * @param {FetchEvent} event
 */
export function envAll (_, env, event) {
  env.sentry = (env.SENTRY_DSN || typeof SENTRY_DSN !== 'undefined') && new Toucan({
    dsn: env.SENTRY_DSN || SENTRY_DSN,
    context: event,
    allowedHeaders: ['user-agent'],
    allowedSearchParams: /(.*)/,
    debug: false,
    rewriteFrames: {
      root: '/'
    },
    environment: env.ENV || ENV,
    release: env.SENTRY_RELEASE || SENTRY_RELEASE,
    pkg
  })
  env.magic = new Magic(env.MAGIC_SECRET_KEY || MAGIC_SECRET_KEY)

  // We can remove this when magic admin sdk supports test mode
  if (new URL(event.request.url).origin === 'http://testing.web3.storage' && typeof DANGEROUSLY_BYPASS_MAGIC_AUTH !== 'undefined') {
    // only set this in test/scripts/worker-globals.js
    console.log(`!!! DANGEROUSLY_BYPASS_MAGIC_AUTH=${DANGEROUSLY_BYPASS_MAGIC_AUTH} !!!`)
    env.DANGEROUSLY_BYPASS_MAGIC_AUTH = DANGEROUSLY_BYPASS_MAGIC_AUTH
  }

  env.db = new DBClient({
    endpoint: env.PG_REST_URL || PG_REST_URL,
    token: env.PG_REST_JWT || PG_REST_JWT
  })

  env.SALT = env.SALT || SALT
  env.MODE = env.MAINTENANCE_MODE || (typeof MAINTENANCE_MODE === 'undefined' ? DEFAULT_MODE : MAINTENANCE_MODE)
  env.VERSION = env.VERSION || VERSION
  env.COMMITHASH = env.COMMITHASH || COMMITHASH
  env.BRANCH = env.BRANCH || BRANCH

  const clusterAuthToken = env.CLUSTER_BASIC_AUTH_TOKEN || (typeof CLUSTER_BASIC_AUTH_TOKEN === 'undefined' ? undefined : CLUSTER_BASIC_AUTH_TOKEN)
  const headers = clusterAuthToken ? { Authorization: `Basic ${clusterAuthToken}` } : {}
  env.cluster = new Cluster(env.CLUSTER_API_URL || CLUSTER_API_URL, { headers })

  // backups not required in dev mode
  if ((env.ENV === 'dev' || ENV === 'dev') && !(env.S3_ACCESS_KEY_ID || typeof S3_ACCESS_KEY_ID !== 'undefined')) {
    console.log('running without backups wired up')
  } else {
    const s3Endpoint = env.S3_BUCKET_ENDPOINT || (typeof S3_BUCKET_ENDPOINT === 'undefined' ? undefined : S3_BUCKET_ENDPOINT)

    env.s3BucketName = env.S3_BUCKET_NAME || S3_BUCKET_NAME
    env.s3BucketRegion = env.S3_BUCKET_REGION || S3_BUCKET_REGION

    env.s3Client = new S3Client({
      endpoint: s3Endpoint,
      forcePathStyle: !!s3Endpoint, // Force path if endpoint provided
      region: env.S3_BUCKET_REGION || S3_BUCKET_REGION,
      credentials: {
        accessKeyId: env.S3_ACCESS_KEY_ID || S3_ACCESS_KEY_ID,
        secretAccessKey: env.S3_SECRET_ACCESS_KEY_ID || S3_SECRET_ACCESS_KEY_ID
      }
    })
  }
}
