---
title: Getting upload status
---

# Getting upload status

The Web3.Storage service provides a few ways to check on the status of an upload.

On the [Account page](https://web3.storage/account) of the Web3.Storage site, you can see a list of files that you've uploaded to Web3.Storage.

![Screenshot of Web3.Storage account page, showing a table of uploaded files](/images/docs/account-page-files.png)

The table on the account page has two columns related to the current status of the data storage process, [Status](#status) and [Storage Providers](#storage-providers).

The information in the account page file list is also available using the [JavaScript client's `status` method][client-js-check], via the [HTTP API][client-http] by sending a `GET` request to the `/status/{cid}` endpoint, or using the `w3 status <cid>` command on the [CLI](https://github.com/web3-storage/web3.storage/tree/main/packages/w3#readme).

## Status

When you upload data to Web3.Storage, it is ["pinned"][ipfs-docs-pinning] to several nodes in an [IPFS cluster][ipfs-cluster]. An IPFS cluster is a group of machines that coordinate to provide content-addressed data to the [IPFS](https://ipfs.io) peer-to-peer network.

The **Status** column shows the status of the pinning operation. There are three possible values for the Status column: `Queuing`, `Pinned`, and `Failed`.

The `Queuing` status indicates that a request to pin the data has been submitted to a cluster node, and the node has added the request to a queue for pinning. Depending on how busy the cluster is, an upload may stay in the `Queuing` state for some time before transitioning to `Pinned` or `Failed`.

Note that you can [retrieve your data using IPFS][howto-retrieve] even while the status is `Queuing`. You can verify this by retrieving your data from an HTTP gateway. If you've uploaded a directory, try retrieving a sample of the files within the directory.

A `Pinned` status means that the cluster has successfully pinned the data.

A `Failed` status indicates that an operation failed while attempting to pin the data. Note that a `Failed` status may be temporary, as the cluster will continually retry `Failed` pins in the background and will update the status to `Pinned` if a retry attempt is successful.

In addition to automatic retries by the cluster, a `Failed` pin will change to `Pinned` if the same data is uploaded successfully in a subsequent request. As long as the CID is the same for both uploads, the original upload's status will be marked as `Pinned` after a small delay.

There are several reasons why an upload may end up in the `Failed` state.

If you are able to [retrieve the data from IPFS][howto-retrieve], the cluster is likely waiting to retry a previous attempt and will soon pin the data.

If you uploaded your data directly to the Web3.Storage service using a [client library][client-js], [the HTTP API][client-http], or the [Upload files button on the website account page][upload-page], a `Failed` status may indicate that one or more chunks of data was not received by the service. This may happen when uploading large files or directories containing many files and may be resolved by retrying the upload.

If your data was pinned using the Pinning Service API, a `Failed` status usually means that the cluster wasn't able to fetch the complete content over the IPFS peer-to-peer network. These issues can be hard to diagnose due to the many variables involved, especially when the original source of the data may have an unreliable connection to the network or is behind a firewall. If the data is being provided by another pinning service such as Pinata, or if you've verified that the data is retrievable using IPFS (ideally from multiple distinct locations), please [file an issue][new-issue] so we can look into the cause.

Please note that the status reported by the Web3.Storage service may not always be in sync with the actual status as reported by the IPFS cluster. The Web3.Storage service checks if `Failed` pins have been found and pinned by the cluster once per week for up to one month after the initial upload.

If you find that your file is retrievable but the pin status still says `Failed`, please [file an issue][new-issue] with the relevant CIDs and we'll take a look.

## Storage providers

The **Storage Providers** column on the file listing page shows information about the [Filecoin storage providers][fil-docs-storage-providers] that have committed to long-term storage deals for the uploaded data.

When data is first uploaded, the Storage Providers column will show a status of `Queuing`. This indicates that the Web3.Storage service has the data and is aggregating it into a format that can be used to make a storage deal.

Once enough data has been aggregated, the Web3.Storage service will propose several Filecoin [storage deals][fil-docs-deals] with different Filecoin storage providers. These will initially be shown in a `Pending` status, while the provider accepts the deal and posts its commitment to the Filecoin blockchain.

When using the HTTP API or client library to check the upload status, information about Filecoin storage is provided in the `deals` array field within the status response object. The `deals` array will be empty while the upload is in the `Queuing` state.

Once storage deals have been proposed, the `deals` array will contain JSON objects describing each deal. Each object has a `status` field, which will have a value of `"Queued"` when the deal is pending. When the deal has been confirmed and published to the Filecoin blockchain, the `status` field will have a value of `"Active"`.

Storage deal schema:

| Key                 | Description                                                                                           |
| ------------------- | ----------------------------------------------------------------------------------------------------- |
| `dealId`            | On-chain ID of the deal.                                                                              |
| `storageProvider`   | Address of the provider storing this data.                                                            |
| `status`            | Current deal status: `"Queued"` `"Published"` `"Active"`                                              |
| `pieceCid`          | Filecoin [Piece CID](https://spec.filecoin.io/systems/filecoin_files/piece/) of the data in the deal. |
| `dataCid`           | CID of the data aggregated in this deal.                                                              |
| `dataModelSelector` | Selector for extracting stored data from the aggregated data root.                                    |
| `activation`        | Date when the deal will become active in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.   |
| `created`           | Created date in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.                            |
| `updated`           | Updated date in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.                            |

Example JSON for an active storage deal:

```json
{
  "dealId": 2229885,
  "storageProvider": "f01278",
  "status": "Active",
  "pieceCid": "baga6ea4seaqawvtpgovz222raqk6zgawvjz4kjnnl7i3pduovtuivl2qxokoaji",
  "dataCid": "bafybeigiytbwooh2ei74k6z4h7zqgo7y7rxx3zanlg4whd4g37rhh6o74m",
  "dataModelSelector": "Links/100/Hash/Links/0/Hash/Links/0/Hash",
  "activation": "2021-08-05T22:24:00+00:00",
  "expiration": "2022-12-28T22:24:00+00:00",
  "created": "2021-08-04T00:35:43.492403+00:00",
  "updated": "2021-08-09T06:16:44.047003+00:00"
}
```

You can verify the status of your upload on the Filecoin blockchain at any time after the initial storage deals are made. Once a deal is active, you'll find links to the deal information in the **Storage Providers** column on the account page file list. These will take you to the [Filfox block explorer](https://filfox.info/), which shows details of every Filecoin message and transaction. You can also use the information from the JSON deals object described above to retrieve deal information using native Filecoin software like [Lotus](https://lotus.filecoin.io/).

[ipfs-docs-pinning]: https://docs.ipfs.io/how-to/pin-files
[ipfs-cluster]: https://cluster.ipfs.io/
[howto-retrieve]: /docs/how-tos/retrieve
[client-js]: /docs/reference/js-client-library/
[client-js-check]: /docs/reference/js-client-library#check-status
[client-http]: /docs/reference/http-api/
[upload-page]: https://web3.storage/account/
[new-issue]: https://github.com/web3-storage/web3.storage/issues/new?assignees=&labels=kind%2Fbug%2Cneed%2Ftriage&template=bug_report.md&title=
[fil-docs-storage-providers]: https://docs.filecoin.io/storage-provider/
[fil-docs-deals]: https://docs.filecoin.io/storage-provider/how-providing-works/#deals
