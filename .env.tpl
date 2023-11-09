# web3.storage DEV environment variables

# Copy me to `.env` and fill out the missing values.
# This file is only for DEV. In prod, set the env vars a process needs as secrets.
ENV=dev
# DEBUG=true

## ---- common ---------------------------------------------------------------

# PostgREST API token, for role "postgres", using secret value PGRST_JWT_SECRET from './postgres/docker/docker-compose.yml' see: https://postgrest.org/en/v8.0/tutorials/tut1.html#step-3-sign-a-token
PG_REST_JWT="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoicG9zdGdyZXMifQ.oM0SXF31Vs1nfwCaDxjlczE237KcNKhTpKEYxMX-jEU"
PG_REST_URL=http://127.0.0.1:3000
# FOR TESTS ONLY: DB connection string for locally running postgres
PG_CONNECTION=postgres://postgres:postgres@127.0.0.1:5432/postgres
RO_PG_CONNECTION=postgres://postgres:postgres@127.0.0.1:5432/postgres

DAG_CARGO_HOST=127.0.0.1
DAG_CARGO_DATABASE=postgres
DAG_CARGO_USER=postgres
DAG_CARGO_PASSWORD=postgres

# stripe.com publishable key - check 'stripe.com' in your team secret manager. this default value is for a test account
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51LW5iZIfErzTm2rEq2poZhHidav6vMKnpywbLgfM7YtRpWUO1QyQjyoG4h5nO0wzzoLyqOocDb6h8fFcqw4RItB700OjnutXXx

## ---- api -------------------------------------------------------------------

# Create a https://magic.link account and set secret keys here. Set NEXT_PUBLIC_MAGIC with the publi key.
MAGIC_SECRET_KEY=

# Open https://csprng.xyz/v1/api and use the value of `Data`, or just use this one. it's for dev, it's ok.
SALT="Q6d8sTZa+wpIPrppPq6VdIKEbknjrsSCQklh/hVU4U0="

# base64 test:test - the creds for the local cluster test container
CLUSTER_BASIC_AUTH_TOKEN="dGVzdDp0ZXN0"
CLUSTER_API_URL=http://127.0.0.1:9094
# ENABLE_ADD_TO_CLUSTER=true

# IPFS Gateway URL pointing to dockerised ipfs instance
GATEWAY_URL=http://localhost:8080

# S3 bucket details, pointing to dockerised Minio instance
S3_BUCKET_ENDPOINT = 'http://localhost:9000'
S3_BUCKET_NAME = 'dotstorage-dev-0'
S3_BUCKET_REGION = 'us-east-1'
S3_ACCESS_KEY_ID = 'minioadmin'
S3_SECRET_ACCESS_KEY_ID = 'minioadmin'

# stripe.com secret key - check 'stripe.com' in your team secret manager
# STRIPE_SECRET_KEY='sk_'

# URL prefix for CARs stored in R2
# CARPARK_URL = "https://carpark.web3.storage"

# URL prefix for the linkdex-api
# LINKDEX_URL = "https://linkdex.web3.storage"

# Content Claims
# CONTENT_CLAIMS_PRIVATE_KEY = "base64pad encoded ed25519 key"
# CONTENT_CLAIMS_PROOF = "base64pad encoded CAR of delegation"
# CONTENT_CLAIMS_SERVICE_DID = "did:web:claims.web3.storage"
# CONTENT_CLAIMS_SERVICE_URL = "https://claims.web3.storage"

## ---- website ---------------------------------------------------------------

# vars to expose to the public website build have to be prefixed with NEXT_PUBLIC_
# see: https://nextjs.org/docs/basic-features/environment-variables#exposing-environment-variables-to-the-browser

NEXT_PUBLIC_MAGIC=
NEXT_PUBLIC_API=http://127.0.0.1:8787
NEXT_PUBLIC_ENV=dev

# set me to test Countly analytics integration.
# NEXT_PUBLIC_COUNTLY_KEY=
# NEXT_PUBLIC_COUNTLY_URL=

# set to schedule when announcement banners should show about the w3up launch and related product sunsets
# NEXT_PUBLIC_W3UP_LAUNCH_SUNSET_ANNOUNCEMENT_START='2023-11-21T00:00:00Z'
# set to schedule when certain features hide bcause the product has been sunset and w3up is launched
# NEXT_PUBLIC_W3UP_LAUNCH_SUNSET_START='2024-01-10T00:00:00Z'

## ---- cron ------------------------------------------------------------------

CLUSTER_IPFS_PROXY_API_URL=http://127.0.0.1:9095/api/v0/
EMAIL_PROVIDER=dummy
