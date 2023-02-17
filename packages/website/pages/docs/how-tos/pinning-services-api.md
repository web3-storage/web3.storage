---
title: Pinning Services API
description: Learn how to pin a file to IPFS using the Pinning Services API
---

import Callout from 'components/callout/callout';

# Pinning Services API

[IPFS](https://ipfs.io/) is a distributed storage network. Data is cached on IPFS nodes. All content uploaded to web3.storage's IPFS nodes are persisted until told otherwise, but some nodes might garbage collect to make room for new content. A remote pinning service allows users to save and persist data that is already available on the IPFS network on its set of IPFS nodes. For instance, if you uploaded a file to your local IPFS node but don't want to make sure your computer is always connected to IPFS and this file is always served, you can remote pin it to a pinning service.

web3.storage provides a pinning service that complies with the [IPFS Pinning Service API specification](https://ipfs.github.io/pinning-services-api-spec/). **web3.storage's Pinning Service API is not to be used for ongoing production traffic, but rather for one-time migrations.**

**You do not need to request access if you are storing data with web3.storage directly. Data stored with web3.storage is persisted indefinitely by default. This API is only useful if you are looking to store data with web3.storage that is already available on the IPFS network. Even in these situations, if you are able to, we recommend you generate a CAR file from a IPFS node hosting the content and directly upload that to web3.storage (e.g., run `ipfs dag export` from your local node) rather than use the Pinning API.**

For a full list and documentation of all the available pinning service endpoints, visit the [IPFS Pinning Service API endpoint documentation](https://ipfs.github.io/pinning-services-api-spec/#tag/pins).

## Requesting access

To request access to the pinning service for your web3.storage account, you will need to navigate to [your token management page](https://web3.storage/tokens) and click the button labeled "Request API Pinning Access". Fill out the form and then, once approved, you will be able to access the pinning service API endpoints using your [API token](/docs/how-tos/generate-api-token).

## Using the HTTP API

The web3.storage pinning service endpoint for all requests is [https://api.web3.storage/pins](https://api.web3.storage/pins).

<Callout type="info">
### IPLD codecs
Web3.storage Pinning APIs only support raw, dag-pb, dag-cbor and dag-json IPLD codecs.
The API doesn't support pinning content by providing IPNS records pointing to it.
</Callout>

### Add a pin

```bash
curl -X POST 'https://api.web3.storage/pins' \
  --header 'Accept: */*' \
  --header 'Authorization: Bearer <YOUR_AUTH_KEY_JWT>' \
  --header 'Content-Type: application/json' \
  -d '{
  "cid": "<CID_TO_BE_PINNED>",
  "name": "PreciousData.pdf"
}'
```

### List successful pins

```bash
curl -X GET 'https://api.web3.storage/pins' \
  --header 'Accept: */*' \
  --header 'Authorization: Bearer <YOUR_AUTH_KEY_JWT>'
```

### Delete a pin

```bash
curl -X DELETE 'https://api.web3.storage/pins/<REQUEST_ID>' \
  --header 'Accept: */*' \
  --header 'Authorization: Bearer <YOUR_AUTH_KEY_JWT>'
```

## Using the IPFS CLI

The [IPFS CLI](https://docs.ipfs.io/reference/cli/) can be used to maintain pins by first adding the web3.storage pinning service.

```bash
ipfs pin remote service add web3.storage https://api.web3.storage/ <YOUR_AUTH_KEY_JWT>
```

### Add a pin

```bash
ipfs pin remote add --service=web3.storage --name=<PIN_NAME> <CID>
```

### List pins

```bash
ipfs pin remote ls --service=web3.storage
```

### Remove a pin

```bash
ipfs pin remote rm --service=web3.storage --cid=<CID>
```
