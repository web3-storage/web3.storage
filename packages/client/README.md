<h1 align="center">⁂<br/>web3.storage</h1>
<p align="center">The JavaScript API client for <a href="https://web3.storage">https://web3.storage</a></p>

## Getting started

Install the package using npm

```console
npm install web3.storage
```

## Usage

The code below shows how you create a new web3.storage api client, and use it to `put` your files to web3, and `get` them back again.

Sign in to <https://web3.storage>, create an API token, and use it in place of `API_TOKEN` when creating your instance of the client.

```js
import { Web3Storage } from 'web3.storage'

// Construct with token and endpoint
const client = new Web3Storage({ token: API_TOKEN })

const fileInput = document.querySelector('input[type="file"]')

// Pack files into a CAR and send to web3.storage
const rootCid = await client.put(fileInput.files) // Promise<CIDString>

// Get info on the Filecoin deals that the CID is stored in
const info = await client.status(rootCid) // Promise<Status | undefined>

// Fetch and verify files from web3.storage
const res = await client.get(rootCid) // Promise<Web3Response | null>
const files = await res.files() // Promise<Web3File[]>
for (const file of files) {
  console.log(`${file.cid} ${file.name} ${file.size}`)
}
```

### Mutability

Mutability in Web3.Storage is maintained through IPNS records.

⚠️ Name records are not _yet_ published to or updated from the IPFS network. Working with name records simply updates the Web3.Storage cache of data.

```js
import { Web3Storage, Name } from 'web3.storage'

const client = new Web3Storage({ token: API_TOKEN })

// const keypair = new Keypair()
// const name = await Name.from(keypair)

// Creates a new "writable" name with a new SigningKey
const name = await Name.create()
// ...also create from an existing signing key
// const name = await Name.from(bytes)

console.log('Name:', name.toString()) // k51qzi5uqu5di9agapykyjh3tqrf7i14a7fjq46oo0f6dxiimj62knq13059lt
// ...you can also create a new name from this string (non-writable):
// Name.parse('k51qzi5uqu5di9agapykyjh3tqrf7i14a7fjq46oo0f6dxiimj62knq13059lt')

// Signing key bytes
console.log('Private key:', name.key.bytes)

// The value to publish
const value = '/ipfs/bafkreiem4twkqzsq2aj4shbycd4yvoj2cx72vezicletlhi7dijjciqpui'
const revision = Name.v0(name, value)

// Publish the new revision to Web3.Storage
await Name.publish(client, revision, name.key)

const curRevision = await Name.resolve(client, name)

console.log('Resolved value:', curRevision.value) // /ipfs/bafkreiem4twkqzsq2aj4shbycd4yvoj2cx72vezicletlhi7dijjciqpui

// Create a new revision
const nextValue = '/ipfs/bafybeiauyddeo2axgargy56kwxirquxaxso3nobtjtjvoqu552oqciudrm'
const nextRevision = Name.increment(revision, nextValue)

await Name.publish(client, name, nextRevision)
```

## Testing
Run `npm test` to test the ESM code, CJS, and in the browser via `playwright-test`. 100% test coverage is required by the `hundreds` module.

To test in individual environments, you'll need two terminal windows open. In the first, start up the mock API by running `npm run mock:api`. In the second, you can then run `npm run test:web`, `npm run test:esm` or `npm run test:cjs`.

Tests are written in `mocha` and use a mock API server to assert functionality. When adding a new method to the client, add a `test/<method>.spec.js` test suite to go with it.

The mock api is built with [`smoke`](https://github.com/sinedied/smoke) _file-based mock server_. You add a files to the `test/mocks/api` directory, and the [file name](https://github.com/sinedied/smoke#file-naming) determines which API enpoint you are mocking. You can provide a `.json` for a static response, or a `.js` file to add some logic to the mock.

- `post_car.js` handles `POST /car` requests.
- `get_car#@cid.js` handes `GET /car/:cid` requests. The cid part of the path is provided to the mock as `params.cid`.

Add more mocks as required.
