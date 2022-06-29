/* global BRANCH, VERSION, COMMITHASH, SENTRY_RELEASE */
import Toucan from 'toucan-js'
import { S3Client } from '@aws-sdk/client-s3/dist-es/S3Client.js'
import { Magic } from '@magic-sdk/admin'
import { DBClient } from '@web3-storage/db'
import { Cluster } from '@nftstorage/ipfs-cluster'
import { DEFAULT_MODE } from './maintenance.js'
import { Logging } from './utils/logs.js'
import pkg from '../package.json'

/**
 * @typedef {object} Env
 * // Environment and global vars
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
 * @property {string} GATEWAY_URL
 * @property {string} [S3_BUCKET_ENDPOINT]
 * @property {string} S3_BUCKET_NAME
 * @property {string} S3_BUCKET_REGION
 * @property {string} S3_ACCESS_KEY_ID
 * @property {string} S3_SECRET_ACCESS_KEY_ID
 * @property {string} [SENTRY_DSN]
 * @property {string} [SENTRY_RELEASE]
 * @property {string} [LOGTAIL_TOKEN]
 * @property {string} MAINTENANCE_MODE
 * @property {string} [DANGEROUSLY_BYPASS_MAGIC_AUTH]
 * // Derived values and class dependencies
 * @property {Cluster} cluster
 * @property {DBClient} db
 * @property {Logging} log
 * @property {Magic} magic
 * @property {Toucan} sentry
 * @property {import('./maintenance').Mode} MODE
 * @property {S3Client} s3Client
 * @property {string} s3BucketName
 * @property {string} s3BucketRegion
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
 * Modifies the given env object by adding other items to it, mostly things
 * which are configured from the initial env values.
 * @param {Request} req
 * @param {Env} env
 * @param {import('./index.js').Ctx} ctx
 */
export function envAll (req, env, ctx) {
  // In dev, set these vars in a .env file in the parent monorepo project root.
  if (!env.PG_REST_URL) {
    throw new Error('MISSING ENV. Please set PG_REST_URL')
  }
  // These values are replaced at build time by esbuild `define`
  env.BRANCH = BRANCH
  env.VERSION = VERSION
  env.COMMITHASH = COMMITHASH
  env.SENTRY_RELEASE = SENTRY_RELEASE

  env.sentry = env.SENTRY_DSN && new Toucan({
    dsn: env.SENTRY_DSN,
    context: ctx,
    request: req,
    allowedHeaders: ['user-agent', 'x-client'],
    allowedSearchParams: /(.*)/,
    debug: env.DEBUG === 'true',
    environment: env.ENV,
    release: env.SENTRY_RELEASE,
    pkg
  })

  // Attach a `Logging` instance, which provides methods for logging and writes
  // the logs to LogTail. This must be a new instance per request.
  // Note that we pass `ctx` as the `event` param here, because it's kind of both:
  // https://developers.cloudflare.com/workers/runtime-apis/fetch-event/#syntax-module-worker
  env.log = new Logging(req, ctx, {
    token: env.LOGTAIL_TOKEN,
    debug: env.DEBUG === 'true',
    sentry: env.sentry,
    version: env.VERSION,
    branch: env.BRANCH,
    commithash: env.COMMITHASH
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

  if (!env.S3_BUCKET_NAME) {
    throw new Error('MISSING ENV. Please set S3_BUCKET_NAME')
  } else if (!env.S3_BUCKET_REGION) {
    throw new Error('MISSING ENV. Please set S3_BUCKET_REGION')
  } else if (!env.S3_ACCESS_KEY_ID) {
    throw new Error('MISSING ENV. Please set S3_ACCESS_KEY_ID')
  } else if (!env.S3_SECRET_ACCESS_KEY_ID) {
    throw new Error('MISSING ENV. Please set S3_SECRET_ACCESS_KEY_ID')
  }

  env.s3BucketName = env.S3_BUCKET_NAME
  env.s3BucketRegion = env.S3_BUCKET_REGION

  // https://github.com/aws/aws-sdk-js-v3/issues/1941
  let endpoint
  if (env.S3_BUCKET_ENDPOINT) {
    const endpointUrl = new URL(env.S3_BUCKET_ENDPOINT)
    endpoint = { protocol: endpointUrl.protocol, hostname: endpointUrl.host }
  }

  env.s3Client = new S3Client({
    // logger: console, // use me to get some debug info on what the client is up to
    endpoint,
    forcePathStyle: !!env.S3_BUCKET_ENDPOINT, // Force path if endpoint provided
    region: env.S3_BUCKET_REGION,
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY_ID,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY_ID
    }
  })
  if (env.ENV === 'dev') {
    // show me what s3 sdk is up to.
    env.s3Client.middlewareStack.add(
      (next, context) => async (args) => {
        console.log('s3 request headers', args.request.headers)
        return next(args)
      },
      {
        step: 'finalizeRequest'
      }
    )
  }
}
