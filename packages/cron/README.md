# cron jobs for web3.storage

Resist chaos! Periodically update the db with exciting new facts about the size of pins and anything else that doesn't need to be on the critical path.

## Getting started

Ensure you have all the dependencies, but running `npm i` in the parent project.

The following jobs are available

### pins

To run this locally you will need the following ENV

```ini
ENV="dev"
CLUSTER_API_URL="https://$(whoami)-cluster-api-web3-storage.loca.lt"
CLUSTER_IPFS_PROXY_API_URL="https://$(whoami)-ipfs-proxy-api-web3-storage.loca.lt"
DEV_FAUNA_KEY="<your key here>"
```

and that means, you also need to have
- a local ipfs-cluster node running as per https://cluster.ipfs.io/documentation/quickstart/
- a dev account and db set up on FaunaDB with the latest schema imported as per [../db/README.md](../db/README.md)
- a dev api running so you can create some test data as per [../api/README.md](../api/README.md)
