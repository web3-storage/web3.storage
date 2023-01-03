---
title: JavaScript client library reference
description: Integrate web3.storage into your code using the JavaScript client library.
---

import { Tabs, TabItem } from 'components/tabs/tabs';
import Callout from 'components/callout/callout';
import CodeSnippet from 'components/codesnippet/codesnippet';
import AccordionSingle from 'components/accordionsingle/accordionsingle';
import dagJsonSource from '!!raw-loader!../../../assets/code-snippets/how-to/dag-json.js'

# JavaScript client library reference

To use the JavaScript client library for web3.storage, you must first [obtain a free API token](/docs/how-tos/generate-api-token).

The client library automatically packs your uploads into a content addressible archive (CAR) for uploading to the web3.storage service, which [stores](#store-files) data as blocks prefixed with the [_content identifier_ (CID)](/docs/concepts/content-addressing#cids-location-independent-globally-unique-keys) derived from a cryptographic hash of the data. You can then use a file's CID to [retrieve](#retrieve-files) it.

This page covers the core functionality of the JavaScript client. See the [JavaScript utility libraries page](/docs/reference/js-utilities) for some additional packages that may be useful when working with web3.storage.

<Callout type="warning">
##### Minimum requirements
While we recommend that you install the latest _stable_ version of the following software, you must have _at least_:

- [NPM](https://www.npmjs.com/) `7.0.0`
- [Node.js](https://nodejs.org/en/) `14.0.0`
- [Webpack](https://webpack.js.org/) `5.0.0`

</Callout>

## Constructor

The constructor for web3.storage is simple; all you need is your API token.

```javascript
import { Web3Storage } from 'web3.storage';

// Construct with token and endpoint
const client = new Web3Storage({ token: apiToken });
```

## Store files

Store files using the `put()` method.

### Usage

```javascript
<clientObject>.put(file[], { options })
```

### Examples

<Tabs groupId="js-lib">
<TabItem value="browser" label="Browser">
In the browser, using a file chooser to prompt the user for files to store:

```javascript
const fileInput = document.querySelector('input[type="file"]');

// Pack files into a CAR and send to web3.storage
const rootCid = await client.put(fileInput.files, {
  name: 'cat pics',
  maxRetries: 3,
});
```

</TabItem>

<TabItem value="node" label="Node.js">
In Node.js, using the `getFilesFromPath` helper to load `File` objects from a local path:

```javascript
import { getFilesFromPath } from 'web3.storage';

const files = await getFilesFromPath('./files');
const rootCid = await client.put(files);
```

</TabItem>
</Tabs>

### Return value

The method returns a string containing the CID of the uploaded CAR.

### Parameters

Method parameters are supplied in positional order.

| Number | Type        | Description                                                                                                                                         |
| ------ | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1      | `file[]`    | An iterable collection of [Files](https://developer.mozilla.org/en-US/docs/Web/API/File) to be packed into a CAR and uploaded.                      |
| 2      | `{options}` | _Optional._ An object whose properties define certain web3.storage options and metadata about the files being uploaded. See below for more details. |

An `{options}` object has the following properties that can be used as parameters when calling `put()`:

<AccordionSingle heading="name">
_String._ The `name` parameter lets you attach an arbitrary name to the uploaded content archive, which you can use to identify and organize your uploads. The name is not stored alongside the data on IPFS, but it is viewable within the file listing on the web3.storage site.

```js
const cid = await client.put(files, { name: 'cat pics' });
```

</AccordionSingle>

<AccordionSingle heading="maxRetries">
_Number._ You can specify how many times `put` should attempt to retry in case of failure by passing in a `maxRetries` option:

```js
const cid = await client.put(files, { maxRetries: 3 });
```

</AccordionSingle>

<AccordionSingle heading="wrapWithDirectory">
_Boolean._ The `wrapWithDirectory` parameter controls whether the files will be wrapped in an IPFS directory when added to web3.storage. With the default value of `true`, all files provided to the `put` method will be wrapped in an IPFS directory listing.

For example, when adding a file called `hello.txt` using the default behavior, the root CID returned by the `put` method identifies a directory containing a file named `hello.txt`, rather than the `hello.txt` file itself, which is accessible at `<rootCID>/hello.txt`.

If you are adding a directory full of files using the `put` method, you may want to override the default behavior to avoid an extra level of nesting in your IPFS path. For example, if you have a `files` directory like this:

```
files
├── hello.txt
└── stuff
    └── things.md
```

Using the default behavior, the `put` method would return a CID for a directory containing a `files` subdirectory, like this:

```
bafybeigw6rik2dlxlfx354ofycpjzljon7zagjofcb35csrsdujf3zbfca/
└── files
    ├── hello.txt
    └── stuff
        └── things.md
```

However, if you do this instead:

```javascript
const cid = await client.put(files, { wrapWithDirectory: false });
```

The _contents_ of the `files` directory will be at the top level, instead of the `files` directory itself:

```
bafybeiebez7epbidb7f6fcurnd5ukpokrpq5wkrsuakynukpxxo4y4ewvi/
├── hello.txt
└── stuff
    └── things.md
```

</AccordionSingle>

<AccordionSingle heading="onRootCidReady">
_Function._ Because the data is formatted for IPFS and Filecoin on the client, the root CID for the data is generated before the data is uploaded to web3.storage. If you want to display the CID to the user before the upload is complete, pass in an `onRootCidReady` function that accepts a CID string:

```js
const onRootCidReady = rootCid => console.log('root cid:', rootCid);
const cid = await client.put(files, { onRootCidReady });
```

</AccordionSingle>

<AccordionSingle heading="onStoredChunk">
_Function._ You can also display progress updates by passing in an `onStoredChunk` callback. This is called after each chunk of data is uploaded, with the size of the chunk in bytes passed in as a parameter:

```js
const onStoredChunk = chunkSize => console.log(`stored chunk of ${chunkSize} bytes`);
const cid = await client.put(files, { onStoredChunk });
```

</AccordionSingle>

## Retrieve files

Retrieve files using the `get()` method. You will need the CID you obtained at upload time that references the CAR for your uploaded files.

### Usage

```javascript
<clientObject>.get(<CID>)
```

### Example

```javascript
const res = await client.get(rootCid); // Web3Response
const files = await res.files(); // Web3File[]
for (const file of files) {
  console.log(`${file.cid} ${file.name} ${file.size}`);
}
```

### Return value

Returns `undefined` if there are no matches for the given CID.

If found, the method returns a `Web3Response` object, which extends the [Fetch API response object](https://developer.mozilla.org/en-US/docs/Web/API/Response) to add two iterator methods unique to the web3.storage client library: `files()` and `unixFsIterator()`.

<Tabs groupId="return">
<TabItem value="file" label="Using File objects">
Calling the `files()` method returns your requested files as an `Array<Web3File>` object, which is an iterable collection of `Web3File` objects. Each object represents a file that was uploaded in the CAR with the supplied CID.

The `Web3File` type extends [the generic JavaScript `File` type](https://developer.mozilla.org/en-US/docs/Web/API/File), adding a `string` property for the CID of the given file named `cid`, as shown in the example below. This is different from the CID of the CAR that contains the file, which you specified when calling `get()`.
</TabItem>
<TabItem value="file-unix" label="Using UnixFS objects">
In addition to the `files()` method, you can also use the `unixFsIterator()` method. This returns your requested files as a `AsyncIterable<UnixFS>` object, which is an iterable collection of [`UnixFS`](https://github.com/ipfs/js-ipfs-unixfs/blob/master/packages/ipfs-unixfs/README.md) objects. Each object represents a file that was uploaded in the CAR with the supplied CID.

Using `unixFS` is helpful in cases where you expect large responses or responses containing many files, since it does not buffer all files in memory before returning. Instead, the returned async iterator `yield`s an object for each entry.

```js
const res = await client.get(cid);
for await (const entry of res.unixFsIterator()) {
  console.log(`got unixfs of type ${entry.type}. cid: ${entry.cid} path: ${entry.path}`);
  // entry.content() returns another async iterator for the chunked file contents
  for await (const chunk of entry.content()) {
    console.log(`got a chunk of ${chunk.size} bytes of data`);
  }
}
```

Note that not all `UnixFS` entries returned by the iterator represent files. If `entry.type == 'directory'`, the entry represents a directory and contains no data itself; it just links to other entries.

For more details on `UnixFS` objects, see [the README file in the `UnixFS` GitHub repository](https://github.com/ipfs/js-ipfs-unixfs/blob/master/packages/ipfs-unixfs/README.md).
</TabItem>
</Tabs>

### Parameters

Parameters are supplied in positional order.

| Number | Type     | Description                                             |
| ------ | -------- | ------------------------------------------------------- |
| 1      | `string` | A string containing the CID of the CAR to be retrieved. |

## Check status

Retrieve metadata about your file by using the `status()` method and supplying the CID of the file you are interested in. This metadata includes the creation date and file size, as well as details about how the network is storing your data. Using this information, you can identify peers on the [IPFS (InterPlanetary File System)](https://ipfs.io) network that are pinning the data, and [Filecoin](https://filecoin.io) storage providers that have accepted deals to store the data.

### Usage

```javascript
<clientObject>.status(<CID>)
```

### Examples

<Tabs groupId="examples">
<TabItem value="call" label="Call">

Here's an example of a call to the `status()` method:

```javascript
const info = await client.status(rootCid);
console.log(`${info.cid} ${info.dagSize} ${info.created}`);
```

</TabItem>
<TabItem value="response" label="Response">
Here's an example response from the `status()` method:

```json
{
  "ok": true,
  "value": {
    "cid": "bafkreidivzimqfqtoqxkrpge6bjyhlvxqs3rhe73owtmdulaxr5do5in7u",
    "size": 132614,
    "created": "2021-03-12T17:03:07.787Z",
    "type": "image/jpeg",
    "scope": "default",
    "pin": {
      "cid": "bafkreidivzimqfqtoqxkrpge6bjyhlvxqs3rhe73owtmdulaxr5do5in7u",
      "name": "pin name",
      "meta": {},
      "status": "queued",
      "created": "2021-03-12T17:03:07.787Z",
      "size": 132614
    },
    "files": [
      {
        "name": "logo.jpg",
        "type": "image/jpeg"
      }
    ],
    "deals": [
      {
        "batchRootCid": "bafkreidivzimqfqtoqxkrpge6bjyhlvxqs3rhe73owtmdulaxr5do5in7u",
        "lastChange": "2021-03-18T11:46:50.000Z",
        "miner": "f05678",
        "network": "nerpanet",
        "pieceCid": "bafkreidivzimqfqtoqxkrpge6bjyhlvxqs3rhe73owtmdulaxr5do5in7u",
        "status": "queued",
        "statusText": "miner rejected my data",
        "chainDealID": 138,
        "dealActivation": "2021-03-18T11:46:50.000Z",
        "dealExpiration": "2021-03-18T11:46:50.000Z"
      }
    ]
  }
}
```

</TabItem>
</Tabs>

### Parameters

Parameters are supplied in positional order.

| Number | Type     | Description                             |
| ------ | -------- | --------------------------------------- |
| 1      | `string` | A string containing the CID of the CAR. |

### Return value

Returns `undefined` if there are no matches for the given CID.

If found, the `status()` method returns a `{Status}` object that contains the metadata for your object's storage deal on the web3.storage network, with the following properties:

<AccordionSingle heading="cid">
_String._ The `cid` property is the content identifier of the data for which you are retrieving status information.
</AccordionSingle>

<AccordionSingle heading="dagSize">
_Number._ The `dagSize` property is the total size, in bytes, of the [Merkle Directed Acyclic Graph (DAG)](https://docs.ipfs.io/concepts/merkle-dag/) containing the queried CID.
</AccordionSingle>

<AccordionSingle heading="created">
_String._ The `created` property gives the creation date in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.

<Callout type="info">
##### Tip
The `created` date returned by a call to `status()` is the date and time that the CID was first seen on the network. The date given by a call to `list()` is the date and time of a particular upload via a call to `put()`. These can differ if multiple users upload the same file(s).
</Callout>

</AccordionSingle>

<AccordionSingle heading="pins">
_Array._ The `pins` property is an array of `Pin` objects. Each `Pin` object represents a specific [peer in the IPFS network,](https://docs.libp2p.io/concepts/peer-id/) with the following structure:

```json
Pin {
  peerId: string, // Libp2p peer ID of the node pinning the data.
  peerName: string, // Human readable name for the peer pinning the data.
  region: string, // Approximate geographical region of the node pinning the data.
  status: string, // Can be one of: 'Pinned' | 'Pinning' | 'PinQueued'
  updated: string // Updated date in ISO 8601 format.
}
```

</AccordionSingle>

<AccordionSingle heading="deals">
_Array._ The `deals` property is an array of `Deal` objects. Each `Deal` object represents a specific [storage deal on the Filecoin network,](https://docs.filecoin.io/about-filecoin/how-filecoin-works/#deals) for a specific [Piece](https://spec.filecoin.io/systems/filecoin_files/piece/) of data, with the following structure:

```json
Deal {
  dealId: number, // On-chain ID of the deal.
  storageProvider: string, // Address of the storage provider storing this data.
  status: string, // Can be one of: 'Queued' | 'Published' | 'Active'
  pieceCid: string, // Piece CID of the data in the deal.
  dataCid: string, // CID of the data aggregated in this deal.
  dataModelSelector: string, // Selector for extracting data from the aggregated root.
  activation: string, // Date when the deal will become active, in ISO 8601 format.
  created: string, // Creation date, in ISO 8601 format.
  updated: string // Updated date, in ISO 8601 format.
}
```

</AccordionSingle>

## List uploads

List previous uploads with the `list()` method.

### Usage

```javascript
<clientObject>.list({before, maxResults})
```

### Example

The following example stores return values from a call to `list()` into a JavaScript array:

```javascript
// Return the names of 10 uploads
const uploadNames = [];
for await (const item of client.list({ maxResults: 10 })) {
  uploadNames.push(item.name);
}
```

### Parameters

The `list()` method accepts an `{options}` object with the following properties:

<AccordionSingle heading="before">
_String_. Specifies a date, in ISO 8601 format. Ensures that the call to `list()` will not return any results newer than the given date.
</AccordionSingle>

<AccordionSingle heading="maxResults">
_Number_. Specifies the maximum number of uploads to return when calling `list()`.
</AccordionSingle>

### Return value

The return value for `list()` is an `AsyncIterable` object, containing objects whose data structure is the same as the return value for `status()` but with one extra propery: a string field called `name` that corresponds to the value given passed to the `name` parameter in the original call to `put()`. This means that iterating through results from your call to `list()` yields objects with the below example structure.

```json
{
  "name": "cat pics",
  "cid": "bafkreifzjut3te2nhyekklss27nh3k72ysco7y32koao5eei66wof36n5e",
  "created": "2021-07-14T19:27:14.934572Z",
  "dagSize": 101,
  "pins": [
    {
      "peerId": "12D3KooWR1Js",
      "peerName": "peerName",
      "region": "peerRegion",
      "status": "Pinned"
    }
  ],
  "deals": [
    {
      "dealId": 12345,
      "storageProvider": "f099",
      "status": "Active",
      "pieceCid": "bafkreifzjut3te2nhyekklss27nh3k72ysco7y32koao5eei66wof36n5e",
      "dataCid": "bafkreifzjut3te2nhyekklss27nh3k72ysco7y32koao5eei66wof36n5e",
      "dataModelSelector": "Links/0/Links",
      "activation": "2021-07-14T19:27:14.934572Z",
      "created": "2021-07-14T19:27:14.934572Z",
      "updated": "2021-07-14T19:27:14.934572Z"
    }
  ]
}
```

<Callout type="info">
##### Tip
The `created` date on these objects are the date and time that the user uploaded via `put()`. The `created` date given by a call to `status()` is the date and time that the CID was first seen on the network. These can differ if multiple users uploaded the same file(s).
</Callout>

## Store CAR files

Store [a CAR file](https://github.com/ipld/js-car) using the `putCar()` method.

### Usage

```javascript
<clientObject>.putCar(car, { options })
```

### Examples

```javascript
import fs from 'fs';
import { Readable } from 'stream';
import { CarReader, CarWriter } from '@ipld/car';
import * as raw from 'multiformats/codecs/raw';
import { CID } from 'multiformats/cid';
import { sha256 } from 'multiformats/hashes/sha2';

async function getCar() {
  const bytes = new TextEncoder().encode('random meaningless bytes');
  const hash = await sha256.digest(raw.encode(bytes));
  const cid = CID.create(1, raw.code, hash);
  // create the writer and set the header with a single root
  const { writer, out } = await CarWriter.create([cid]);
  Readable.from(out).pipe(fs.createWriteStream('example.car'));
  // store a new block, creates a new file entry in the CAR archive
  await writer.put({ cid, bytes });
  await writer.close();
  const inStream = fs.createReadStream('example.car');
  // read and parse the entire stream in one go, this will cache the contents of
  // the car in memory so is not suitable for large files.
  const reader = await CarReader.fromIterable(inStream);
  return reader;
}

const car = await getCar();
const cid = await client.putCar(car);
```

### Return value

The method returns a string containing the CID of the uploaded CAR.

### Parameters

Method parameters are supplied in positional order.

| Number | Type        | Description                                                                                                                                         |
| ------ | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1      | `car`       | The CAR file to be uploaded.                                                                                                                        |
| 2      | `{options}` | _Optional._ An object whose properties define certain web3.storage options and metadata about the files being uploaded. See below for more details. |

An `{options}` object has the following properties that can be used as parameters when calling `putCar()`:

<AccordionSingle heading="name">
_String._ The `name` parameter lets you attach an arbitrary name to the uploaded content archive, which you can use to identify and organize your uploads. The name is not stored alongside the data on IPFS, but it is viewable within the file listing on the web3.storage site.

```js
const cid = await client.putCar(files, { name: 'cat pics' });
```

</AccordionSingle>

<AccordionSingle heading="maxRetries">
_Number._ You can specify how many times `putCar` should attempt to retry in case of failure by passing in a `maxRetries` option. The default value is `5`.

```js
const cid = await client.putCar(files, { maxRetries: 3 });
```

</AccordionSingle>

<AccordionSingle heading="onStoredChunk">
_Function._ You can also display progress updates by passing in an `onStoredChunk` callback. This is called after each chunk of data is uploaded, with the size of the chunk in bytes passed in as a parameter. By default, data is split into chunks of around 10MB.

```js
const onStoredChunk = chunkSize => console.log(`stored chunk of ${chunkSize} bytes`);
const cid = await client.putCar(car, { onStoredChunk });
```

</AccordionSingle>

<AccordionSingle heading="decoders">
[_BlockDecoder_](https://github.com/multiformats/js-multiformats#ipld-codecs-multicodec). Used to specify additional IPLD block decoders which interpret the data in the CAR file  and split it into multiple chunks. Note these are only required if the CAR file was not encoded using the default encoders: `dag-pb`, `dag-cbor` and `raw`.

<CodeSnippet src={dagJsonSource} lang="js" />

</AccordionSingle>
