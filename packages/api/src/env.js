/* global BRANCH, VERSION, COMMITHASH, SENTRY_RELEASE */
import Toucan from 'toucan-js'
import { S3Client } from '@aws-sdk/client-s3/dist-es/S3Client.js'
import { Magic } from '@magic-sdk/admin'
import { DBClient } from '@web3-storage/db'
import { Cluster } from '@nftstorage/ipfs-cluster'
import * as ed25519 from '@ucanto/principal/ed25519'
import * as Delegation from '@ucanto/core/delegation'
import { DID } from '@ucanto/core'
import { fromString } from 'uint8arrays/from-string'
import { DEFAULT_MODE } from './maintenance.js'
import { Logging } from './utils/logs.js'
import pkg from '../package.json'
import { magicTestModeIsEnabledFromEnv } from './utils/env.js'
import { defaultBypassMagicLinkVariableName } from './magic.link.js'
import { createStripeBillingContext } from './utils/stripe.js'
import { createMockBillingContext } from './utils/billing.js'
import { Factory as ClaimFactory } from './utils/content-claims.js'

/**
 * @typedef {object} Env
 * // Environment and global vars
 * @property {string} DEBUG
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
 * @property {string} GATEWAY_URL CSV IPFS gateway URL(s) WITH CAR support via `?format=car` query param.
 * @property {string} [S3_BUCKET_ENDPOINT]
 * @property {string} S3_BUCKET_NAME
 * @property {string} S3_BUCKET_REGION
 * @property {string} S3_ACCESS_KEY_ID
 * @property {string} S3_SECRET_ACCESS_KEY_ID
 * @property {string} [SENTRY_DSN]
 * @property {string} [SENTRY_RELEASE]
 * @property {string} [LOGTAIL_TOKEN]
 * @property {string} MAINTENANCE_MODE
 * @property {string} [MODE_SKIP_LIST]
 * @property {string} [DANGEROUSLY_BYPASS_MAGIC_AUTH]
 * @property {string} [ELASTIC_IPFS_PEER_ID]
 * @property {string} [ENABLE_ADD_TO_CLUSTER]
 * @property {string} [LINKDEX_URL] dag completeness checking service for the S3 Bucket configured in `S3_BUCKET_NAME`
 * @property {string} [STRIPE_SECRET_KEY]
 * @property {string} CARPARK_URL the public url prefix for CARs stored in R2
 * @property {R2Bucket} CARPARK the bound R2 Bucket interface
 * @property {R2Bucket} SATNAV
 * @property {R2Bucket} DUDEWHERE
 * @property {string} [CONTENT_CLAIMS_PRIVATE_KEY] Private key for the claims signer.
 * @property {string} [CONTENT_CLAIMS_PROOF] Proof of delegation.
 * @property {string} [CONTENT_CLAIMS_SERVICE_DID] DID of the content claims service.
 * @property {string} [CONTENT_CLAIMS_SERVICE_URL] URL of the content claims service.
 * @property {string|undefined} [NEXT_PUBLIC_W3UP_LAUNCH_LIMITED_AVAILABILITY_START] - when limited availability starts, e.g. no new user signups, cant change plan
 * @property {string|undefined} [NEXT_PUBLIC_W3UP_LAUNCH_SUNSET_ANNOUNCEMENT_START] - when announcement starts
 * @property {string|undefined} [NEXT_PUBLIC_W3UP_LAUNCH_SUNSET_START] - when the product is actually sunset (after announcement)
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
 * @property {import('./utils/billing-types').BillingService} billing
 * @property {import('./utils/billing-types').CustomersService} customers
 * @property {string} stripeSecretKey
 * @property {string[]} gatewayUrls
 * @property {string[]} modeSkipList
 * @property {import('./utils/content-claims').Factory} [claimFactory]
 */

/**
 * Modifies the given env object by adding other items to it, mostly things
 * which are configured from the initial env values.
 * @param {Request} req
 * @param {Env} env
 * @param {import('./index.js').Ctx} ctx
 */
export async function envAll (req, env, ctx) {
  // In dev, set these vars in a .env file in the parent monorepo project root.
  if (!env.PG_REST_URL) {
    throw new Error('MISSING ENV. Please set PG_REST_URL')
  }
  // These values are replaced at build time by esbuild `define`
  // @ts-ignore
  env.BRANCH = BRANCH
  // @ts-ignore
  env.VERSION = VERSION
  // @ts-ignore
  env.COMMITHASH = COMMITHASH
  // @ts-ignore
  env.SENTRY_RELEASE = SENTRY_RELEASE

  // @ts-ignore
  env.sentry = env.SENTRY_DSN && new Toucan({
    dsn: env.SENTRY_DSN,
    context: ctx,
    request: req,
    allowedHeaders: ['user-agent', 'x-client'],
    allowedSearchParams: /(.*)/,
    debug: env.DEBUG === 'true',
    rewriteFrames: {
      // sourcemaps only work if stack filepath are absolute like `/worker.js`
      root: '/'
    },
    environment: env.ENV,
    release: env.SENTRY_RELEASE,
    pkg
  })

  // Attach a `Logging` instance, which provides methods for logging and writes
  // the logs to LogTail. This must be a new instance per request.
  // Note that we pass `ctx` as the `event` param here, because it's kind of both:
  // https://developers.cloudflare.com/workers/runtime-apis/fetch-event/#syntax-module-worker
  const cloudLoggingEnabled = env.ENV === 'production' || env.ENV === 'staging'

  // @ts-ignore
  env.log = new Logging(req, ctx, {
    token: env.LOGTAIL_TOKEN,
    debug: env.DEBUG === 'true',
    sentry: env.sentry,
    version: env.VERSION,
    branch: env.BRANCH,
    commithash: env.COMMITHASH,
    sendToLogtail: cloudLoggingEnabled,
    sendToSentry: cloudLoggingEnabled
  })

  env.magic = new Magic(env.MAGIC_SECRET_KEY, {
    // @ts-ignore
    testMode: magicTestModeIsEnabledFromEnv(env)
  })

  // We can remove this when magic admin sdk supports test mode
  if (new URL(req.url).origin === 'http://testing.web3.storage' && env[defaultBypassMagicLinkVariableName] !== 'undefined') {
    // only set this in test/scripts/worker-globals.js
    console.log(`!!! ${defaultBypassMagicLinkVariableName}=${env[defaultBypassMagicLinkVariableName]} !!!`)
  }

  env.db = new DBClient({
    endpoint: env.PG_REST_URL,
    token: env.PG_REST_JWT
  })

  // @ts-ignore
  env.MODE = env.MAINTENANCE_MODE || DEFAULT_MODE

  env.modeSkipList = env.MODE_SKIP_LIST ? JSON.parse(env.MODE_SKIP_LIST) : []

  env.ELASTIC_IPFS_PEER_ID = env.ELASTIC_IPFS_PEER_ID ?? 'bafzbeibhqavlasjc7dvbiopygwncnrtvjd2xmryk5laib7zyjor6kf3avm'

  if (!env.LINKDEX_URL && env.ENV !== 'dev') {
    throw new Error('Missing ENV. Please set LINKDEX_URL')
  }

  if (!env.CARPARK_URL) {
    if (env.ENV === 'dev') {
      env.CARPARK_URL = 'https://carpark-dev.web3.storage'
    } else {
      throw new Error('Missing ENV. Please set CARPARK_URL')
    }
  }

  ['CARPARK', 'SATNAV', 'DUDEWHERE'].forEach(bucketName => {
    if (!env[bucketName]) {
      throw new Error(`Missing ENV. R2 Bucket \`${bucketName}\` not found. Update \`r2_bucket\` config in wrangler.toml or add \`--r2 ${bucketName}\` flag to miniflare cmd`)
    }
  })

  const clusterAuthToken = env.CLUSTER_BASIC_AUTH_TOKEN
  const headers = clusterAuthToken ? { Authorization: `Basic ${clusterAuthToken}` } : {}

  // @ts-ignore
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
  if (env.ENV === 'dev' && env.DEBUG === 'true') {
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

  const stripeSecretKey = env.STRIPE_SECRET_KEY
  if (!stripeSecretKey && !['test', 'dev'].includes(env.ENV)) {
    throw new Error(`Stripe secret key is required for env ${env.ENV}`)
  } else if (stripeSecretKey) {
    // if we have a stripeSecretKey, use stripe.com-powered BillingEnv services
    Object.assign(env, createStripeBillingContext({
      ...env,
      STRIPE_SECRET_KEY: stripeSecretKey
    }))
  } else {
    // use mock BillingEnv as a placeholder for test/dev
    Object.assign(env, createMockBillingContext())
  }

  env.gatewayUrls = env.GATEWAY_URL ? env.GATEWAY_URL.split(',') : []
  if (!env.gatewayUrls.length) {
    throw new Error('MISSING ENV. Please set GATEWAY_URL')
  }

  if (env.CONTENT_CLAIMS_PRIVATE_KEY) {
    const servicePrincipal = DID.parse(env.CONTENT_CLAIMS_SERVICE_DID ?? 'did:web:claims.web3.storage')
    /** @type {import('@ucanto/interface').Signer} */
    let signer = ed25519.parse(env.CONTENT_CLAIMS_PRIVATE_KEY)
    const proofs = []
    if (env.CONTENT_CLAIMS_PROOF) {
      const proof = await Delegation.extract(fromString(env.CONTENT_CLAIMS_PROOF, 'base64pad'))
      // @ts-expect-error typescript version does not support cause
      if (!proof.ok) throw new Error('failed to extract proof', { cause: proof.error })
      proofs.push(proof.ok)
    } else {
      // if no proofs, we must be using the service private key to sign
      signer = signer.withDID(servicePrincipal.did())
    }
    const serviceURL = new URL(env.CONTENT_CLAIMS_SERVICE_URL ?? 'https://claims.web3.storage')
    env.claimFactory = new ClaimFactory(signer, proofs, servicePrincipal, serviceURL)
  } else {
    console.warn('content claims are disabled')
  }
}
