export const caches = {
  default: {
    match: () => null,
    put: () => { }
  }
}

export const ENV = 'dev'
export const BRANCH = 'test'
export const VERSION = 'test'
export const COMMITHASH = 'test'
export const MAINTENANCE_MODE = 'rw'
export const SALT = 'test-salt'
export const FAUNA_ENDPOINT = 'http://localhost:9086/graphql'
export const FAUNA_KEY = 'test-fauna-key'
export const MAGIC_SECRET_KEY = 'test-magic-secret-key'
export const CLUSTER_API_URL = 'http://localhost:9094'
export const CLUSTER_BASIC_AUTH_TOKEN = 'test'
export const S3_BUCKET_ENDPOINT = 'http://localhost:9096'
export const S3_BUCKET_NAME = 'bucket'
export const S3_BUCKET_REGION = 'eu-central-1'
export const S3_ACCESS_KEY_ID = 'access-key-id'
export const S3_SECRET_ACCESS_KEY_ID = 'secret-access-key'
export const DATABASE = 'fauna'

// Can be removed once we get a test mode for admin magic sdk.
export const DANGEROUSLY_BYPASS_MAGIC_AUTH = true
