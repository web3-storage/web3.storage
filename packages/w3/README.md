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

### `w3 get <cid>`

Fetch files by CID. They are verified on your machine to ensure you got the eact bytes for the given CID.

### `w3 token`

Paste in a token to save a new one. Pass in `--delete` to remove an previously saved token.