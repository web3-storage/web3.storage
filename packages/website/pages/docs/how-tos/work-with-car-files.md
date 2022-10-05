---
title: Working with Content Archives
description: Learn how to work with Content Archives of IPLD data.
---

import { Tabs, TabItem } from 'components/tabs/tabs';
import Callout from 'components/callout/callout';
import CodeSnippet from 'components/codesnippet/codesnippet';
import AccordionSingle from 'components/accordionsingle/accordionsingle';
import dagCborSource from '!!raw-loader!../../../assets/code-snippets/how-to/dag-cbor.js';

# Working with Content Archives

When you upload files to web3.storage using the [client library][reference-client-library], your data is converted into a graph of data structures, which are then packed into a format called a Content Archive (CAR) before being sent to the web3.storage service.

For most use cases, you never need to know about this process, as the conversion happens behind the scenes when using the client library. However, if you're using the [HTTP API][reference-http-api], or if you want more control over the structure of the IPFS data graph, you may want to work with Content Archives directly.

This how-to guide will explain [the basics of Content Archives](#what-is-a-content-archive) and [how they're used by the web3.storage API](#car-files-and-web3-storage).

We'll also see several methods of creating and manipulating Content Archives using [command line tools](#command-line-tools) and an overview of the [libraries](#libraries-for-application-developers) you can use in your application's code.

## What is a Content Archive?

The [Content Archive format][car-spec] is a way of packaging up [content addressed data][concepts-content-addressing] into archive files that can be easily stored and transferred. You can think of them like [TAR files][wikipedia-tar] that are designed for storing collections of content addressed data.

The type of data stored in CARs is defined by [IPLD](https://ipld.io), or InterPlanetary Linked Data. IPLD is a specification and set of implementations for structured data types that can link to each other using a hash-based Content Identifier (CID). Data linked in this way forms a Directed Acyclic Graph, or DAG, and you'll likely see a few references to DAGs in the documentation for IPLD and IPFS.

IPFS files are one example of IPLD data, but IPLD can also be used to access data from Ethereum, Git, and other hash-addressed systems. You can also use IPLD as a general purpose format for your structured data, sort of like a Web3-flavored JSON. See [Advanced IPLD formats](#advanced-ipld-formats) below for more information.

## CARs and web3.storage

When the web3.storage client packs up regular files into a CAR to store on IPFS, the CAR contains data encoded in the same format used by IPFS when importing files using the command line or other IPFS APIs.

This format uses an IPLD "codec" called [`dag-pb`](https://ipld.io/docs/codecs/known/dag-pb/), which uses [Protocol Buffers](https://developers.google.com/protocol-buffers) to encode an object graph. Inside the graph are [UnixFS objects](https://docs.ipfs.io/concepts/file-systems/#unix-file-system-unixfs) that describe the files and their contents.

Although the [HTTP API][reference-http-api] also allows you to upload regular files, the client prefers to send CARs for a few reasons.

First, formatting everything on the client allows us to calculate the root Content Identifier for the data you're uploading before we send any data to the remote service. This means that you can compare the CID returned by the web3.storage service to the one you calculated locally, and you don't have to trust the service to do the right thing.

Another reason to use CARs is to support large files, which would otherwise hit size limits on the web3.storage backend platform. The data in a CAR is already chunked into small blocks, which makes CARs easy to split into small pieces that can be uploaded in batches.

## Command line tools

There are a few ways to create and interact with CAR files from the command line.

### ipfs-car

The [ipfs-car][github-ipfs-car] JavaScript package includes a command-line tool for easily creating, unpacking, and verifying CAR files.

To install it, you'll need [Node.js](https://nodejs.org) - we recommend the latest stable version.

You can install the command globally:

```bash
npm install -g ipfs-car
```

Or run the command with `npx` without installing it to your PATH:

```bash
npx ipfs-car --help
```

The `--pack` flag will create a new CAR file from a collection of input files:

```bash
ipfs-car --pack path/to/files --output path/to/write/a.car
```

Or extract files from a CAR with `--unpack`:

```bash
ipfs-car --unpack path/to/my.car --output /path/to/unpack/files/to
```

You can also list the contents of a CAR with `--list`:

```bash
ipfs-car --list path/to/my.car
```

For more usage information, run `ipfs-car --help`.

### go-ipfs

[`go-ipfs`](https://docs.ipfs.io/install/command-line/) is the reference implementation of the IPFS protocol. Among many other features, `go-ipfs` supports exporting any IPFS object graph into a CAR file and importing data from CAR files into your local IPFS repository.

The [`ipfs dag export`][ipfs-docs-dag-export] command will fetch an IPFS object graph by its Content ID (CID), writing a stream of CAR data to standard output.

To create a CAR file using go-ipfs, you can redirect the output of `ipfs dag export` to a file:

```bash
cid="bafybeigdmvh2wgmryq5ovlfu4bd3yiljokhzdep7abpe4c4lrf6rukkx4m"
ipfs dag export $cid > path/to/output.car
```

Note that you should replace the value of `cid` inside the quotes with the CID you want to export.

If you don't have the CID in your local IPFS repository, the `dag export` command will try to fetch it over the IPFS network.

To add the contents of a CAR file to your local IPFS repository, you can use `ipfs dag import`:

```bash
ipfs dag import path/to/input.car
```

## Libraries for application developers

### JavaScript

There are two JavaScript packages available for manipulating CARs inside your application.

#### ipfs-car

The `ipfs-car` package includes library functions for packing and unpacking files into CARs, using the IPFS UnixFs data model. The library includes the same functionality as the `ipfs-car` command line utility [described above](#ipfs-car).

See the [ipfs-car README](https://github.com/web3-storage/ipfs-car#api) for API documentation and usage examples.

#### @ipld/car

The [`@ipld/car` package](https://github.com/ipld/js-car) contains the main JavaScript implementation of the CAR specification and is used by `ipfs-car` under the hood. If you want to store non-file data using [advanced IPLD formats](#advanced-ipld-formats), you should use `@ipld/car` directly.

`@ipld/car` also provides the `CarReader` interface used by the web3.storage client's [`putCar` method][reference-client-putcar].

Here's a simple example of loading a CAR file from a Node.js stream and storing it with web3.storage:

```javascript
import { createReadStream } from 'fs';
import { CarReader } from '@ipld/car';

async function storeCarFile(filename) {
  const inStream = createReadStream(filename);
  const car = await CarReader.fromIterable(inStream);

  const client = makeStorageClient();
  const cid = await client.putCar(car);
  console.log('Stored CAR file! CID:', cid);
}
```

`CarReader.fromIterable` accepts any iterable of `Uint8Array` data, including Node.js streams. If you have all your CAR data in a single `Uint8Array` already, you can use [`CarReader.fromBytes`](https://github.com/ipld/js-car#CarReader__fromBytes) instead.

The `CarReader` type shown above will read the entire contents of the CAR into memory, which may cause issues with large files. On Node.js, you can use [`CarIndexedReader`](https://github.com/ipld/js-car#carindexedreader), which reads CAR data from disk directly and uses less memory than `CarReader`.

### Go

The [`go-car` module](https://github.com/ipld/go-car) provides the main Golang implementation of the CAR specification. We recommend using the `v2` module version, which supports the latest version of the CAR spec.

See the [API reference documentation](https://pkg.go.dev/github.com/ipld/go-car/v2) for more information.

## Splitting CARs for upload to web3.storage

The web3.storage [HTTP API][reference-http-api] accepts CAR uploads up to 100 MB in size, but the JavaScript client uses the HTTP API to upload files of _any_ size. The client manages to do this by splitting CARs into chunks of less than 100 MB each and uploading each chunk separately.

The main tool available for splitting and joining CARs is called `carbites`, which has implementations in JavaScript and Go. The JavaScript implementation includes a command-line version that allows you to split and join CARs from your terminal or favorite scripting language.

This section will demonstrate a few ways to split CARs in a way that's acceptable to the web3.storage service, using the command line tool, as well as programmatically using the `carbites` libraries in JavaScript and Go.

<Tabs>
<TabItem default value="carbites-cli" label="Using the carbites-cli tool">

The JavaScript [carbites library][github-carbites-js] includes a package called `carbites-cli` that can split and join CARs from the command line. You'll need a recent version of [Node.js](https://nodejs.org) installed, preferably the latest stable version.

You can install the tool globally with `npm`:

```bash with-output
npm install -g carbites-cli
```

```
added 71 packages, and audited 72 packages in 846ms
20 packages are looking for funding
  run `npm fund` for details
found 0 vulnerabilities
```

This will add a `carbites` command to your shell's environment:

```bash with-output
carbites --help
```

```
  CLI tool for splitting a single CAR into multiple CARs from the comfort of your terminal.
  Usage
    $ carbites <command>
    Commands
      split
      join
```

<Callout type="info">
##### Running with npx
  You can run the `carbites` command without installing it globally using the `npx` command, which is included with Node.js:

```bash
npx carbites-cli --help
```

The first time around, it will ask to make sure you want to install the package:

```
Need to install the following packages:
  carbites-cli
Ok to proceed? (y)
```

After that, you can use `npx carbites-cli` instead of `carbites` for any of the commands below!
</Callout>

#### Splitting CARs

The `carbites split` command takes a CAR file as input and splits it into multiple smaller CARs.

The `--size` flag sets the maximum size of the output CAR files. For uploading to web3.storage, `--size` must be less than `100MB`.

The other important flag is `--strategy`, which determines how the CAR files are split. For web3.storage uploads, we need to use the `treewalk` strategy, so that all of our CARs share the same root CID. This will allow the web3.storage service to piece them all together again once they've all been uploaded.

Here's an example, using an input car file called `my-video.car` that weighs in at 455MB:

```bash
carbites split --size 100MB --strategy treewalk my-video.car
```

This will create five new files in the same directory as the input file, named `my-video-0.car` through `my-video-4.car`. If you list their sizes, you can see that all the chunked cars are less than or equal to 100 MB:

```bash with-output
ls -lh my-video*
```

```bash
-rw-r--r--  1 user  staff   100M Sep 15 13:56 my-video-1.car
-rw-r--r--  1 user  staff   100M Sep 15 13:56 my-video-0.car
-rw-r--r--  1 user  staff   100M Sep 15 13:56 my-video-2.car
-rw-r--r--  1 user  staff   100M Sep 15 13:56 my-video-3.car
-rw-r--r--  1 user  staff    56M Sep 15 13:56 my-video-4.car
-rw-r--r--  1 user  staff   455M Sep 15 13:52 my-video.car
```

#### Joining CARs

To combine CARs that have been previously split, you can use the `carbites join` command:

```bash
carbites join my-video-*.car --output my-video-joined.car
```

</TabItem>
<TabItem value="carbites-js-lib" label="Using JavaScript code">

The [carbites library][github-carbites-js] provides an interface for splitting CARs that can be invoked from your application code.

<Callout type="info">
##### You probably don't need this!
  If you're using JavaScript, you can [use the web3.storage client][howto-store] to upload your data and let the client take care of CAR splitting for you. If you're sure you want to split CARs from JavaScript yourself, read on!
</Callout>

To split CARs from your JavaScript code, install the `carbites` package:

```bash
npm install carbites
```

And import the `TreewalkCarSplitter` class into your code:

```javascript
import { TreewalkCarSplitter } from 'carbites/treewalk';
```

You can create a `TreewalkCarSplitter` by passing in a `CarReader` and a `targetSize` in bytes for the output cars. See the section on [@ipld/car](#ipld-car) for more information on `CarReader`. For now, we'll assume that the `loadLargeCar` function returns a `CarReader`, and we'll use the `TreewalkCarSplitter` to create split CARs:

```javascript
import { TreewalkCarSplitter } from 'carbites/treewalk';
async function splitCars() {
  const largeCar = await loadLargeCar();
  const targetSize = 100000000;
  const splitter = new TreewalkCarSplitter(largeCar, targetSize);
  for await (const smallCar of splitter.cars()) {
    // Each small car is an AsyncIterable<Uint8Array> of CAR data
    for await (const chunk of smallCar) {
      // Do something with the car data...
      // For example, you could upload it to the web3.storage HTTP API
      // https://web3.storage/docs/http-api.html#operation/post-car
    }
    // You can also get the root CID of each small CAR with the getRoots method:
    const roots = await smallCar.getRoots();
    console.log('root cids', roots);
    // Since we're using TreewalkCarSpliter, all the smaller CARs should have the
    // same root CID as the large input CAR.
  }
}
```

</TabItem>
<TabItem value="go-carbites-lib" label="Using Go code">

The [go-carbites](https://github.com/alanshaw/go-carbites) module can be used to split large CARs from your Go applications.

Install the module with `go get`:

```bash
go get github.com/alanshaw/go-carbites
```

The [`carbites.Split` function](https://pkg.go.dev/github.com/alanshaw/go-carbites#Split) returns a [`carbites.Splitter`](https://pkg.go.dev/github.com/alanshaw/go-carbites#Splitter) that will make sure that the output CARs all have the same root CID, which is important when uploading to web3.storage.

```go
package main

import (
	"io"
	"os"
	"github.com/alanshaw/go-carbites"
)

func main() {
	bigCar, _ := os.Open("big.car")
	targetSize := 1024 * 1024 // 1MiB chunks
	strategy := carbites.Treewalk
	spltr, _ := carbites.Split(bigCar, targetSize, strategy)

	var i int
	for {
		car, err := spltr.Next()
		if err != nil {
			if err == io.EOF {
				break
			}
			panic(err)
		}
		b, _ := ioutil.ReadAll(car)
		ioutil.WriteFile(fmt.Sprintf("chunk-%d.car", i), b, 0644)
		i++
	}
}
```

You can also use [`NewTreewalkSplitterFromPath`](https://pkg.go.dev/github.com/alanshaw/go-carbites#NewTreewalkSplitterFromPath), which takes a local file path instead of an `io.Reader`.

</TabItem>
</Tabs>

## Advanced IPLD formats

IPLD can also be used as a general purpose data format like JSON. In fact, you can use JSON directly as IPLD just by using a special convention for linking to other IPLD objects. This convention is defined in the [`dag-json` "codec"](https://ipld.io/docs/codecs/known/dag-json/).

Here's an example of a `dag-json` object:

```json
{
  "name": "Have you seen this dog?",
  "description": "I have now...",
  "image": { "/": "bafybeihkqv2ukwgpgzkwsuz7whmvneztvxglkljbs3zosewgku2cfluvba" }
}
```

The `image` field uses the special "link type" to reference another IPLD object. The link is just a regular JSON object with a single key named `/`, whose value is a Content Identifier.

Although `dag-json` is familiar and easy to use, we recommend using the similar [`dag-cbor` codec](https://ipld.io/docs/codecs/known/dag-cbor/) instead. `dag-cbor` uses the [Concise Binary Object Representation](https://cbor.io) to more efficiently encode data, especially binary data which must be Base64-encoded when using `dag-json`.

### Examples

Below are some examples of working with `dag-cbor` data and sending it to web3.storage.

First, you'll need to import some things:

<CodeSnippet lang="js" src={dagCborSource} region="imports" />

Now we'll define a convenience function to encode an IPLD block of CBOR data and hash with SHA2-256:

<AccordionSingle heading="encodeCborBlock(value)">
  <CodeSnippet lang="js" src={dagCborSource} region="encodeCborBlock" />
</AccordionSingle>

And a function to make a CAR from a collection of blocks and a root CID:

<AccordionSingle heading="makeCar(rootCID, ipldBlocks)">
  <CodeSnippet lang="js" src={dagCborSource} region="makeCar" />
</AccordionSingle>

#### Storing simple CBOR data

Using the helpers above, you can make a CAR file with a single block of simple CBOR data and send it to web3.storage:

<AccordionSingle heading="simpleCborExample()">
  <CodeSnippet lang="js" src={dagCborSource} region="simpleCborExample" />
</AccordionSingle>

If you have the IPFS command line app installed, you can view the object you stored with the [`ipfs dag get` command][ipfs-docs-dag-get], for example:

```bash with-output
ipfs dag get bafyreidykglsfhoixmivffc5uwhcgshx4j465xwqntbmu43nb2dzqwfvae
```

```json
{
  "hello": "world"
}
```

Note that the example output has been indented with [jq](https://stedolan.github.io/jq/) for clarity.The real command will output a compact `dag-json` representation of the CBOR data without any extra whitespace.

#### CBOR with IPLD links

You can link from one CBOR object to another using CIDs:

<AccordionSingle heading="cborLinkExample()">
  <CodeSnippet lang="js" src={dagCborSource} region="cborLinkExample" />
</AccordionSingle>

As with simple objects, you can use `ipfs dag get` to show the outer object:

```bash with-output
ipfs dag get bafyreieq6bftbe3o46lrdbzj6vrvyee4njfschajxgmpxwbqex3czifhry
```

```json
{
  "contact": {
    "/": "bafyreicp2g6ez5exmw5uxsns7kkwtxr5z4vyx4xkdci6xpy2vou3zqc6me"
  },
  "description": "Just this guy, you know?",
  "title": "Galactic President"
}
```

The `contact` field above contains an IPLD link, which can be included in the `ipfs dag get` command to resolve the linked object:

```bash with-output
ipfs dag get bafyreieq6bftbe3o46lrdbzj6vrvyee4njfschajxgmpxwbqex3czifhry/contact
```

```json
{ "email": "zaphod@beeblebrox.galaxy" }
```

#### Linking from CBOR to an IPFS file

Our final example is a little more complex. We're going to store a file in the same UnixFS format that IPFS uses, and link to it from a CBOR object.

First, we'll encode a file into UnixFS format. Normally, this is done by the client library, but we want to get the CID of the file object to use for our link before we send the file off to web3.storage, so we'll construct the UnixFS object ourselves.

Here's a helper function to make a UnixFS file and encode it to an IPLD block:

<AccordionSingle heading="makeUnixFsFile(source)">
  <CodeSnippet lang="js" src={dagCborSource} region="makeUnixFsFile" />
</AccordionSingle>

The helper returns a `root` block, which we can link to by CID, as well as a `blocks` array containing the encoded file data. When we create the CAR to send to web3.storage, it's important to include all the file blocks as well as the CBOR block.

<AccordionSingle heading="cborLinkToFileExample()">
  <CodeSnippet lang="js" src={dagCborSource} region="cborLinkToFileExample" />
</AccordionSingle>

As before, we can view the root block with `ipfs dag get`:

```bash with-output
ipfs dag get bafyreid7hvce4pzcy56s4hwu7xrt3dnnzzfvilzfwsadvf6q4eqild6ndy
```

```json
{
  "description": "A CBOR object that references a UnixFS file object by CID",
  "file": {
    "/": "bafkreihmlglmfpadbk4fy72ljniveedbqicysoe5zhqqkgkuso3e6xyns4"
  }
}
```

Since the file data is plain text, you can use `ipfs dag get` to fetch its contents:

```bash with-output
ipfs dag get bafyreid7hvce4pzcy56s4hwu7xrt3dnnzzfvilzfwsadvf6q4eqild6ndy/file
```

```json
"Some plain text, encoded to UTF-8"
```

Notice that the file content is wrapped in quotes because `dag get` is interpreting the content as a JSON string.

To avoid this, or to fetch binary files, you can use `ipfs get` to download the file:

```bash with-output
ipfs get bafyreid7hvce4pzcy56s4hwu7xrt3dnnzzfvilzfwsadvf6q4eqild6ndy/file
```

```bash
Saving file(s) to file
 33 B / 33 B [===============================================================] 100.00% 0s
```

Note that the IPFS HTTP gateway currently does not support rendering CBOR data, so the root object is not directly viewable via the gateway. See the note about gateway support below for more information.

However, the gateway _can_ traverse the IPLD links inside our CBOR object, so you can link to the file by path and the gateway will resolve the linked file. For example:

[https://bafyreid7hvce4pzcy56s4hwu7xrt3dnnzzfvilzfwsadvf6q4eqild6ndy.ipfs.dweb.link/file](https://bafyreid7hvce4pzcy56s4hwu7xrt3dnnzzfvilzfwsadvf6q4eqild6ndy.ipfs.dweb.link/file).

<Callout type="warning">
##### Gateway support
Although web3.storage supports storing CAR files with `dag-cbor` content by default and can accept other codecs with the `decoders` option, the IPFS HTTP gateway does not currently "speak" these formats and will not return such data over HTTP. Please follow [this issue](https://github.com/ipfs/go-ipfs/issues/8234) to track the development of this feature.
</Callout>

### Enabling IPLD codecs in the client library

By default, the client's [`putCar` method][reference-client-putcar] will accept data encoded using the `dag-pb`, `dag-cbor`, or `raw` codecs. If you want to use another codec like `dag-json`, you must include the codec in the `decoders` option to `putCar`.

See the [`putCar` parameter reference][reference-client-putcar-params] for more details and an example that uses `dag-json`.

[concepts-content-addressing]: /docs/concepts/content-addressing/
[howto-store]: /docs/how-tos/store/
[reference-client-library]: /docs/reference/js-client-library/
[reference-client-putcar]: /docs/reference/js-client-library/#store-car-files
[reference-client-putcar-params]: /docs/reference/js-client-library/#parameters-5
[reference-http-api]: /docs/reference/http-api/
[github-ipfs-car]: https://github.com/web3-storage/ipfs-car
[github-carbites-js]: https://github.com/nftstorage/carbites
[ipfs-docs-dag-export]: https://docs.ipfs.io/reference/cli/#ipfs-dag-export
[ipfs-docs-dag-import]: https://docs.ipfs.io/reference/cli/#ipfs-dag-import
[ipfs-docs-dag-get]: https://docs.ipfs.io/reference/cli/#ipfs-dag-get
[car-spec]: https://ipld.io/specs/transport/car/
[wikipedia-tar]: https://en.wikipedia.org/wiki/Tar_(computing)
