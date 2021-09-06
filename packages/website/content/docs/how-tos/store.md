---
title: Store
description: Learn how to store your data on the decentralized web with Web3.Storage.
weight: 100
snippets:
  howto: content/docs-snippets/how-to/index.js
  browser: content/docs-snippets/how-to/platform-browser.js
  node: content/docs-snippets/how-to/platform-node.js
---

# How to store data using Web3.Storage

In this how-to guide, **you'll learn how to store data programmatically for your development projects using the Web3.Storage JavaScript client**. This includes making your data available on the decentralized [IPFS](https://ipfs.io) network with persistent long-term storage provided by [Filecoin](https://filecoin.io) — all for free.

**If you just want to quickly store a few files using Web3.Storage rather than include upload functionality in an app or service you're building**, you may want to skip this guide for now and simply use the [Files page][site-files] on the Web3.Storage site.

For developers, Web3.Storage provides a simple interface for storing data using syntax inspired by familiar web APIs such as [`fetch`][mdn-fetch] and [`File`][mdn-file]. This guide focuses on the [JavaScript client library][reference-js], which is the simplest way to use Web3.Storage programmatically. 
<!-- TODO: bring this back once the HTTP reference exists
If you're using another language, see the [HTTP API reference][reference-http] for details on working with the underlying HTTP API.
-->
Uploading data to Web3.Storage using the JavaScript client library requires a free API token, which in turn requires a Web3.Storage account. If you already have an account and a token, read on. If not, have a look at the [quickstart guide][quickstart-guide] to get up and running in just a few minutes.


:::danger CAUTION
All data uploaded to Web3.Storage is available to anyone who requests it using the correct CID. Do not store any private or sensitive information in an unencrypted form using Web3.Storage.
:::

## Installing the client

In your JavaScript project, add the `web3.storage` package to your dependencies:

```bash
npm install web3.storage
```

## Creating a client instance

First we need to create a `Web3.Storage` client object, passing in an API token to its [constructor][reference-js-constructor]:

<CodeSnippet {...snippets.howto} region="makeStorageClient" />

## Preparing files for upload

The Web3.Storage client's [`put` method][reference-js-put] accepts an array of [`File` objects](https://developer.mozilla.org/en-US/docs/Web/API/File).

There are a few different ways of creating `File` objects available, depending on your platform.

<Tabs>
<TabItem value="Browser">

In the browser, you can use a [file input element][mdn-file-input] to allow the user to select files for upload:

<CodeSnippet {...snippets.browser} region="getFiles" />

You can also manually create `File` objects using the native `File` constructor provided by the browser runtime. This is useful when you want to store data created by your application, instead of files from the user's computer.

<CodeSnippet {...snippets.browser} region="makeFileObjects" />

</TabItem>
<TabItem value="Node.js" >

In Node.js, the `web3.storage` package exports some helpful utility functions from the [`files-from-path` module](https://www.npmjs.com/package/files-from-path) that allow you to easily read `File` objects from the local file system. The `getFilesFromPath` helper asynchronously returns an array of `File`s that you can use directly with the `put` client method:

<CodeSnippet {...snippets.node} region="getFiles" />

If you expect to be loading a lot of large files, you may be better served by the [`filesFromPath` helper](https://github.com/web3-storage/files-from-path#filesfrompath). It reduces memory pressure by `yield`ing `File` objects one by one as they're loaded from disk, instead of loading everything into memory. You can then issue multiple `put` requests to send each file to Web3.Storage.

You can also manually create `File` objects by importing a Node.js implementation of `File` from the `web3.storage` package. This is useful when you want to store data created by your application, instead of files from the user's computer.

<CodeSnippet {...snippets.node} region="makeFileObjects" />

</TabItem>
</Tabs>


:::tip 
**When uploading multiple files, try to give each file a unique name.** All the files in a `put` request will be bundled into one content archive, and linking to the files inside is much easier if each file has a unique, human-readable name.
:::

## Uploading to Web3.Storage

Once you have an array of `File`s, uploading is simple:

<CodeSnippet {...snippets.howto} region="storeFiles" />

:::warning IMPORTANT
Deleting files from the Web3.Storage site's [Files page][site-files] will remove them from the file listing for your account, but that doesn't prevent nodes on the [decentralized storage network][concepts-decentralized-storage] from retaining copies of the data indefinitely. Do not use Web3.Storage for data that may need to be permanently deleted in the future.
:::

### Showing progress to the user

The `put` method has some options that can be passed in to get progress on the upload as it happens in the background. There are two callback parameters you can use: `onRootCidReady`, and `onStoredChunk`.

The `onRootCidReady` callback is invoked as soon as the client has calculated the content identifier (CID) that identifies the data being uploaded. Because this calculation happens locally on the client, the callback is invoked before the upload begins.

As each chunk of data is uploaded, the `onStoredChunk` callback gets invoked with the size of the chunk in bytes passed in as a parameter.

Here's a simple example of using the callbacks to print the progress of an upload to the console:

<CodeSnippet {...snippets.howto} region="storeWithProgress" />

## Storing IPFS Content Archives

So far we've focused on using the `put` method, which accepts regular files and packs them into an IPFS Content Archive (CAR) file before uploading to Web3.Storage. If you're already using IPFS in your application, or if you want more control over the [IPLD](https://ipld.io) graph used to structure your data, you can construct your own CAR files and upload them directly.

See [Working with CAR files][howto-car-files] for more information about Content Archives, including how to create and manipulate them with code or command-line tools.

Once you have a Content Archive, you can use the [`putCar` client method][reference-js-put-car] to upload it to Web3.Storage.

The `putCar` method accepts a `CarReader`, which is a type defined by the [`@ipld/car`][github-js-car] package.

You can create a `CarReader` from a `Uint8Array` using the `fromBytes` static method:

```js
import { CarReader } from '@ipld/car'

// assume loadCarData returns the contents of a CAR file as a Uint8Array
const carBytes = await loadCarData()
const reader = await CarReader.fromBytes(carBytes)

const client = makeStorageClient()
const cid = await client.putCar(reader)
console.log('Uploaded CAR file to Web3.Storage! CID:', cid)
```

See the [`putCar` reference documentation][reference-js-put-car] for more information about `putCar`, including optional parameters. 

The [Working with CAR files][howto-car-files] guide has more information about the `@ipld/car` package, including how to implement the `loadCarData` function and other ways to construct a `CarReader`.

## Next steps

The `put` method returns an IPFS [content identifier (CID)][ipfs-docs-cid] that can be used to fetch your files over IPFS. Once uploaded, your data is immediately available for retrieval via IPFS and will be stored with Filecoin storage providers within 48 hours. To learn how to fetch your data using the Web3.Storage client, or directly from IPFS using a gateway or the IPFS command line, see the [how-to guide on retrieval][howto-retrieve]. 

You can also get more information about the status of your data. See the [query how-to guide][howto-query] to learn how to get more details about your data, including the status of any Filecoin storage deals.

<!-- internal links -->

[reference-js]: ../reference/client-library.md
[reference-js-constructor]: ../reference/client-library.md#constructor
[reference-js-put]: ../reference/client-library.md#store-files
[reference-js-put-car]: ../reference/client-library.md#store-car-files

[quickstart-guide]: ../README.md#quickstart
[howto-retrieve]: ./retrieve.md
[howto-query]: ./query.md
[howto-car-files]: ./work-with-car-files.md
[concepts-decentralized-storage]: ../concepts/decentralized-storage.md

<!-- links to the web3.storage site -->
[site-files]: https://web3.storage/files/

<!-- external links -->
[ipfs-docs-cid]: https://docs.ipfs.io/concepts/content-addressing/
[ipfs-docs-cli-quickstart]: https://docs.ipfs.io/how-to/command-line-quick-start/
[mdn-fetch]: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
[mdn-file]: https://developer.mozilla.org/en-US/docs/Web/API/File
[mdn-file-input]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file
[github-js-car]: https://github.com/ipld/js-car
