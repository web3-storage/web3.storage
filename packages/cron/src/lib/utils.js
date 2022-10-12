import pg from 'pg'
import { Cluster } from '@nftstorage/ipfs-cluster'
import { DBClient } from '@web3-storage/db'
import { S3Client } from '@aws-sdk/client-s3'

export const MAX_CONCURRENT_QUERIES = 10

/**
 * Create a new IPFS Cluster instance from the passed environment variables.
 * @param {Record<string, string|undefined>} env
 */
export function getCluster (env) {
  const clusterApiUrl = env.CLUSTER_API_URL
  if (!clusterApiUrl) throw new Error('missing CLUSTER_API_URL environment var')
  const basicAuthToken = env.CLUSTER_BASIC_AUTH_TOKEN
  return new Cluster(clusterApiUrl, {
    headers: basicAuthToken ? { Authorization: `Basic ${basicAuthToken}` } : {}
  })
}

/**
 * Create a new DB client instance from the passed environment variables.
 * @param {Record<string, string|undefined>} env
 */
export function getDBClient (env) {
  let token, endpoint
  if (env.ENV === 'production') {
    if (!env.PROD_PG_REST_JWT) throw new Error('missing PROD_PG_REST_JWT environment var')
    if (!env.PROD_PG_REST_URL) throw new Error('missing PROD_PG_REST_URL environment var')
    token = env.PROD_PG_REST_JWT
    endpoint = env.PROD_PG_REST_URL
  } else if (env.ENV === 'staging') {
    if (!env.STAGING_PG_REST_JWT) throw new Error('missing STAGING_PG_REST_JWT environment var')
    if (!env.STAGING_PG_REST_URL) throw new Error('missing STAGING_PG_REST_URL environment var')
    token = env.STAGING_PG_REST_JWT
    endpoint = env.STAGING_PG_REST_URL
  } else if (env.ENV === 'dev') {
    if (!env.PG_REST_JWT) throw new Error('missing PG_REST_JWT environment var')
    if (!env.PG_REST_URL) throw new Error('missing PG_REST_URL environment var')
    token = env.PG_REST_JWT
    endpoint = env.PG_REST_URL
  } else {
    throw new Error(`unsupported environment ${env.ENV}`)
  }
  return new DBClient({ token, endpoint, postgres: true })
}

/**
 * Create a new Postgres client instance from the passed environment variables and connects to it.
 * @param {Record<string, string|undefined>} env
 * @param {'ro'|'rw'} [mode]
 */
export async function getPg (env, mode) {
  const client = new pg.Client({ connectionString: getPgConnString(env, mode) })
  await client.connect()
  return client
}

/**
 * Create a new Postgres pool instance from the passed environment variables.
 * @param {Record<string, string|undefined>} env
 * @param {'ro'|'rw'} [mode]
 */
export function getPgPool (env, mode = 'rw') {
  return new pg.Pool({
    connectionString: getPgConnString(env, mode),
    max: MAX_CONCURRENT_QUERIES
  })
}

/**
 * Get a postgres connection string from the passed environment variables.
 * @param {Record<string, string|undefined>} env
 * @param {'ro'|'rw'} [mode]
 */
function getPgConnString (env, mode = 'rw') {
  let connectionString
  if (env.ENV === 'production') {
    connectionString =
      mode === 'rw'
        ? env.PROD_PG_CONNECTION
        : env.PROD_RO_PG_CONNECTION
  } else if (env.ENV === 'staging') {
    connectionString =
      mode === 'rw'
        ? env.STAGING_PG_CONNECTION
        : env.STAGING_RO_PG_CONNECTION
  } else {
    connectionString =
      mode === 'rw' ? env.PG_CONNECTION : env.RO_PG_CONNECTION
  }
  if (!connectionString) throw new Error('missing Postgres connection string')
  return connectionString
}

/**
 * Builds a pg connections string
 *
 * @param {object} dbOptions
 * @param {string} dbOptions.host
 * @param {string} dbOptions.database
 * @param {string} dbOptions.user
 * @param {string} dbOptions.password
 * @param {number} [dbOptions.port]
 * @param {boolean} [dbOptions.ssl]
 * @returns
 */
function buildPgConnectionString ({
  host,
  database,
  user,
  password,
  port = 5432,
  ssl = true
}) {
  return `postgres://${user}:${password}@${host}:${port}/${database}${ssl === true ? '?ssl=true' : ''}`
}

/**
 * Create a new Postgres pool instance to connect directly to cargo replica from the passed environment variables.
 * This is a readOnly connection.
 *
 * A direct connection to Cargo proved to be more performant than going through FDW.
 * This hasn't been thoroughly investigated or audited.
 *
 * @param {Record<string, string|undefined>} env
 */
export function getCargoPgPool (env) {
  const cargoEnvVariables = [
    'DAG_CARGO_HOST',
    'DAG_CARGO_DATABASE',
    'DAG_CARGO_USER',
    'DAG_CARGO_PASSWORD'
  ]

  cargoEnvVariables.forEach((variable) => {
    if (!env[variable]) {
      throw new Error(`Missing ${variable} string. Please add it to the environment.`)
    }
  })

  const connectionString = buildPgConnectionString({
    user: env.DAG_CARGO_USER,
    database: env.DAG_CARGO_DATABASE,
    password: env.DAG_CARGO_PASSWORD,
    host: env.DAG_CARGO_HOST,
    ssl: env.ENV !== 'dev'
  })

  return new pg.Pool({
    connectionString,
    max: MAX_CONCURRENT_QUERIES
  })
}

export function getS3Client (env) {
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
  // let endpoint
  // if (env.S3_BUCKET_ENDPOINT) {
  //   const endpointUrl = new URL(env.S3_BUCKET_ENDPOINT)
  //   endpoint = { protocol: endpointUrl.protocol, hostname: endpointUrl.host }
  // }

  const s3Client = new S3Client({
    // logger: console, // use me to get some debug info on what the client is up to
    endpoint: env.S3_BUCKET_ENDPOINT,
    forcePathStyle: !!env.S3_BUCKET_ENDPOINT, // Force path if endpoint provided
    region: env.S3_BUCKET_REGION,
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY_ID,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY_ID
    }
  })
  if (env.ENV === 'dev' && !!env.DEBUG) {
    // show me what s3 sdk is up to.
    s3Client.middlewareStack.add(
      (next, context) => async (args) => {
        console.log('s3 request headers', args.request.headers)
        return next(args)
      },
      {
        step: 'finalizeRequest'
      }
    )
  }
  return s3Client
}
