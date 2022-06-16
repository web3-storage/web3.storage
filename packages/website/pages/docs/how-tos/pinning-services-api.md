---
title: Pinning Services API
description: Learn how to pin a file to IPFS using the Pinning Services API
---

# Pinning Services API

[IPFS](https://ipfs.io/) is a distributed storage network. Data is cached on IPFS nodes, but may be deleted to make room for new content. A pinning service is a collection of IPFS nodes dedicated to saving data on the network so that it is not removed.

Web3.Storage provides a pinning service that complies with the [IPFS Pinning Service API specification](https://ipfs.github.io/pinning-services-api-spec/).

For a full list and documentation of all the available pinning service endpoints, visit the [IPFS Pinning Service API endpoint documentation](https://ipfs.github.io/pinning-services-api-spec/#tag/pins).

## Requesting access

To request access to the pinning service for your Web3.Storage account, you will need to navigate to  [your token management page](https://web3.storage/tokens) and click the button labeled "Request API Pinning Access".  Fill out the form and then, once approved, you will be able to access the pinning service API endpoints using your [API token](/how-tos/generate-api-token).

## Using the HTTP API

The Web3.Storage pinning service endpoint for all requests is [https://api.web3.storage/pins](https://api.web3.storage/pins).

### Add a pin

```shell
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

```shell
curl -X GET 'https://api.web3.storage/pins' \
  --header 'Accept: */*' \
  --header 'Authorization: Bearer <YOUR_AUTH_KEY_JWT>'
```

### Delete a pin

```shell
curl -X DELETE 'https://api-staging.web3.storage/pins/<REQUEST_ID>' \
  --header 'Accept: */*' \
  --header 'Authorization: Bearer <YOUR_AUTH_KEY_JWT>'
```

## Using the IPFS CLI

The [IPFS CLI](https://docs.ipfs.io/reference/cli/) can be used to maintain pins by first adding the Web3.Storage pinning service.

```shell
ipfs pin remote service add web3.storage https://api.web3.storage/ <YOUR_AUTH_KEY_JWT>
```

### Add a pin

```shell
ipfs pin remote add --service=web3.storage --name=<PIN_NAME> <CID>
```

### List pins

```shell
ipfs pin remote ls --service=web3.storage
```

### Remove a pin

```shell
ipfs pin remote rm --service=web3.storage --cid=<CID>
```
