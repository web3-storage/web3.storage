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

**❗️Experimental** this API may not work, may change, and may be removed in a future version.

Mutability in Web3.Storage is maintained through IPNS records.

⚠️ Name records are not _yet_ published to or updated from the IPFS network. Working with name records simply updates the Web3.Storage cache of data.

#### Create and Publish

```js
import { Web3Storage } from 'web3.storage'
import * as Name from 'web3.storage/name'

const client = new Web3Storage({ token: API_TOKEN })
const name = await Name.create()

console.log('Name:', name.toString())
// e.g. k51qzi5uqu5di9agapykyjh3tqrf7i14a7fjq46oo0f6dxiimj62knq13059lt

// The value to publish
const value = '/ipfs/bafkreiem4twkqzsq2aj4shbycd4yvoj2cx72vezicletlhi7dijjciqpui'
const revision = await Name.v0(name, value)

await Name.publish(client, revision, name.key)
```

⚠️ Note: revisions live for 1 year after creation by default.

#### Resolve

```js
import { Web3Storage } from 'web3.storage'
import * as Name from 'web3.storage/name'

const client = new Web3Storage({ token: API_TOKEN })
const name = Name.parse('k51qzi5uqu5di9agapykyjh3tqrf7i14a7fjq46oo0f6dxiimj62knq13059lt')

const revision = await Name.resolve(client, name)

console.log('Resolved value:', revision.value)
// e.g. /ipfs/bafkreiem4twkqzsq2aj4shbycd4yvoj2cx72vezicletlhi7dijjciqpui
```

#### Update

Updating records involves creating a new _revision_ from the previous one.

```js
import { Web3Storage } from 'web3.storage'
import * as Name from 'web3.storage/name'

const client = new Web3Storage({ token: API_TOKEN })
const name = await Name.create()

const value = '/ipfs/bafkreiem4twkqzsq2aj4shbycd4yvoj2cx72vezicletlhi7dijjciqpui'
const revision = await Name.v0(name, value)

await Name.publish(client, revision, name.key)

// ...later

const nextValue = '/ipfs/bafybeiauyddeo2axgargy56kwxirquxaxso3nobtjtjvoqu552oqciudrm'
// Make a revision to the current record (increments sequence number and sets value)
const nextRevision = await Name.increment(revision, nextValue)

await Name.publish(client, nextRevision, name.key)
```

#### Signing Key Management

The private key used to sign IPNS records should be saved if a revision needs to be created in the future.

```js
import * as Name from 'web3.storage/name'
import fs from 'fs'

// Creates a new "writable" name with a new signing key
const name = await Name.create()

// Store the signing key to a file for use later
await fs.promises.writeFile('priv.key', name.key.bytes)

// ...later

const bytes = await fs.promises.readFile('priv.key')
const name = await Name.from(bytes)

console.log('Name:', name.toString())
// e.g. k51qzi5uqu5di9agapykyjh3tqrf7i14a7fjq46oo0f6dxiimj62knq13059lt
```

#### Revision Serialization/Deserialization

The current revision for a name may need to be serialized to be stored on disk or transmitted and then deserialized later. Note that revisions are _not_ IPNS records - they carry similar data, but are not signed.

```js
import * as Name from 'web3.storage/name'
import fs from 'fs'

const { Revision } = Name
const name = await Name.create()
const value = '/ipfs/bafkreiem4twkqzsq2aj4shbycd4yvoj2cx72vezicletlhi7dijjciqpui'
const revision = await Name.v0(name, value)

// Store the record to a file for use later
// Note: Revision.encode does NOT encode signing key data
await fs.promises.writeFile('ipns.revision', Revision.encode(rev))

// ...later

const bytes = await fs.promises.readFile('ipns.revision')
const revision = Revision.decode(bytes)
```

## Testing
Run `npm test` to test the ESM code, CJS, and in the browser via `playwright-test`. 100% test coverage is required by the `hundreds` module.

To test in individual environments, you'll need two terminal windows open. In the first, start up the mock API by running `npm run mock:api`. In the second, you can then run `npm run test:web`, `npm run test:esm` or `npm run test:cjs`.

Tests are written in `mocha` and use a mock API server to assert functionality. When adding a new method to the client, add a `test/<method>.spec.js` test suite to go with it.

The mock api is built with [`smoke`](https://github.com/sinedied/smoke) _file-based mock server_. You add a files to the `test/mocks/api` directory, and the [file name](https://github.com/sinedied/smoke#file-naming) determines which API enpoint you are mocking. You can provide a `.json` for a static response, or a `.js` file to add some logic to the mock.

- `post_car.js` handles `POST /car` requests.
- `get_car#@cid.js` handes `GET /car/:cid` requests. The cid part of the path is provided to the mock as `params.cid`.

Add more mocks as required.
