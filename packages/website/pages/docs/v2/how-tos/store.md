---
title: How to store data using web3.storage
description: Learn how to store your data on the decentralized web with web3.storage.
---

import { Tabs, TabItem } from 'components/tabs/tabs';
import Callout from 'components/callout/callout';
import CodeSnippet from 'components/codesnippet/codesnippet';

# How to store data using web3.storage

> **TODO**: should this be "how to store data with w3up" instead?

In this how-to guide, **you'll learn how to store data programmatically for your development projects using the web3.storage client libraries** in [JavaScript][reference-js]. This includes making your data available on the decentralized [IPFS](https://ipfs.io) network with persistent long-term storage provided by [Filecoin](https://filecoin.io).

**If you just want to quickly store a few files using web3.storage rather than include upload functionality in an app or service you're building**, you may want to skip this guide for now and simply use the [Files page][site-files] on the web3.storage site.

For developers, web3.storage provides a simple interface for storing data using syntax inspired by familiar web APIs such as [`fetch`][mdn-fetch] and [`File`][mdn-file]. This guide focuses on [JavaScript client library][reference-js], which is the simplest way to use web3.storage programmatically.

> **TODO**: link to v1 docs for non-js users

Uploading data to web3.storage using a client library requires a UCAN identity key that's registered to a web3.storage account. If you already have an account and a UCAN identity, read on. If not, have a look at the [quickstart guide][quickstart-guide] to get up and running in just a few minutes.

<Callout type="warning">
##### CAUTION
All data uploaded to web3.storage is available to anyone who requests it using the correct CID. Do not store any private or sensitive information in an unencrypted form using web3.storage.
</Callout>

## Installing the client

In your JavaScript project, add the `w3up-client` package to your dependencies:

```bash
npm install w3p-client
```

## Creating a client instance

> **TODO**: Client construction example, showing how to init client with your UCAN key. Maybe include JS registration flow also? Might be enough to have it in the quickstart guide and link to it.

## Preparing files for upload

> **TODO**: figure out if this is still needed... the current w3up-client only uploads CARs, so we'd need to encode to CAR. Might change before publication tho.

## Uploading to web3.storage

Once your files are ready, uploading is a simple method call on the client object.

<Callout type="warning">
##### IMPORTANT
Deleting files from the web3.storage site's [Files page][site-files] will remove them from the file listing for your account, but that doesn't prevent nodes on the [decentralized storage network][concepts-decentralized-storage] from retaining copies of the data indefinitely. Do not use web3.storage for data that may need to be permanently deleted in the future.
</Callout>

> **TODO**: upload code snippet

#### Showing progress to the user

> **TODO**: Do we have a method for this in v2 API?

### Directory wrapping

By default, files uploaded to web3.storage will be wrapped in an IPFS directory listing. This preserves the original filename and makes links more human-friendly than CID strings, which look like random gibberish.

The CID you get back from the client when uploading is the CID of the directory, not the file itself! To link to the file itself using an IPFS URI, just add the filename to the CID, separated by a `/` like this: `ipfs://<cid>/<filename>`.

To make a gateway link, use `https://<cid>.ipfs.<gateway-host>/<filename>` or `https://<gateway-host>/ipfs/<cid>/<filename>`, where `<gateway-host>` is the address of an HTTP gateway like `dweb.link`.

Once uploaded, you can [retrieve the directory][howto-retrieve] or [list the contents][howto-list-dir] without downloading it.

To avoid having your files wrapped in a directory listing, set the [`wrapWithDirectory:` option][reference-js-put] to `false` when uploading using the JavaScript client.

## Storing IPFS Content Archives

> **TODO**: revise to use `upload` instead of `put`

So far we've focused on using the `put` method, which accepts regular files and packs them into an IPFS Content Archive (CAR) file before uploading to web3.storage. If you're already using IPFS in your application, or if you want more control over the [IPLD](https://ipld.io) graph used to structure your data, you can construct your own CAR files and upload them directly.

See [Working with CAR files][howto-car-files] for more information about Content Archives, including how to create and manipulate them with code or command-line tools.

Once you have a Content Archive, you can use the [`putCar` client method][reference-js-put-car] to upload it to web3.storage.

The `putCar` method accepts a `CarReader`, which is a type defined by the [`@ipld/car`][github-js-car] package.

You can create a `CarReader` from a `Uint8Array` using the `fromBytes` static method:

```js
import { CarReader } from '@ipld/car';

// assume loadCarData returns the contents of a CAR file as a Uint8Array
const carBytes = await loadCarData();
const reader = await CarReader.fromBytes(carBytes);

const client = makeStorageClient();
const cid = await client.putCar(reader);
console.log('Uploaded CAR file to web3.storage! CID:', cid);
```

See the [`putCar` reference documentation][reference-js-put-car] for more information about `putCar`, including optional parameters.

The [Working with CAR files][howto-car-files] guide has more information about the `@ipld/car` package, including how to implement the `loadCarData` function and other ways to construct a `CarReader`.

## Next steps

The client returns an IPFS [content identifier (CID)][ipfs-docs-cid] that can be used to fetch your files over IPFS. Once uploaded, your data is immediately available for retrieval via IPFS and will be stored with Filecoin storage providers within 48 hours. To learn how to fetch your data using the web3.storage client, or directly from IPFS using a gateway or the IPFS command line, see the [how-to guide on retrieval][howto-retrieve].

> **TODO**: make sure all links resolve to v2 content

[reference-js]: /docs/reference/js-client-library/
[reference-js-constructor]: /docs/reference/js-client-library/#constructor
[reference-js-put]: /docs/reference/js-client-library/#store-files
[reference-js-put-car]: /docs/reference/js-client-library/#store-car-files
[reference-go]: /docs/reference/go-client-library/
[reference-go-newclient]: https://pkg.go.dev/github.com/web3-storage/go-w3s-client#NewClient
[reference-go-withtoken]: https://pkg.go.dev/github.com/web3-storage/go-w3s-client#WithToken
[reference-go-client-interface]: https://pkg.go.dev/github.com/web3-storage/go-w3s-client#Client
[reference-http]: /docs/reference/http-api/
[quickstart-guide]: /docs/intro/#quickstart
[howto-retrieve]: /docs/how-tos/retrieve/
[howto-query]: /docs/how-tos/query/
[howto-car-files]: /docs/how-tos/work-with-car-files/
[howto-list-dir]: /docs/how-tos/list-directory-contents/
[concepts-decentralized-storage]: /docs/concepts/decentralized-storage/
[site-files]: https://web3.storage/account/
[ipfs-docs-cid]: https://docs.ipfs.io/concepts/content-addressing/
[ipfs-docs-cli-quickstart]: https://docs.ipfs.io/how-to/command-line-quick-start/
[mdn-fetch]: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
[mdn-file]: https://developer.mozilla.org/en-US/docs/Web/API/File
[mdn-file-input]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file
[github-js-car]: https://github.com/ipld/js-car
