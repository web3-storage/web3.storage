# web3.storage client

API client for web3.storage

## Getting started

_This module is under developement and is not published yet._

## Usage

```js
import { WebStorage } from 'web3.storage'

// Construct with token and endpoint
const client = new WebStorage({ token: apiKey })

// Pack files into a CAR
client.pack(files: Iterable<File>): Promise<{car: Blob, root: CIDString}>

// Store a CAR
client.store(car: Blob): Promise<CIDString>

// Send the files, packing them into a CAR under the hood
client.packAndStore(files: Iterable<File>): Promise<CIDString>

// Get info on the Filecoin deals that the CID is stored in
client.status(cid: string): Promise<Metadata>

// Fetch a CAR over http
client.get(cid: string): Promise<Blob | null>

// Unpack and verify a CAR
client.unpack(car: Blob): AsyncIterable<?>

// Fetch, verify and unpack the CID to files
client.getAndUnpack(cid: string): AsyncIterable<?>
```

## Testing

Run `npm test` to test the ESM code, CJS, and in the browser via `playwright-test`. 100% test coverage is required by the `hundreds` module.

Tests are written in `mocha` and use a mock API server to assert functionality. When adding a new method to the client, add a `test/<method>.spec.js` test suite to go with it.

The mock api is built with [`smoke`](https://github.com/sinedied/smoke) _file-based mock server_. You add a files to the `test/mocks/api` directory, and the [file name](https://github.com/sinedied/smoke#file-naming) determines which API enpoint you are mocking. You can provide a `.json` for a static response, or a `.js` file to add some logic to the mock.

- `post_car.js` handles `POST /car` requests.
- `get_car#@cid.js` handes `GET /car/:cid` requests. The cid part of the path is provided to the mock as `params.cid`.

Add more mocks as required.
