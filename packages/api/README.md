# web3.storage API

The HTTP interface implemented as a Cloudflare Worker

## Getting started

One time set up of your cloudflare worker subdomain for dev:

- `npm install` - Install the project dependencies
- Sign up to Cloudflare and log in with your default browser.
- `npm i @cloudflare/wrangler -g` - Install the Cloudflare wrangler CLI
- `wrangler login` - Authenticate your wrangler cli; it'll open your browser.
- Setup Cluster
    - You need to run a cluster locally and make it accessible from the internet for development.
    - Follow the quickstart guide to get an IPFS Cluster up and running: https://cluster.ipfs.io/documentation/quickstart/
    - Install [localtunnel](https://theboroer.github.io/localtunnel-www/) and expose the IPFS Cluster HTTP API and IPFS Proxy API (replacing "USER" with your name):

    ```sh
    npm install -g localtunnel
    lt --port 9094 --subdomain USER-cluster-api-web3-storage
    ```

    - There is an npm script you can use to quickly establish these tunnels during development:

    ```sh
    npm run lt
    ```
- Copy your cloudflare account id from `wrangler whoami`
- Update `wrangler.toml` with a new `env`. Set your env name to be the value of `whoami` on your system you can use `npm start` to run the worker in dev mode for you.

    [**wrangler.toml**](./wrangler.toml)

    ```toml
    [env.bobbytables]
    workers_dev = true
    account_id = "<what does the `wrangler whoami` say>"
    vars = { CLUSTER_API_URL = "https://USER-cluster-api-web3-storage.loca.lt" }
    ```

- `npm run build` - Build the bundle
- Add secrets

    ```sh
    wrangler secret put MAGIC_SECRET_KEY --env $(whoami) # Get from magic.link account
    wrangler secret put SALT --env $(whoami) # open `https://csprng.xyz/v1/api` in the browser and use the value of `Data`
    wrangler secret put FAUNA_KEY --env $(whoami) # Get from fauna.com after creating a dev Classic DB
    wrangler secret put CLUSTER_BASIC_AUTH_TOKEN --env $(whoami) # Get from web3.storage vault in 1password (not required for dev)
    ```

- `npm run publish` - Publish the worker under your env. An alias for `wrangler publish --env $(whoami)`
- `npm start` - Run the worker in dev mode. An alias for `wrangler dev --env $(whoami)

You only need to `npm start` for subsequent runs. PR your env config to the wrangler.toml, to celebrate 🎉

## API

### 🔐 `PUT /car/:cid`

Upload a CAR for a root CID. _Authenticated_

### `GET /car/:cid`

Get the CAR file containing all blocks in the tree starting at the root `:cid`

```console
$ curl -sD - 'http://127.0.0.1:8787/car/bafybeidd2gyhagleh47qeg77xqndy2qy3yzn4vkxmk775bg2t5lpuy7pcu'
HTTP/1.1 200 OK
date: Mon, 14 Jun 2021 09:12:41 GMT
content-type: application/car
cache-control: public, max-age=10
content-disposition: attachment; filename="bafybeidd2gyhagleh47qeg77xqndy2qy3yzn4vkxmk775bg2t5lpuy7pcu.car"
```

### `HEAD /car/:cid`

Get the size of a CAR file for all blocks in the tree starting at the root `:cid` as the

```console
$ curl -I 'http://127.0.0.1:8787/car/bafybeidd2gyhagleh47qeg77xqndy2qy3yzn4vkxmk775bg2t5lpuy7pcu'
HTTP/1.1 200 OK
date: Mon, 14 Jun 2021 08:30:56 GMT
content-length: 564692
```

### `GET /root/:cid/deals`

Get filecoin deals info. (_TBD_) We need to define what info we want here to find the right status.
