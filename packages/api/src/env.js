import Toucan from 'toucan-js'
import { S3Client } from '@aws-sdk/client-s3/dist-es/S3Client.js'
import { Magic } from '@magic-sdk/admin'
import { DBClient } from '@web3-storage/db'
import { Cluster } from '@nftstorage/ipfs-cluster'
import { DEFAULT_MODE } from './maintenance.js'
import pkg from '../package.json'

/**
 * @typedef {object} Env
 * // Environment vars
 * @property {string} ENV
 * @property {string} BRANCH
 * @property {string} VERSION
 * @property {string} COMMITHASH
 * @property {string} SALT
 * @property {string} MAGIC_SECRET_KEY
 * @property {string} CLUSTER_API_URL
 * @property {string} [CLUSTER_BASIC_AUTH_TOKEN]
 * @property {string} PG_REST_URL
 * @property {string} PG_REST_JWT
 * @property {string} [S3_BUCKET_ENDPOINT]
 * @property {string} [S3_BUCKET_NAME]
 * @property {string} [S3_BUCKET_REGION]
 * @property {string} [S3_ACCESS_KEY_ID]
 * @property {string} [S3_SECRET_ACCESS_KEY_ID]
 * @property {string} [SENTRY_DSN]
 * @property {string} [SENTRY_RELEASE]
 * @property {string} MAINTENANCE_MODE
 * @property {string} [DANGEROUSLY_BYPASS_MAGIC_AUTH]
 * // Derived values and class dependencies
 * @property {Cluster} cluster
 * @property {Magic} magic
 * @property {DBClient} db
 * @property {import('./maintenance').Mode} MODE
 * @property {S3Client} [s3Client]
 * @property {string} [s3BucketName]
 * @property {string} [s3BucketRegion]
 * // Durable Objects
 * @property {DurableObjectNamespace} NAME_ROOM
 *
 * From: https://github.com/cloudflare/workers-types
 *
 * @typedef {{
 *  toString(): string
 *  equals(other: DurableObjectId): boolean
 *  readonly name?: string
 * }} DurableObjectId
 *
 * @typedef {{
 *   newUniqueId(options?: { jurisdiction?: string }): DurableObjectId
 *   idFromName(name: string): DurableObjectId
 *   idFromString(id: string): DurableObjectId
 *   get(id: DurableObjectId): DurableObjectStub
 * }} DurableObjectNamespace
 *
 * @typedef {{
 *   readonly id: DurableObjectId
 *   readonly name?: string
 *   fetch(requestOrUrl: Request | string, requestInit?: RequestInit | Request): Promise<Response>
 * }} DurableObjectStub
 */

/**
 * @param {Request} req
 * @param {Env} env
 * @param {import('./index.js').Ctx} ctx
 */
export function envAll (req, env, ctx) {
  env.sentry = env.SENTRY_DSN && new Toucan({
    dsn: env.SENTRY_DSN,
    context: ctx,
    allowedHeaders: ['user-agent', 'x-client'],
    allowedSearchParams: /(.*)/,
    debug: false,
    rewriteFrames: {
      root: '/'
    },
    environment: env.ENV,
    release: env.SENTRY_RELEASE,
    pkg
  })
  env.magic = new Magic(env.MAGIC_SECRET_KEY)

  // We can remove this when magic admin sdk supports test mode
  if (new URL(req.url).origin === 'http://testing.web3.storage' && env.DANGEROUSLY_BYPASS_MAGIC_AUTH !== 'undefined') {
    // only set this in test/scripts/worker-globals.js
    console.log(`!!! DANGEROUSLY_BYPASS_MAGIC_AUTH=${env.DANGEROUSLY_BYPASS_MAGIC_AUTH} !!!`)
  }

  env.db = new DBClient({
    endpoint: env.PG_REST_URL,
    token: env.PG_REST_JWT
  })

  env.MODE = env.MAINTENANCE_MODE || DEFAULT_MODE

  const clusterAuthToken = env.CLUSTER_BASIC_AUTH_TOKEN
  const headers = clusterAuthToken ? { Authorization: `Basic ${clusterAuthToken}` } : {}
  env.cluster = new Cluster(env.CLUSTER_API_URL, { headers })

  // backups not required in dev mode
  if (env.ENV === 'dev' && !env.S3_ACCESS_KEY_ID) {
    console.log('running without backups wired up')
  } else {
    env.s3BucketName = env.S3_BUCKET_NAME
    env.s3BucketRegion = env.S3_BUCKET_REGION

    env.s3Client = new S3Client({
      endpoint: env.S3_BUCKET_ENDPOINT,
      forcePathStyle: !!env.S3_BUCKET_ENDPOINT, // Force path if endpoint provided
      region: env.S3_BUCKET_REGION,
      credentials: {
        accessKeyId: env.S3_ACCESS_KEY_ID,
        secretAccessKey: env.S3_SECRET_ACCESS_KEY_ID
      }
    })
  }
}
