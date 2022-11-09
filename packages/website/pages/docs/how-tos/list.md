---
title: How to list files uploaded to web3.storage
description: Learn how to list the files you've uploaded to web3.storage in this quick how-to guide.
---

import Callout from 'components/callout/callout';
import CodeSnippet from 'components/codesnippet/codesnippet';
import howtoSource from '!!raw-loader!../../../assets/code-snippets/how-to/index.js'
import exampleUpload from '!!raw-loader!../../../assets/code-snippets/how-to/example-listing-upload.json.txt'
import Img from 'components/cloudflareImage';
import ImgFilesListing from '../../../public/images/docs/files-listing.png';

# How to list files uploaded to web3.storage

In this how-to guide, you'll learn about the different ways that you can **list the files that you've uploaded to web3.storage.**
Once you've [stored some files][howto-store] using web3.storage, you'll want to see a list of what you've uplodaded. There are two ways you can do this:

## Using the web3.storage website

You can see a list of everything you've uploaded to web3.storage on the [Files page][site-files] on the web3.storage website. If you don't need to work with this list programmatically, using the website may be a simpler choice.

<Img src={ImgFilesListing} alt="A screenshot of the file listing available when logged in to your account" />

This [Files page][site-files] provides a convenient overview of your stored data, including links to view your files in your browser via an [IPFS gateway][ipfs-docs-gateway] and information about how the data is being stored on the decentralized storage networks that web3.storage uses under the hood.

## Using the web3.storage client

To easily integrate web3.storage programmatically in your apps or services, you can also access a listing of your uploads from your code using the web3.storage client. In the example below, this guide walks through how to use the [JavaScript client library][reference-js-client] to fetch a complete listing of all the data you've uploaded using web3.storage.

### Installing the client

In your JavaScript project, add the `web3.storage` package to your dependencies:

```bash
npm install web3.storage
```

### Creating a client instance

To create a `Web3Storage` client object, we need to pass an access token into the [constructor][reference-js-constructor]:

<CodeSnippet lang="js" src={howtoSource} region="makeStorageClient" />

<Callout type="info">
##### Tip
You can use any API token associated with your account, not just the one you originally used to upload your files! See the [Generate API token page][howto-gen-token] for more about token management.
</Callout>

### Listing your uploads

The `Web3Storage` client object's [`list` method][reference-js-list] returns an [async iterable][js-async-iterable-explainer] that can be used with the [`for await` syntax][mdn-for-await-of] to read information about each upload as soon as it's received over the network.

Here's an example that logs details about each upload to the console:

<CodeSnippet lang="js" src={howtoSource} region="listUploads" />

Each `Upload` object will look something like this:

<CodeSnippet lang="json" src={exampleUpload} />

What do all those fields mean? Here's a summary:

- `name` contains a descriptive name for the upload. If no name was provided at the time of upload, the `name` field will contain an automatically generated name that includes a creation timestamp.
- `cid` contains the [IPFS Content Identifier (CID)][ipfs-docs-cid] that identifies the uploaded data. This CID can be used to [retrieve][howto-retrieve] the uploaded files or get more detailed [status information][howto-query].
- `created` contains an [ISO-8601 datetime string][iso-8601] indicating when the content was first uploaded to web3.storage.
- `dagSize` contains the size in bytes of the [Directed Acyclic Graph (DAG)][ipfs-docs-merkle-dag] that contains all the uploaded content. This is the size of the data that is transferred over the network to web3.storage during upload, and is slightly larger than the total size of the files on disk.
- `pins` contains an array of objects describing the IPFS nodes that have [pinned][ipfs-docs-pinning] the data, making it available for fast retrieval using the IPFS network.
- `deals` contains an array of objects describing the Filecoin storage providers that have made [storage deals][fil-docs-deals]. These storage providers have committed to storing the data for an agreed period of time.

<Callout type="info">
##### Want more details about storage?
The `Upload` objects returned by the `list` method include some basic status information about how the data is stored on IPFS and Filecoin. For more details, including the identity of the storage providers hosting your data, you can [query an upload's status][howto-query] using the `cid`.
</Callout>

#### Listing a subset of uploads

By default, the [`list` method][reference-js-list] returns information about all uploads made using your web3.storage account. You can optionally restrict the listing in two ways:

- Only contain entries that were uploaded before a given timestamp.
- Limit the total number of returned entries.

Here's an example of fetching the first 10 uploads made on the previous day:

<CodeSnippet lang="js" src={howtoSource} region="listWithLimits" />

[howto-store]: /docs/how-tos/store/
[howto-retrieve]: /docs/how-tos/retrieve/
[howto-query]: /docs/how-tos/query/
[howto-gen-token]: /docs/how-tos/generate-api-token/
[reference-js-client]: /docs/reference/js-client-library/
[reference-js-constructor]: /docs/reference/js-client-library/#constructor
[reference-js-list]: /docs/reference/js-client-library/#list-uploads
[site-files]: https://web3.storage/account
[ipfs-docs-gateway]: https://docs.ipfs.io/concepts/ipfs-gateway/
[ipfs-docs-cid]: https://docs.ipfs.io/concepts/content-addressing/
[ipfs-docs-merkle-dag]: https://docs.ipfs.io/concepts/merkle-dag/
[ipfs-docs-pinning]: https://docs.ipfs.io/concepts/persistence/
[fil-docs-deals]: https://docs.filecoin.io/about-filecoin/how-filecoin-works/#deals
[iso-8601]: https://en.wikipedia.org/wiki/ISO_8601
[js-async-iterable-explainer]: https://javascript.info/async-iterators-generators
[mdn-for-await-of]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of
