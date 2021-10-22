<h1 align="center">⁂<br/>web3.storage</h1>
<p align="center">The cron jobs for housekeeping ✨</p>

Resist chaos! Periodically update the db with exciting new facts about the size of pins and anything else that doesn't need to be on the critical path.

## Getting started

Ensure you have all the dependencies, by running `npm i` in the parent project.

The following jobs are available:

### pins

To run this locally you will need the following in your `packages/cron/.env` file:

```ini
ENV=dev
DATABASE=postgres

# PostgREST API URL
DEV_PG_REST_URL=http://localhost:3000
# PostgREST API token, for role "postgres", using secret value PGRST_JWT_SECRET from './postgres/docker/docker-compose.yml'
# https://postgrest.org/en/v8.0/tutorials/tut1.html#step-3-sign-a-token
DEV_PG_REST_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoicG9zdGdyZXMifQ.oM0SXF31Vs1nfwCaDxjlczE237KcNKhTpKEYxMX-jEU

# Connection string for locally running postgres used in tests
DEV_PG_CONNECTION=postgres://postgres:postgres@127.0.0.1:5432/postgres

# Cluster
CLUSTER_API_URL=http://127.0.0.1:9094/
CLUSTER_IPFS_PROXY_API_URL=http://127.0.0.1:9095/api/v0/

# Fauna
DEV_FAUNA_KEY="<your key here>"
```

You also need to have:

- a local ipfs-cluster node running as per https://cluster.ipfs.io/documentation/quickstart/
- a dev account and db set up on FaunaDB with the latest schema imported as per [../db/README.md](../db/README.md)
- a dev api running so you can create some test data as per [../api/README.md](../api/README.md)

Run the job:

```sh
npm run start:pins
```
