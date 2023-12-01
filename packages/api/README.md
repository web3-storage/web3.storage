# web3.storage API

The HTTP interface implemented as a Cloudflare Worker.

> ⚠️ This repo will be archived on January 9, 2024 as this web3.storage API will no longer take new uploads. Please use the [new client and API](https://github.com/web3-storage/w3up/tree/main/packages/w3up-client) for future usage of web3.storage. Documentation for the new client can be found [here](https://web3.storage/docs). You can learn more about these changes [here](https://blog.web3.storage/posts/the-data-layer-is-here-with-the-new-web3-storage).

## Getting started

We use miniflare to run the api locally, and docker to run ipfs-cluster and postgres with PostgREST. 

This project uses node v16 and npm v7. It's a monorepo that use [npm workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces) to handle resolving dependencies between the local `packages/*` folders.

To run it you will need:

- node.js >= v16 installed
- The dependencies installed. Run `npm i` from the root of the project.
- The environment variables setup as described in the root [README](../../README.md#building-web3storage).
- The web3.storage [datebase setup](../db/README.md)

With docker running locally, from the monorepo root, start just the api:

```sh
# run me from the root of the monorepo!
npm start -w packages/api
```

🎉 miniflare is running in watch mode; you can save changes to the api code and the worker will update.

If it's your first run you need to [create the database schema](../db/README.md).

```sh
# init the db. Run me once after `npm start`, on first set up:
npm run load-schema -w packages/db
```

Kill the process to stop miniflare, then run `npm run stop` to shutdown the cluster and postgres

```sh
# run me from the root of the monorepo!
npm run stop -w packages/api
```


## Setting up a cloudflare worker
While in most cases the [Getting Started](#getting-started) section is enough to develop locally, if you want to test and preview you worker on Cloudflare's infrastructure here's the instructions to setup your worker and environment.

If you want more in depth information please look at [Cloudflare Get Started guide](https://developers.cloudflare.com/workers/get-started/guide#1-sign-up-for-a-workers-account).

The following instructions assume that you did go through the Getting started section.

### 1. Sign up for a Workers account
Before you can start publishing your Workers on your own domain or a free *.workers.dev subdomain, you must sign up for a Cloudflare Workers account
### 2. Install the Workers CLI
Install `wrangler` cli on your local machine
```bash
npm install -g @cloudflare/wrangler
```
### 3. Configure the Workers CLI
With installation complete, wrangler will need access to a Cloudflare OAuth token to manage Workers resources on your behalf.
```bash
wrangler login
```
Open the browser, log into your account, and select Allow.

### 4. Configure your worker
Update `wrangler.toml` with a new `env`. Set your env name to be the value of `whoami` on your system you can use `npm start` to run the worker in dev mode for you.

[**wrangler.toml**](./wrangler.toml)

```toml
[env.bobbytables]
workers_dev = true
account_id = "<what does the `wrangler whoami` say>"
vars = { CARPARK_URL = "https://carpark-staging.web3.storage", CLUSTER_API_URL = "https://USER-cluster-api-web3-storage.loca.lt", PG_REST_URL = "https://USER-postgres-api-web3-storage.loca.lt", ENV = "dev" }

[[env.bobbytables.r2_buckets]]
# what's it called in r2?
bucket_name = "carpark-staging-0"
# what's it called as a property of the env object
binding = "CARPARK"
```

Copy your Cloudflare account id from `wrangler whoami`.

Add the required secrets:
```sh
wrangler secret put MAGIC_SECRET_KEY --env $(whoami) # Get from magic.link account
wrangler secret put SALT --env $(whoami) # open `https://csprng.xyz/v1/api` in the browser and use the value of `Data`
wrangler secret put PG_REST_JWT --env $(whoami) # Get from database postgrest
wrangler secret put CLUSTER_BASIC_AUTH_TOKEN --env $(whoami) # Get from web3.storage vault in 1password
wrangler secret put S3_BUCKET_REGION --env $(whoami) # e.g us-east-2
wrangler secret put S3_ACCESS_KEY_ID --env $(whoami) # Get from Amazon S3
wrangler secret put S3_SECRET_ACCESS_KEY_ID --env $(whoami) # Get from Amazon S3
wrangler secret put S3_BUCKET_NAME --env $(whoami) # e.g web3.storage-staging-us-east-2
wrangler secret put LOGTAIL_TOKEN --env $(whoami) # Get from Logtail
wrangler secret put SENTRY_DSN --env $(whoami) # Get from Sentry
wrangler secret put STRIPE_SECRET_KEY --env $(whoami) # Get from web3.storage 1password
wrangler secret put LINKDEX_URL --env $(whoami) # Get from 1password. not required for dev
wrangler secret put CONTENT_CLAIMS_PRIVATE_KEY --env $(whoami) # Get from 1password. not required for dev
wrangler secret put CONTENT_CLAIMS_PROOF --env $(whoami) # Get from 1password. not required for dev
wrangler secret put CONTENT_CLAIMS_SERVICE_DID --env $(whoami) # Get from 1password. not required for dev
wrangler secret put CONTENT_CLAIMS_SERVICE_URL --env $(whoami) # Get from 1password. not required for dev
```
Note this might not be up to date, please look to the [.env.tpl](../../.env.tpl) in the root directory for the up to date secrets required.

## Run the code
Run `npm run build` to build the bundle
Run `npm run publish` to publish the worker under your env.

To preview your worker using the Cloudflare development environment you can run
```sh
npm start:preview
```
The script spins up the cluster, Postgres DB, Posgres Rest interface and creates the required localtunnels to make them available to the worker.

PR your env config to the wrangler.toml, to celebrate 🎉

## Maintenance Mode

The API can be put into maintenance mode to prevent writes or prevent reads _and_ writes.

To change the maintenance mode for the API, issue the following command:

```sh
wrangler secret put MAINTENANCE_MODE --env production
```

When prompted for a value enter one of the following permission combinations:

- `--` = no reading or writing
- `r-` = read only mode
- `rw` = read and write (normal operation)

## Linkdex

Our linkdex service determines if a user has uploaded a "Complete" DAG where it was split over multiple patial CARs. During CAR uplaod we query it with the S3 key _after_ writing the CAR to the bucket.

It iterates all the blocks in all the CARs for that users uploads only, and where every link is a CID for a block contained in the CARs, we say the DAG is "Complete". If not, it's "Patial". If we haven't checked or any of the blocks are undecodable with the set of codecs we have currently, then it's "Unknown".

see: https://github.com/web3-storage/linkdex-api

## CARPARK

We write Uploaded CARs to both S3 and R2 in parallel. The R2 Bucket is bound to the worker as `env.CARPARK`. The API docs for an R2Bucket instance are here: https://developers.cloudflare.com/r2/runtime-apis/#bucket-method-definitions

We key our R2 uploads by CAR CID, and record them as an additional `upload.backupURL` entry in the db. The URL prefix for CARs in R2 is set by the `env.CARPARK_URL`. This is currently pointing to a subdomain on web3.storage which we could build out as a worker when we need direct http access to the bucket, but does not exist at time of writing.

## API

The given API has a set of three different authentication levels:

- 🤲 Public
- 🔒 API or Magic Token
- 👮 Magic Token (admin operations)

The 👮 API methods are only allowed with a Magic Token, and consequently only available via https://web3.storage

### Account restriction

If a user's account is restricted, it means that they might have gone over the storage limit assigned to them. This restriction disables several actions such as uploading files, adding and replacing pin requests, or publishing a name record. Note that even if the account has [pinning service API access](https://docs.web3.storage/how-tos/pinning-services-api/#requesting-access), account restriction will disable adding and replacing of pins. It is however still possible to delete pins and create/delete API tokens. For more information, please email <support@web3.storage>.

### 🔒 `POST /car`

Upload a CAR file for a root CID. _Authenticated_

```console
curl -X POST --data-binary @x.car -H 'Authorization: Bearer YOUR_API_KEY' http://127.0.0.1:8787/car -s | jq
{
  "cid":"bafybeid4nimtvdhnawjbpakmw3cijjolgmdfhigd6bveb4rtxp33elfm6q"
}
```

You can also provide a name for the file using the header `X-NAME`, but be sure to encode the filename first. For example `LICENSE–MIT` should be sent as `LICENSE%E2%80%93MIT`.

### 🔒 `POST /upload`

Upload a file for a root CID (maximum of 100 MB). _Authenticated_

```console
curl -X POST --data-binary @file.txt -H 'Authorization: Bearer YOUR_API_KEY' http://127.0.0.1:8787/upload  -s | jq
{
  "cid":"bafkreid65ervf7fmfnbhyr2uqiqipufowox4tgkrw4n5cxgeyls4mha3ma"
}
```

You can also provide a name for the file using the header `X-NAME`, but be sure to encode the filename first. For example `LICENSE–MIT` should be sent as `LICENSE%E2%80%93MIT`.

### 🔒 `GET /user/uploads`

Get a list of user uploads. _Authenticated_

```console
curl -H 'Authorization: Bearer YOUR_API_KEY' 'http://127.0.0.1:8787/user/uploads' -s | jq
{
  "cid": "bafybeidwfngv7n5y7ydbzotrwl3gohgr2lv2g7vn6xggwcjzrf5emknrki",
  "created": "2021-07-29T09:08:28.295905Z",
  "dagSize": 112202,
  "pins": [
    {
      "status": "Pinned",
      "updated": "2021-07-29T09:08:28.295905Z",
      "peerId": "12D3KooWFe387JFDpgNEVCP5ARut7gRkX7YuJCXMStpkq714ziK6",
      "peerName": "web3-storage-sv15",
      "region": "US-CA"
    }
  ],
  "deals": []
```

By default, 25 uploads are requested, but more can be requested up to a maximum of 1000. A `size` parameter should be used as follows:

```console
curl -H 'Authorization: Bearer YOUR_API_KEY' 'http://127.0.0.1:8787/user/uploads?size=1000'
```

### 🤲 `GET /car/:cid`

Get the CAR file containing all blocks in the tree starting at the root `:cid`

```console
$ curl -sD - 'http://127.0.0.1:8787/car/bafybeidd2gyhagleh47qeg77xqndy2qy3yzn4vkxmk775bg2t5lpuy7pcu'
HTTP/1.1 200 OK
date: Mon, 14 Jun 2021 09:12:41 GMT
content-type: application/vnd.ipld.car
cache-control: public, max-age=10
content-disposition: attachment; filename="bafybeidd2gyhagleh47qeg77xqndy2qy3yzn4vkxmk775bg2t5lpuy7pcu.car"
```

### 🤲 `HEAD /car/:cid`

Get the size of a CAR file for all blocks in the tree starting at the root `:cid` as the

```console
$ curl -I 'http://127.0.0.1:8787/car/bafybeidd2gyhagleh47qeg77xqndy2qy3yzn4vkxmk775bg2t5lpuy7pcu'
HTTP/1.1 200 OK
date: Mon, 14 Jun 2021 08:30:56 GMT
content-length: 564692
```

### 🤲 `GET /status/:cid`

Get pinning status and filecoin deals info for a CID.

```console
$ curl 'http://127.0.0.1:8787/status/bafybeidwfngv7n5y7ydbzotrwl3gohgr2lv2g7vn6xggwcjzrf5emknrki' -s | jq
{
  "cid": "bafybeidwfngv7n5y7ydbzotrwl3gohgr2lv2g7vn6xggwcjzrf5emknrki",
  "created": "2021-07-14T19:55:49.409306Z",
  "dagSize": null,
  "pins": [],
  "deals": []
}
```

### 🤲 `POST /user/login`

Proceed to user login (or register).

### 👮 `DELETE /user/uploads/:cid`

Delete a given user upload by its root CID.

### 👮 `GET /user/tokens`

Get list of user tokens.

### 👮 `POST /user/tokens`

Create a new user token.

### 👮 `DELETE /user/tokens/:id`

Delete a given user token.

### 👮 `GET /user/account`

Get the user account information.

### 🔒 `POST /name/:key`

**❗️Experimental** this API may not work, may change, and may be removed in a future version.

Publish a name record for the given key ID.

Users create a keypair<sup>*</sup> and derive a **Key ID** from the public key that acts as the "name".

<details>
  <summary>What is the Key ID?</summary>
  <p>The Key ID is the base36 "libp2p-key" encoding of the public key. The public key is protobuf encoded and contains <code>Type</code> and <code>Data</code> properties, see <a href="https://github.com/libp2p/js-libp2p-crypto/blob/c29c1490bbd25722437fdb36f2f0d1a705f35909/src/keys/ed25519-class.js#L25-L30"><code>ed25519-class.js</code> for example</a>.</p>
</details>

The updated IPNS record is signed with the private key and sent in the request body (base 64 encoded). The server validates the record and ensures the sequence number is greater than the sequence number of any cached record.

<sup>*</sup> Currently a Ed25519 2048 bit (min) key.

### 🤲 `GET /name/:key`

**❗️Experimental** this API may not work, may change, and may be removed in a future version.

Resolve the current CID for the given key ID.

Users "resolve" a Key ID to the current _value_ of a _record_. Typically an IPFS path. Keypair owners "publish" IPNS _records_ to create or update the current _value_.

It returns the resolved value AND the full name record (base 64 encoded, for client side verification).

### 🤲 `GET /name/:key/watch`

**❗️Experimental** this API may not work, may change, and may be removed in a future version.

Watch for changes to the given key ID over a websocket connection.

When changes to the `:key` are published, a JSON encoded message is sent over the websocket containing the new value and the full name record (base 64 encoded, for client side verification).

## Setup Sentry

Inside the `/packages/api` folder create a file called `.env.local` with the following content.

Note: tokens can be created here https://sentry.io/settings/account/api/auth-tokens/ and need the following scopes `event:admin` `event:read` `member:read` `org:read` `project:read` `project:releases` `team:read`.

```ini
SENTRY_TOKEN=<sentry user auth token>
SENTRY_UPLOAD=false # toggle for sentry source/sourcemaps upload (capture will still work)
```

Production vars should be set in Github Actions secrets.

## S3 Setup

We use [S3](https://aws.amazon.com/s3/) for backup and disaster recovery. For production an account on AWS needs to be created.

Production vars should be set in Github Actions secrets.


## stripe.com

There are implementations of [billing-types](./src/utils/billing-types.ts) powered by [stripe.com](./src/utils/stripe.js), and these are used in staging and prod.
They rely on certain resources existing in the stripe.com account configured by `STRIPE_SECRET_KEY` env var. If you have the stripe.com cli, you can use `stripe fixtures` to load the required fixtures from `packages/api/src/stripe.com/fixtures.json` into your stripe.com account. Indicate your desired stripe.com account by either first running `stripe login` or by providing env var `STRIPE_API_KEY` when invoking

```
npm -w packages/api run stripe.com:fixtures
```
