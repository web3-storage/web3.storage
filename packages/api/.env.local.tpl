# Copy me to .env.local and fill out the missing values

# Cloudflare worker variables for local testing with miniflare
#
# see: https://miniflare.dev/core/variables-secrets
#  
# Requires local cluster & postgres containers to be running
#  _check docker is running_
#  npm run cluster:start -w packages/api 
#  npm start -w packages/db
#
# usage:
#  npx miniflare --env .env.local

# Crate a magic.link account and grab the secret key
MAGIC_SECRET_KEY=

# Open https://csprng.xyz/v1/api and use the value of `Data`, or just use this one. it's for dev, it's ok.
SALT="Q6d8sTZa+wpIPrppPq6VdIKEbknjrsSCQklh/hVU4U0="

# base64 test:test - the creds for the local cluster test container
CLUSTER_BASIC_AUTH_TOKEN="dGVzdDp0ZXN0"

# PostgREST API token, for role "postgres", using secret value PGRST_JWT_SECRET from './postgres/docker/docker-compose.yml' see: https://postgrest.org/en/v8.0/tutorials/tut1.html#step-3-sign-a-token
PG_REST_JWT="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoicG9zdGdyZXMifQ.oM0SXF31Vs1nfwCaDxjlczE237KcNKhTpKEYxMX-jEU"

# no need for localtunnel, miniflare runs on localhost
CLUSTER_API_URL=http://127.0.0.1:9094

# no need for localtunnel, miniflare runs on localhost
PG_REST_URL=http://127.0.0.1:3000

# IPFS Gateaway URL pointing to dockerised ipfs instance
GATEWAY=http://localhost:8080

ENV=dev
