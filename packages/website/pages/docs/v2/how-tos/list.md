---
title: How to list files uploaded to web3.storage
description: Learn how to list the files you've uploaded to web3.storage in this quick how-to guide.
---

import Callout from 'components/callout/callout';
import CodeSnippet from 'components/codesnippet/codesnippet';
import Img from 'components/cloudflareImage';
import ImgFilesListing from '../../../../public/images/docs/files-listing.png';

# How to list files uploaded to web3.storage

In this how-to guide, you'll learn about the different ways that you can **list the files that you've uploaded to web3.storage.**
Once you've [stored some files][howto-store] using web3.storage, you'll want to see a list of what you've uplodaded. There are two ways you can do this:

## Using the web3.storage website

You can see a list of everything you've uploaded to web3.storage on the [Files page][site-files] on the web3.storage website. If you don't need to work with this list programmatically, using the website may be a simpler choice.

<Img src={ImgFilesListing} alt="A screenshot of the file listing available when logged in to your account" />

This [Files page][site-files] provides a convenient overview of your stored data, including links to view your files in your browser via an [IPFS gateway][ipfs-docs-gateway] and information about how the data is being stored on the [decentralized storage networks][concepts-decentralized-storage] that web3.storage uses under the hood.

## Using the `w3up-client` library

To easily integrate web3.storage programmatically in your apps or services, you can also access a listing of your uploads from your code using the `w3up` client. In the example below, this guide walks through how to use the [JavaScript client library][reference-js-client] to fetch a complete listing of all the data you've uploaded using web3.storage.

### Installing the client

In your JavaScript project, add the `w3up-client` package to your dependencies:

```bash
npm install w3up-client
```

### Creating a client instance

To create a `w3up` client object, we need to pass some configuration settings into the [constructor][reference-js-constructor]:

> **TODO**: snippet of client creation (or link to same)

### Listing your uploads

The `w3up` client object's [`list` method][reference-js-list] returns an [async iterable][js-async-iterable-explainer] that can be used with the [`for await` syntax][mdn-for-await-of] to read information about each upload as soon as it's received over the network.

Here's an example that logs details about each upload to the console:

> **TODO**: new code snippet to list & print CIDs

#### Pagination & filtering

> **TODO**: pagination details

> **TODO**: audit link targets

[howto-store]: /docs/how-tos/store/
[howto-retrieve]: /docs/how-tos/retrieve/
[howto-query]: /docs/how-tos/query/
[howto-gen-token]: /docs/how-tos/generate-api-token/
[concepts-decentralized-storage]: /docs/concepts/decentralized-storage/
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
