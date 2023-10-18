<h1 align="center">⁂<br/>web3.storage</h1>
<p align="center">The cron jobs for housekeeping ✨</p>

Resist chaos! Periodically update the db with exciting new facts about the size of pins and anything else that doesn't need to be on the critical path.

Notify users when they are approaching or exceeding their storage quota, and notify admins of any users who are exceeding their quota.

## Getting started

Ensure you have all the dependencies, by running `npm i` in the parent project.

The following jobs are available:

### pins

Verify that the following are set in the `.env` file in root of the project monorepo.

Heartbeat split by environments, runs every hour.

```ini
ENV=dev

PG_REST_URL=http://localhost:3000
PG_REST_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoicG9zdGdyZXMifQ.oM0SXF31Vs1nfwCaDxjlczE237KcNKhTpKEYxMX-jEU
PG_CONNECTION=postgres://postgres:postgres@127.0.0.1:5432/postgres

DAG_CARGO_HOST=127.0.0.1
DAG_CARGO_DATABASE=postgres
DAG_CARGO_USER=postgres
DAG_CARGO_PASSWORD=postgres

CLUSTER_API_URL=http://127.0.0.1:9094/
CLUSTER_IPFS_PROXY_API_URL=http://127.0.0.1:9095/api/v0/
```

You also need to have:

- a local ipfs-cluster node running as per https://cluster.ipfs.io/documentation/quickstart/
- a postgres db and postgREST interface running
- a dev api running so you can create some test data as per [../api/README.md](../api/README.md)

Run the job:

```sh
npm run start:pins
```
