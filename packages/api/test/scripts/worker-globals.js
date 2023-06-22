export const ENV = 'test'
export const MAINTENANCE_MODE = 'rw'
export const SALT = 'test-salt'
export const MAGIC_SECRET_KEY = 'test-magic-secret-key'
export const CLUSTER_API_URL = 'http://127.0.0.1:9094'
export const CLUSTER_BASIC_AUTH_TOKEN = 'dGVzdDp0ZXN0'
export const S3_BUCKET_ENDPOINT = 'http://127.0.0.1:9000'
export const S3_BUCKET_NAME = 'dotstorage-test-0'
export const S3_BUCKET_REGION = 'us-east-1'
export const S3_ACCESS_KEY_ID = 'minioadmin'
export const S3_SECRET_ACCESS_KEY_ID = 'minioadmin'
export const DATABASE = 'postgres'
export const PG_REST_URL = 'http://127.0.0.1:3000'
export const PG_REST_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoicG9zdGdyZXMifQ.oM0SXF31Vs1nfwCaDxjlczE237KcNKhTpKEYxMX-jEU'
export const GATEWAY_URL = 'http://localhost:8080'
export const ENABLE_ADD_TO_CLUSTER = 'true'
export const LINKDEX_URL = 'https://fake.linkdex.net'
export const CARPARK_URL = 'https://carpark-test.web3.storage'
export const GENDEX_QUEUE = { send: () => {} }

// Can be removed once we get a test mode for admin magic sdk.
export const DANGEROUSLY_BYPASS_MAGIC_AUTH = true
