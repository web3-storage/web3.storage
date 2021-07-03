# web3.storage client

API client for [web3.storage](https://web3.storage)

## Getting started

_This module is under developement and is not published yet._

## Usage

```js
import { Web3Storage } from 'web3.storage'

// Construct with token and endpoint
const client = new Web3Storage({ token: apiKey })

const fileInput = document.querySelector('input[type="file"]')

// Pack files into a CAR and send to web3.storage
const rootCid = await client.put(fileInput.files) // Promise<CIDString>

// Get info on the Filecoin deals that the CID is stored in
const info = await client.status(rootCid) // Promise<Metadata>

// Fetch and verify files from web3.storage
const res = await client.get(rootCid) // Promise<Web3Response>
const files = await res.files() // Promise<Web3File[]>
for (const file of files) {
  console.log(`${file.cid} ${file.name} ${file.size}`)
}
```

## Testing

Run `npm test` to test the ESM code, CJS, and in the browser via `playwright-test`. 100% test coverage is required by the `hundreds` module.

Tests are written in `mocha` and use a mock API server to assert functionality. When adding a new method to the client, add a `test/<method>.spec.js` test suite to go with it.

The mock api is built with [`smoke`](https://github.com/sinedied/smoke) _file-based mock server_. You add a files to the `test/mocks/api` directory, and the [file name](https://github.com/sinedied/smoke#file-naming) determines which API enpoint you are mocking. You can provide a `.json` for a static response, or a `.js` file to add some logic to the mock.

- `post_car.js` handles `POST /car` requests.
- `get_car#@cid.js` handes `GET /car/:cid` requests. The cid part of the path is provided to the mock as `params.cid`.

Add more mocks as required.
