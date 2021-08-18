<h1 align="center">⁂<br/>web3.storage</h1>
<p align="center">The CLI for web3.storage</p>

## Getting started 

Install the CLI from npm 

```console
$ npm install -g @web3-storage/w3
```

Login in and create a token on https://web3.storage and pass it to `w3 token` to save it.

```console
$ w3 token
? Paste your API token for api.web3.storage › <your token here>

⁂ API token saved
```

## Commands

### `w3 put <path>`

Upload files to web3.storage. The IPFS Content ID (CID) for your files is calculated on your machine, and sent up along with your files. web3.storage makes your content available on the IPFS network

- `--no-wrap` Don't wrap input files with a directory
- `-n, --name` Name to identify the upload
- `-H, --hidden` Include paths that start with "."
- `--no-retry` Don't try the upload again if it fails

### `w3 put-car <path>`

Upload a [CAR](https://ipld.io/specs/transport/car/carv1/) file to web3.storage.

- `-n, --name` Name to identify the upload
- `--no-retry` Don't try the upload again if it fails

### `w3 get <cid>`

Fetch files by CID. They are verified on your machine to ensure you got the eact bytes for the given CID.

- `-o, --output` The path to write the files to

### `w3 list`

List all the uploads in your account.

- `--json` Format as newline delimted JSON
- `--cid` Only print the root CID per upload

### `w3 status <cid>`

Get the Filecoin deals and IPFS pins that contain a given CID, as JSON.

### `w3 token`

Paste in a token to save a new one. Pass in `--delete` to remove a previously saved token.

- `--api` URL for the Web3 Storage API. Default: https://api.web3.storage
- `--delete` Delete a previously saved token
