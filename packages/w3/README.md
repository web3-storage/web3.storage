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

### `w3 open <cid>`

Open a CID on https://w3s.link in your browser. You can also pass a CID and a path.

```bash
# opens a browser to https://w3s.link/ipfs/bafybeidluj5ub7okodgg5v6l4x3nytpivvcouuxgzuioa6vodg3xt2uqle
w3 open bafybeidluj5ub7okodgg5v6l4x3nytpivvcouuxgzuioa6vodg3xt2uqle

# opens a browser to https://w3s.link/ipfs/bafybeidluj5ub7okodgg5v6l4x3nytpivvcouuxgzuioa6vodg3xt2uqle/olizilla.png
w3 open bafybeidluj5ub7okodgg5v6l4x3nytpivvcouuxgzuioa6vodg3xt2uqle/olizilla.png
```

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

### `w3 name create`

**❗️Experimental** this command may not work, may change, and may be removed.

Create a new name and associated signing key that can be used to create and publish IPNS record revisions. Prints the IPNS name and stores the signing key in config.

### `w3 name list`

**❗️Experimental** this command may not work, may change, and may be removed.

List IPNS names managed by this utility.

### `w3 name publish <keyId> <value>`

Publish a name revision to Web3.Storage.

**❗️Experimental** this command may not work, may change, and may be removed.

⚠️ Name records are not _yet_ published to or updated from the IPFS network.
Working with name records simply updates the Web3.Storage cache of data.

### `w3 name resolve <keyId>`

**❗️Experimental** this command may not work, may change, and may be removed.

Resolve the current IPNS record revision for the passed name.

### `w3 name rm <keyId>`

**❗️Experimental** this command may not work, may change, and may be removed.

Remove an IPNS name managed by this utility. Note: this does NOT unpublish the IPNS name, it simply removes the IPNS name and signing key from local config.
