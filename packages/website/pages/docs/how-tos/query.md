---
title: How to query web3.storage
description: Learn how to query web3.storage in this quick how-to guide.
---

import { Tabs, TabItem } from 'components/tabs/tabs';
import Callout from 'components/callout/callout';
import CodeSnippet from 'components/codesnippet/codesnippet';
import howtoSource from '!!raw-loader!../../../assets/code-snippets/how-to/index.js';
import golangStatus from '!!raw-loader!../../../assets/code-snippets/how-to/golang/status/status.go';

# How to query web3.storage

In this how-to guide, you'll learn how to **query web3.storage for information about your files.**

When you [store a file][howto-store] with web3.storage, you receive a [content identifier (CID)][ipfs-docs-cid] that you can use to [retrieve the file][howto-retrieve]. However, this CID can also be used to query the service for more details about _how_ the data is stored on the decentralized storage networks that web3.storage uses under the hood.

This guide will show you how to use web3.storage's [JavaScript client library][reference-js-client] or [Go client library][reference-go-client] to get information about content stored on the network. To follow along, you'll need the API token from your web3.storage account. If you already have an account and a token, read on. If not, have a look at the [quickstart guide][quickstart] to get up and running in just a few minutes for free.

## Installing the client

<Tabs groupId="lang">
<TabItem value="js" label="JavaScript">

In your JavaScript project, add the `web3.storage` package to your dependencies:

```bash
npm install web3.storage
```

</TabItem>
<TabItem value="go" label="Go">

In your Go project, add the client package to your dependencies using `go get`:

```bash
go get github.com/web3-storage/go-w3s-client
```

</TabItem>
</Tabs>

## Creating a client instance

<Tabs groupId="lang">
<TabItem value="js" label="JavaScript">

To create a `Web3Storage` client object, we need to pass an access token into the [constructor][reference-js-constructor]:

<CodeSnippet lang="js" src={howtoSource} region="makeStorageClient" />

<Callout type="info">
##### Tip
Don't have an access token? Get your web3.storage API token in just a few minutes using the instructions in the [quickstart guide.][quickstart]
</Callout>

</TabItem>
<TabItem value="go" label="Go">

First, make sure to import the client `w3s` package:

```go
import "github.com/web3-storage/go-w3s-client"
```

You can create a client instance with the [`NewClient` function][reference-go-newclient], passing in an API token using the [`WithToken` option][reference-go-withtoken]:

```go
token := "<AUTH_TOKEN_GOES_HERE>"
client, err := w3s.NewClient(w3s.WithToken(token))
```

</TabItem>
</Tabs>

## Querying for status information

<Tabs groupId="lang">
<TabItem value="js" label="JavaScript">

The client object's `status` method accepts a CID string and returns a JSON object with information about the upload. Here's how to include it in your project:

<CodeSnippet lang="js" src={howtoSource} region="query-status" />

<Callout type="warning">
##### IMPORTANT
**Remember to check the return value!** If you ask for the status of a CID that web3.storage doesn't know about, the `status` method will return `undefined` instead of a status object. Make sure to check that a return value exists before trying to use it, as we're doing above with the `if (status)` conditional statement.
</Callout>

If the given CID is valid and has been uploaded to web3.storage, the `status` method will return an object that looks similar to this:

```json
{
  "cid": "bafybeiepdjmu7bkau2sv5hag4m76jyt747d4do6kenhedpvd24kcc2zq7u",
  "created": "2021-08-24T21:35:31.988241Z",
  "dagSize": 15393,
  "pins": [
    {
      "status": "Pinned",
      "updated": "2021-08-24T21:39:40.586057Z",
      "peerId": "12D3KooWMbibcXHwkSjgV7VZ8TMfDKi6pZvmi97P83ZwHm9LEsvV",
      "peerName": "web3-storage-dc13",
      "region": "US-DC"
    },
    {
      "status": "Pinned",
      "updated": "2021-08-24T21:39:40.586057Z",
      "peerId": "12D3KooWF6uxxqZf4sXpQEbNE4BfbVJWAKWrFSKamxmWm4E9vyzd",
      "peerName": "web3-storage-am6",
      "region": "NL"
    },
    {
      "status": "Pinned",
      "updated": "2021-08-24T21:39:40.586057Z",
      "peerId": "12D3KooWLWFUri36dmTkki6o9PwfQNwGb2gsHuKD5FdcwzCXYnwc",
      "peerName": "web3-storage-am6-2",
      "region": "NL"
    }
  ],
  "deals": [
    {
      "dealId": 2332952,
      "storageProvider": "f022142",
      "status": "Active",
      "pieceCid": "baga6ea4seaqo6jfxitxwcgcemdcqnmnqan7p7u4l76k3orjqjdo5lengpiorcia",
      "dataCid": "bafybeie2bpl25wxuif2r6zlsq4l77h2jbldscr2yn3jz7iy4pqdd725fau",
      "dataModelSelector": "Links/47/Hash/Links/15/Hash/Links/0/Hash",
      "activation": "2021-08-25T13:00:30Z",
      "created": "2021-08-25T00:17:10.392875Z",
      "updated": "2021-08-25T07:57:26.999531Z"
    },
    {
      "dealId": 2333120,
      "storageProvider": "f022352",
      "status": "Active",
      "pieceCid": "baga6ea4seaqo6jfxitxwcgcemdcqnmnqan7p7u4l76k3orjqjdo5lengpiorcia",
      "dataCid": "bafybeie2bpl25wxuif2r6zlsq4l77h2jbldscr2yn3jz7iy4pqdd725fau",
      "dataModelSelector": "Links/47/Hash/Links/15/Hash/Links/0/Hash",
      "activation": "2021-08-25T14:50:30Z",
      "created": "2021-08-25T01:00:28.410557Z",
      "updated": "2021-08-25T07:57:26.307022Z"
    },
    {
      "dealId": 2333678,
      "storageProvider": "f01278",
      "status": "Published",
      "pieceCid": "baga6ea4seaqo6jfxitxwcgcemdcqnmnqan7p7u4l76k3orjqjdo5lengpiorcia",
      "dataCid": "bafybeie2bpl25wxuif2r6zlsq4l77h2jbldscr2yn3jz7iy4pqdd725fau",
      "dataModelSelector": "Links/47/Hash/Links/15/Hash/Links/0/Hash",
      "activation": "2021-08-26T23:37:30Z",
      "created": "2021-08-25T03:02:14.998793Z",
      "updated": "2021-08-25T07:57:26.639659Z"
    }
  ]
}
```

What do all those fields mean? Here's a summary:

- `cid` contains the same CID that was passed into the `status` method, so you don't have to keep track of which response goes with which request.
- `created` contains an [ISO-8601 datetime string][iso-8601] indicating when the content was first uploaded to web3.storage.
- `dagSize` contains the size in bytes of the [Directed Acyclic Graph (DAG)][ipfs-docs-merkle-dag] that contains all the uploaded content. This is the size of the data that is transferred over the network to web3.storage during upload, and is slightly larger than the total size of the files on disk.
- `pins` contains an array of objects describing the IPFS nodes that have [pinned][ipfs-docs-pinning] the data, making it available for fast retrieval using the IPFS network.
- `deals` contains an array of objects describing the Filecoin storage providers that have made [storage deals][fil-docs-deals]. These storage providers have committed to storing the data for an agreed period of time. Note that it may take up to 48 hours after uploading data to web3.storage before Filecoin deals are activated.

For more details about the fields in this JSON response, including the format of the `pins` and `deals` objects, see the [JavaScript client library reference][reference-js-status].

<Callout type="info">
##### Tip
If you're looking for info on files you've uploaded, you can also use the [Files page](https://web3.storage/account) on web3.storage to see the values for some of the more commonly-used attributes returned by `query()`, namely `created`, `cid`, `dagSize`, and the `status` and `deals` objects of `pins`.
</Callout>

</TabItem>
<TabItem value="go" label="Go">

The Go client's [`Client` interface](https://pkg.go.dev/github.com/web3-storage/go-w3s-client#Client) defines a `Status` method that accepts a [`context.Context`](https://pkg.go.dev/context#Context) and a [`Cid`](https://pkg.go.dev/github.com/ipfs/go-cid#Cid) from the [`go-cid` library](https://pkg.go.dev/github.com/ipfs/go-cid).

The example below accepts a CID string and converts it to a `Cid` using `cid.Parse`. If your codebase is already using the `Cid` type, you may not need this step.

<CodeSnippet lang="go" src={golangStatus} region="getStatusForCidString" />

</TabItem>
</Tabs>

## Next steps

If you haven't yet explored in depth how to store data using web3.storage, check out the [storage how-to guide][howto-store] for a deep dive on how to upload files using the client libraries.

To learn in greater detail how to fetch your data using the web3.storage client, or directly from IPFS using a gateway or the IPFS command line, see the [how-to guide on retrieval][howto-retrieve].

[quickstart]: /docs/intro/#quickstart
[howto-store]: /docs/how-tos/store/
[howto-retrieve]: /docs/how-tos/retrieve/
[reference-js-client]: /docs/reference/js-client-library/
[reference-js-constructor]: /docs/reference/js-client-library/#constructor
[reference-js-status]: /docs/reference/js-client-library/#check-status
[reference-go-client]: /docs/reference/go-client-library/
[ipfs-docs-cid]: https://docs.ipfs.io/concepts/content-addressing/
[ipfs-docs-merkle-dag]: https://docs.ipfs.io/concepts/merkle-dag/
[ipfs-docs-pinning]: https://docs.ipfs.io/concepts/persistence/
[fil-docs-deals]: https://docs.filecoin.io/about-filecoin/how-filecoin-works/#deals
[iso-8601]: https://en.wikipedia.org/wiki/ISO_8601
