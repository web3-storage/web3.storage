---
title: Query
description: Learn how to query Web3.Storage in this quick how-to guide.
snippets:
  howto: content/docs-snippets/how-to/index.js
---

# How to query Web3.Storage

In this how-to guide, you'll learn how to **query Web3.Storage for information about your files.**

When you [store a file][howto-store] with Web3.Storage, you receive a [content identifier (CID)][ipfs-docs-cid] that you can use to [retrieve the file][howto-retrieve]. However, this CID can also be used to query the service for more details about _how_ the data is stored on the [decentralized storage networks][concepts-decentralized-storage] that Web3.Storage uses under the hood. 

This guide will show you how to use Web3.Storage's [JavaScript client library][reference-js-client] to get information about content stored on the network. To follow along, you'll need the API token from your Web3.Storage account. If you already have an account and a token, read on. If not, have a look at the [quickstart guide][quickstart] to get up and running in just a few minutes for free.

## Installing the client

In your JavaScript project, add the `web3.storage` package to your dependencies:

```shell
npm install web3.storage
```

## Creating a client instance

To create a `Web3Storage` client object, we need to pass an access token into the [constructor][reference-js-constructor]:

<CodeSnippet {...snippets.howto} region="makeStorageClient" />

:::tip
Don't have an access token? Get your Web3.Storage API token in just a few minutes using the instructions in the [quickstart guide.][quickstart]
:::

## Querying for status information

The client object's `status` method accepts a CID string and returns a JSON object with information about the upload. Here's how to include it in your project:

<CodeSnippet {...snippets.howto} region="query-status" />

:::warning IMPORTANT 
**Remember to check the return value!** If you ask for the status of a CID that Web3.Storage doesn't know about, the `status` method will return `undefined` instead of a status object. Make sure to check that a return value exists before trying to use it, as we're doing above with the `if (status)` conditional statement.
:::

If the given CID is valid and has been uploaded to Web3.Storage, the `status` method will return an object that looks similar to this:


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
- `created` contains an [ISO-8601 datetime string][iso-8601] indicating when the content was first uploaded to Web3.Storage.
- `dagSize` contains the size in bytes of the [Directed Acyclic Graph (DAG)][ipfs-docs-merkle-dag] that contains all the uploaded content. This is the size of the data that is transferred over the network to Web3.Storage during upload, and is slightly larger than the total size of the files on disk.
- `pins` contains an array of objects describing the IPFS nodes that have [pinned][ipfs-docs-pinning] the data, making it available for fast retrieval using the IPFS network.
- `deals` contains an array of objects describing the Filecoin storage providers that have made [storage deals][fil-docs-deals]. These storage providers have committed to storing the data for an agreed period of time. Note that it may take up to 48 hours after uploading data to Web3.Storage before Filecoin deals are activated.

For more details about the fields in this JSON response, including the format of the `pins` and `deals` objects, see the [JavaScript client library reference][reference-js-status].

:::tip
If you're looking for info on files you've uploaded, you can also use the [Files page](https://web3.storage/files) on Web3.Storage to see the values for some of the more commonly-used attributes returned by `query()`, namely `created`, `cid`, `dagSize`, and the `status` and `deals` objects of `pins`.
:::

## Next steps

If you haven't yet explored in depth how to store data using Web3.Storage, check out the [storage how-to guide][howto-store] for a deep dive on how to upload files using the [JavaScript client library][reference-js-client].

To learn in greater detail how to fetch your data using the Web3.Storage client, or directly from IPFS using a gateway or the IPFS command line, see the [how-to guide on retrieval][howto-retrieve].

[quickstart]: ../README.md#quickstart
[concepts-decentralized-storage]: ../concepts/decentralized-storage.md
[howto-store]: ./store.md
[howto-retrieve]: ./retrieve.md
[reference-js-client]: ../reference/client-library.md
[reference-js-constructor]: ../reference/client-library.md#constructor
[reference-js-status]: ../reference/client-library.md#check-status

[ipfs-docs-cid]: https://docs.ipfs.io/concepts/content-addressing/
[ipfs-docs-merkle-dag]: https://docs.ipfs.io/concepts/merkle-dag/
[ipfs-docs-pinning]: https://docs.ipfs.io/concepts/persistence/
[fil-docs-deals]: https://docs.filecoin.io/about-filecoin/how-filecoin-works/#deals

[iso-8601]: https://en.wikipedia.org/wiki/ISO_8601
