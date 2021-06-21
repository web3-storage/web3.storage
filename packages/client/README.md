# filecoin.storage client

API client for filecoin.storage

## Usage

```js
import FilecoinStorage from 'filecoin.storage'

// Construct with token and endpoint
const client = new FilecoinStorage({ token: apiKey })

// Pack files into a CAR
client.pack(files: Iterable<File>): Promise<{car: Blob, root: CIDString}>

// Store a CAR
client.store(car: Blob): Promise<CIDString>

// Send the files, packing them into a CAR under the hood
client.packAndStore(files: Iterable<File>): Promise<CIDString>

// Get info on the Filecoin deals that the CID is stored in
client.status(cid: string): Promise<Metadata>

// Fetch a CAR over http
client.get(cid: string): Promise<Blob>

// Unpack and verify a CAR
client.unpack(car: Blob): AsyncIterable<?>

// Fetch, verify and unpack the CID to files
client.getAndUnpack(cid: string): AsyncIterable<?>
```
