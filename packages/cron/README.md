# cron jobs for web3.storage

Resist chaos! Periodically update the db with exciting new facts about the size of pins and anything else that doesn't need to be on the critical path.

## Getting started

Ensure you have all the dependencies, by running `npm i` in the parent project.

The following jobs are available:

### pins

To run this locally you will need the following in your `packages/cron/.env` file:

```ini
ENV=dev
CLUSTER_API_URL=http://127.0.0.1:9094/
CLUSTER_IPFS_PROXY_API_URL=http://127.0.0.1:9095/api/v0/
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
