# web3.storage DEV environment variables

# Copy me to `.env` and fill out the missing values.
# This file is only for DEV. In prod, set the env vars a process needs as secrets.
ENV=dev


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

## ---- api -------------------------------------------------------------------

# Create a https://magic.link account and set secret keys here. Set NEXT_PUBLIC_MAGIC with the publi key.
MAGIC_SECRET_KEY=

# Open https://csprng.xyz/v1/api and use the value of `Data`, or just use this one. it's for dev, it's ok.
SALT="Q6d8sTZa+wpIPrppPq6VdIKEbknjrsSCQklh/hVU4U0="

# base64 test:test - the creds for the local cluster test container
CLUSTER_BASIC_AUTH_TOKEN="dGVzdDp0ZXN0"
CLUSTER_API_URL=http://127.0.0.1:9094

# IPFS Gateway URL pointing to dockerised ipfs instance
GATEWAY_URL=http://localhost:8080

# S3 bucket details, pointing to dockerised Minio instance
S3_BUCKET_ENDPOINT = 'http://localhost:9000'
S3_BUCKET_NAME = 'dotstorage-dev-0'
S3_BUCKET_REGION = 'us-east-1'
S3_ACCESS_KEY_ID = 'minioadmin'
S3_SECRET_ACCESS_KEY_ID = 'minioadmin'

## ---- website ---------------------------------------------------------------

# vars to expose to the public website build have to be prefixed with NEXT_PUBLIC_
# see: https://nextjs.org/docs/basic-features/environment-variables#exposing-environment-variables-to-the-browser

NEXT_PUBLIC_MAGIC=
NEXT_PUBLIC_API=http://127.0.0.1:8787
NEXT_PUBLIC_ENV=dev

# set me to test Countly analytics integration.
# NEXT_PUBLIC_COUNTLY_KEY=
# NEXT_PUBLIC_COUNTLY_URL=


## ---- cron ------------------------------------------------------------------

CLUSTER_IPFS_PROXY_API_URL=http://127.0.0.1:9095/api/v0/
EMAIL_PROVIDER=dummy

# mail chimp
MAILCHIMP_API_KEY=SECRET
MAILCHIMP_BLOG_LIST_ID=
MAILCHIMP_API_PREFIX=