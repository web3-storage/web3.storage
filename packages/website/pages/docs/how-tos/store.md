---
title: How to store data using Web3.Storage
description: Learn how to store your data on the decentralized web with Web3.Storage.
---

import { Tabs, TabItem } from 'components/tabs/tabs';
import Callout from 'components/callout';
import CodeSnippet from 'components/codesnippet/codesnippet';
import howtoSource from '!!raw-loader!../../../assets/code-snippets/how-to/index.js'
import platformBrowserSource from '!!raw-loader!../../../assets/code-snippets/how-to/platform-browser.js'
import platformNodeSource from '!!raw-loader!../../../assets/code-snippets/how-to/platform-node.js'
import golangUpload from '!!raw-loader!../../../assets/code-snippets/how-to/golang/upload/upload.go'

# How to store data using Web3.Storage

In this how-to guide, **you'll learn how to store data programmatically for your development projects using the Web3.Storage client libraries** in [JavaScript][reference-js] and [Go][reference-go]. This includes making your data available on the decentralized [IPFS](https://ipfs.io) network with persistent long-term storage provided by [Filecoin](https://filecoin.io) — all for free.

**If you just want to quickly store a few files using Web3.Storage rather than include upload functionality in an app or service you're building**, you may want to skip this guide for now and simply use the [Files page][site-files] on the Web3.Storage site.

For developers, Web3.Storage provides a simple interface for storing data using syntax inspired by familiar web APIs such as [`fetch`][mdn-fetch] and [`File`][mdn-file]. This guide focuses on [JavaScript client library][reference-js] and [Go client library][reference-go], which are the simplest way to use Web3.Storage programmatically.

If you're using another language, see the [HTTP API reference][reference-http] for details on working with the underlying HTTP API.

Uploading data to Web3.Storage using a client library requires a free API token, which in turn requires a Web3.Storage account. If you already have an account and a token, read on. If not, have a look at the [quickstart guide][quickstart-guide] to get up and running in just a few minutes.

<Callout type="warning">
##### CAUTION
All data uploaded to Web3.Storage is available to anyone who requests it using the correct CID. Do not store any private or sensitive information in an unencrypted form using Web3.Storage.
</Callout>

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

First, create a `Web3.Storage` client object, passing in an API token to its [constructor][reference-js-constructor]:

<CodeSnippet lang="js" src={howtoSource} region="makeStorageClient" />

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

## Preparing files for upload

<Tabs groupId="lang">

<TabItem value="js" label="JavaScript" default>

The Web3.Storage client's [`put` method][reference-js-put] accepts an array of [`File` objects](https://developer.mozilla.org/en-US/docs/Web/API/File).

There are a few different ways of creating `File` objects available, depending on your platform.

<Tabs>
<TabItem value="browser" label="Browser" default>

In the browser, you can use a [file input element][mdn-file-input] to allow the user to select files for upload:

<CodeSnippet lang="js" src={platformBrowserSource} region="getFiles" />

You can also manually create `File` objects using the native `File` constructor provided by the browser runtime. This is useful when you want to store data created by your application, instead of files from the user's computer.

<CodeSnippet lang="js" src={platformBrowserSource} region="makeFileObjects" />

</TabItem>
<TabItem value="node" label="Node.js">

In Node.js, the `web3.storage` package exports some helpful utility functions from the [`files-from-path` module](https://www.npmjs.com/package/files-from-path) that allow you to easily read `File` objects from the local file system. The `getFilesFromPath` helper asynchronously returns an array of `File`s that you can use directly with the `put` client method:

<CodeSnippet lang="js" src={platformNodeSource} region="getFiles" />

If you expect to be loading a lot of large files, you may be better served by the [`filesFromPath` helper](https://github.com/web3-storage/files-from-path#filesfrompath). It reduces memory pressure by `yield`ing `File` objects one by one as they're loaded from disk, instead of loading everything into memory. You can then issue multiple `put` requests to send each file to Web3.Storage.

You can also manually create `File` objects by importing a Node.js implementation of `File` from the `web3.storage` package. This is useful when you want to store data created by your application, instead of files from the user's computer.

<CodeSnippet lang="js" src={platformNodeSource} region="makeFileObjects" />

</TabItem>
</Tabs>
</TabItem>

<TabItem value="go" label="Go">

The Go client accepts standard [`os.File`](https://pkg.go.dev/os#File) pointers as returned by [`os.Open`](https://pkg.go.dev/os#Open), so there's no preparation needed for uploading single files.

```go
import "os"

func openSingleFile() {
	file, err := os.Open("path/to/my/file.jpg")
	if err != nil {
		// do something with error
	}
	// pass file into web3.storage client...
}
```

To upload a directory, you'll need to import the `w3fs` package from `github.com/web3-storage/go-w3s-client/fs` and use the [`NewDir` function](https://pkg.go.dev/github.com/web3-storage/go-w3s-client/fs#NewDir) to specify the directory contents.

```go
import (
	"io/fs"
	"os"

	"github.com/web3-storage/w3s-go-client/fs"
)

func opendir() {
	file1, err := os.Open("path/to/my/file.jpg")
	if err != nil {
		// do something with error
	}
	file2, err := os.Open("path/to/another/file.jpg")
	if err != nil {
		// do something with error
	}
	dir := w3fs.NewDir("images", []fs.File{file1, file2})

	// dir can now be passed into the client's Put method
}
```

</TabItem>

</Tabs>

<Callout>
##### Tip
**When uploading multiple files, try to give each file a unique name.** All the files in a `put` request will be bundled into one content archive, and linking to the files inside is much easier if each file has a unique, human-readable name.
</Callout>

## Uploading to Web3.Storage

Once your files are ready, uploading is a simple method call on the client object.

<Callout type="warning">
##### IMPORTANT
Deleting files from the Web3.Storage site's [Files page][site-files] will remove them from the file listing for your account, but that doesn't prevent nodes on the [decentralized storage network][concepts-decentralized-storage] from retaining copies of the data indefinitely. Do not use Web3.Storage for data that may need to be permanently deleted in the future.
</Callout>

<Tabs groupId="lang">
<TabItem value="js" label="JavaScript">

Once you have an array of `File`s, you can upload them with the client's `put` method:

<CodeSnippet lang="js" src={howtoSource} region="storeFiles" />

#### Showing progress to the user

The `put` method has some options that can be passed in to get progress on the upload as it happens in the background. There are two callback parameters you can use: `onRootCidReady`, and `onStoredChunk`.

The `onRootCidReady` callback is invoked as soon as the client has calculated the content identifier (CID) that identifies the data being uploaded. Because this calculation happens locally on the client, the callback is invoked before the upload begins.

As each chunk of data is uploaded, the `onStoredChunk` callback gets invoked with the size of the chunk in bytes passed in as a parameter.

Here's a simple example of using the callbacks to print the progress of an upload to the console:

<CodeSnippet lang="js" src={howtoSource} region="storeWithProgress" />

</TabItem>
<TabItem value="go" label="Go">

The Go client's [`Client` interface][reference-go-client-interface] defines a `Put` method that accepts a [`context.Context`](https://pkg.go.dev/context#Context) and an [`fs.File`](https://pkg.go.dev/io/fs#File), which can be either a single file or a directory.

The example below reads in an API token and the path to a file from the command line arguments, then uploads the file to Web3.Storage using the client's `Put` method.

A more in-depth example can be found [in the client's GitHub repository](https://github.com/web3-storage/go-w3s-client/blob/main/example/main.go), including uploads of multiple files and directories.

<CodeSnippet src={golangUpload} lang="go" />

</TabItem>
</Tabs>

### Directory wrapping

By default, files uploaded to Web3.Storage will be wrapped in an IPFS directory listing. This preserves the original filename and makes links more human-friendly than CID strings, which look like random gibberish.

The CID you get back from the client when uploading is the CID of the directory, not the file itself! To link to the file itself using an IPFS URI, just add the filename to the CID, separated by a `/` like this: `ipfs://<cid>/<filename>`.

To make a gateway link, use `https://<cid>.ipfs.<gateway-host>/<filename>` or `https://<gateway-host>/ipfs/<cid>/<filename>`, where `<gateway-host>` is the address of an HTTP gateway like `dweb.link`.

Once uploaded, you can [retrieve the directory][howto-retrieve] or [list the contents][howto-list-dir] without downloading it.

To avoid having your files wrapped in a directory listing, set the [`wrapWithDirectory:` option][reference-js-put] to `false` when uploading using the JavaScript client.

## Storing IPFS Content Archives

So far we've focused on using the `put` method, which accepts regular files and packs them into an IPFS Content Archive (CAR) file before uploading to Web3.Storage. If you're already using IPFS in your application, or if you want more control over the [IPLD](https://ipld.io) graph used to structure your data, you can construct your own CAR files and upload them directly.

See [Working with CAR files][howto-car-files] for more information about Content Archives, including how to create and manipulate them with code or command-line tools.

<Tabs groupId="lang">
<TabItem value="js" label="JavaScript">

Once you have a Content Archive, you can use the [`putCar` client method][reference-js-put-car] to upload it to Web3.Storage.

The `putCar` method accepts a `CarReader`, which is a type defined by the [`@ipld/car`][github-js-car] package.

You can create a `CarReader` from a `Uint8Array` using the `fromBytes` static method:

```js
import { CarReader } from '@ipld/car';

// assume loadCarData returns the contents of a CAR file as a Uint8Array
const carBytes = await loadCarData();
const reader = await CarReader.fromBytes(carBytes);

const client = makeStorageClient();
const cid = await client.putCar(reader);
console.log('Uploaded CAR file to Web3.Storage! CID:', cid);
```

See the [`putCar` reference documentation][reference-js-put-car] for more information about `putCar`, including optional parameters.

The [Working with CAR files][howto-car-files] guide has more information about the `@ipld/car` package, including how to implement the `loadCarData` function and other ways to construct a `CarReader`.

</TabItem>
<TabItem value="go" label="Go">

The Go client's `PutCar` method takes a [`context.Context`](https://pkg.go.dev/context#Context) and an [`io.Reader`](https://pkg.go.dev/context#Context), which must supply a binary stream of data in CAR format.

```go
client, err := w3s.NewClient(w3s.WithToken("<AUTH_TOKEN>"))
carfile, err := os.Open("path/to/data.car")
if err != nil {
  // ...
}

cid, err := client.PutCar(context.Background(), carfile)
```

</TabItem>
</Tabs>

## Next steps

The client returns an IPFS [content identifier (CID)][ipfs-docs-cid] that can be used to fetch your files over IPFS. Once uploaded, your data is immediately available for retrieval via IPFS and will be stored with Filecoin storage providers within 48 hours. To learn how to fetch your data using the Web3.Storage client, or directly from IPFS using a gateway or the IPFS command line, see the [how-to guide on retrieval][howto-retrieve].

You can also get more information about the status of your data. See the [query how-to guide][howto-query] to learn how to get more details about your data, including the status of any Filecoin storage deals.

[reference-js]: ../reference/js-client-library.md
[reference-js-constructor]: ../reference/js-client-library.md#constructor
[reference-js-put]: ../reference/js-client-library.md#store-files
[reference-js-put-car]: ../reference/js-client-library.md#store-car-files
[reference-go]: ../reference/go-client-library.md
[reference-go-newclient]: https://pkg.go.dev/github.com/web3-storage/go-w3s-client#NewClient
[reference-go-withtoken]: https://pkg.go.dev/github.com/web3-storage/go-w3s-client#WithToken
[reference-go-client-interface]: https://pkg.go.dev/github.com/web3-storage/go-w3s-client#Client
[reference-http]: ../reference/http-api/
[quickstart-guide]: ../intro.md#quickstart
[howto-retrieve]: ./retrieve.md
[howto-query]: ./query.md
[howto-car-files]: ./work-with-car-files.md
[howto-list-dir]: ./list-directory-contents.md
[concepts-decentralized-storage]: ../concepts/decentralized-storage.md
[site-files]: https://web3.storage/files/
[ipfs-docs-cid]: https://docs.ipfs.io/concepts/content-addressing/
[ipfs-docs-cli-quickstart]: https://docs.ipfs.io/how-to/command-line-quick-start/
[mdn-fetch]: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
[mdn-file]: https://developer.mozilla.org/en-US/docs/Web/API/File
[mdn-file-input]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file
[github-js-car]: https://github.com/ipld/js-car
