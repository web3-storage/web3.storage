> ⚠️ **DEPRECATED** This repo will be archived on January 9, 2024 as this web3.storage API will no longer take new uploads. Please use the [new client and API](https://github.com/web3-storage/w3up/tree/main/packages/w3up-client) for future usage of web3.storage. Documentation for the new client can be found [here](https://web3.storage/docs). You can learn more about these changes [here](https://blog.web3.storage/posts/the-data-layer-is-here-with-the-new-web3-storage).

<h1 align="center"><a href="https://web3.storage"><img width="25%" src="https://user-images.githubusercontent.com/11778450/227262707-1a9674a7-9286-43e3-87b4-98b388677720.png" alt="web3.storage logo" /></a>
</h1>
<p align="center">The simple file storage service for IPFS &amp; Filecoin.</p>

## Usage

Store your files with web3.storage and retrieve them via their unique Content ID. Our tools make it simple to hash your content locally, so you can verify the service only ever stores the exact bytes you asked us to. Pick the method of using with web3.storage that works for you!


### Website

Create an account via https://web3.storage and upload right from the website using our uploader. Under the hood it uses the web3.storage client that we publish to npm to chunk and hash your files to calculate the root IPFS CID **in your browser** before sending them to https://api.web3.storage.

Once uploaded you can fetch your data from any IPFS gateway via [`https://dweb.link/ipfs/<root cid>`](https://dweb.link/ipfs/bafkreigh2akiscaildcqabsyg3dfr6chu3fgpregiymsck7e7aqa4s52zy)

Create an api token for your account and you can use any of the following alternatives to upload your data.


### JS Client

Use npm to install the [`web3.storage`](https://www.npmjs.com/package/web3.storage) module into your JS project, create an instance of the client with your api token, and use the `.put` method to upload your files in node.js or the browser.
 
**node.js**
```js
const { Web3Storage, getFilesFromPath } = require('web3.storage')
const storage = new Web3Storage({ token: process.env.WEB3_TOKEN })
const files = await getFilesFromPath(process.env.PATH_TO_ADD)
const cid = await storage.put(files)
console.log(`IPFS CID: ${cid}`)
console.log(`Gateway URL: https://dweb.link/ipfs/${cid}`)
```

See https://web3.storage/docs/#quickstart for a guide to using the js client for the first time.
  

### CLI

Our command line tool `w3` is a wrapper around the JS Client to make adding files from your terminal as simple as `w3 put ~/gifs`.

Install [`@web3-storage/w3`](https://www.npmjs.com/package/@web3-storage/w3) globally and save your api token then add your files to web3! It calculates the root CID for your files locally before sending them to web3.storage.

**shell**
```console
$ w3 token
? Paste your API token for api.web3.storage › <your api token here>
⁂ API token saved

$ w3 put ~/Pictures/ayy-lamo.jpg
⁂ Stored 1 file
⁂ https://dweb.link/ipfs/bafybeid6gpbsqkpfrsx6b6ywrt24je4xqe4eo4y2wldisl6sk7byny5uky
```

Use it anywhere you can get a shell. Get creative! For example, we use this for performance testing the [upload speed in CI](https://github.com/web3-storage/web3.storage/blob/9fafc830b841da0dd6bd5319c77febaded232240/.github/workflows/cron-test.yml#L36)!

Run `w3 --help` or have a look at https://github.com/web3-storage/web3.storage/tree/main/packages/w3#readme to find out everything it can do.


### GitHub Action 

The Action [`add_to_web3`](https://github.com/marketplace/actions/add-to-web3) wraps the `w3` CLI to let you add files to web3.storage from your GitHub Workflows.

**github-workflow.yaml**
```yaml
- run: npm run build # e.g output your static site to `./dist`

- uses: web3-storage/add-to-web3@v2
  id: web3
  with:
    web3_token: ${{ secrets.WEB3_STORAGE_TOKEN }}
    path_to_add: 'dist'

- run: echo ${{ steps.web3.outputs.cid }}
# "bafkreicysg23kiwv34eg2d7qweipxwosdo2py4ldv42nbauguluen5v6am"
- run: echo ${{ steps.web3.outputs.url }}
# "https://dweb.link/ipfs/bafkreicysg23kiwv34eg2d7qweipxwosdo2py4ldv42nbauguluen5v6am"
```

Set your api token and the `path_to_add` and watch it fly! We use `add_to_web3` to add the [web3.storage website to web3.storage](https://github.com/web3-storage/web3.storage/blob/c0227a0b927fedd324287ad6ef95db857c205939/.github/workflows/website.yml#L158-L165) from CI ∞!


### cURL

Want to try it out? You can POST a file smaller than 100MB straight to https://api.web3.storage/upload with `cURL`.

```console
curl -X POST --data-binary @file.txt -H 'Authorization: Bearer YOUR_API_KEY' https://api.web3.storage/upload  -s | jq
{
  "cid":"bafkreid65ervf7fmfnbhyr2uqiqipufowox4tgkrw4n5cxgeyls4mha3ma"
}
```

**See https://web3.storage/docs/ for our complete documentation 📖🔍**


## Building web3.storage

Want to help us improve web3.storage? Great! This project uses node v16 and npm v7. It's a monorepo that use [npm workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces) to handle resolving dependencies between the local `packages/*` folders.

You need an account on https://magic.link, and Docker running locally.

Copy the <.env.tpl> file to `.env` and set the values for the `MAGIC_SECRET_KEY` & `NEXT_PUBLIC_MAGIC`, from your magic.link account dashboard.

Install the deps with `npm`

```console
# install deps
npm install
```

Run all the things with `npm start`. Double check you have Docker running first.

```console
# start the api and website
npm start
```

If it's your first run you need to [create the database schema](./packages/db/README.md).

```console
# init the db. Run me once after `npm start`, on first set up.
npm run load-schema -w packages/db
```

## Monorepo

This project is a monorepo that uses [npm workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces).

All `npm` commands should be run from the root of the repo. To run a command for a specific package add the `--workspace` or `-w` flag

```console
# Start just the api
npm start -w packages/api
```

To add a new workspace (aka package) to the monorepo

```console
# adds the path to the `website` package to the `workspaces` property in package.json
npm init -w packages/website
```

To run an npm script in one or more workspaces

```console
# run test command in package `a` and `b`
npm run test --workspace=packages/a --workspace=packages/b
```

## Testing

Each workspace has its own suite of testing tools, which you can learn more about in the relevant `packages/*` directory. Check out highlights in each readme using the links below, then dig into the relevant `package.json` file for a full list of available scripts. 
- [Website](https://github.com/web3-storage/web3.storage/tree/main/packages/website#readme) (packages/website)
- [JavaScript API client](https://github.com/web3-storage/web3.storage/tree/main/packages/client#readme) (packages/client)
- [HTTP API client](https://github.com/web3-storage/web3.storage/tree/main/packages/api#readme) (packages/api)
- [CLI](https://github.com/web3-storage/web3.storage/tree/main/packages/w3#readme) (packages/w3)
- [Cron jobs](https://github.com/web3-storage/web3.storage/tree/main/packages/cron#readme) (packages/cron)
- [Database](https://github.com/web3-storage/web3.storage/tree/main/packages/db#readme) (packages/db)

Our docs website is currently hosted in a [separate repo](https://github.com/web3-storage/docs), but you can test it too!

## Learn more

To learn more about the web3.storage service, upload a file through our friendly UI, or find detailed documentation for the JS client library, please head over to https://web3.storage


<p align="center">
  <a href="https://web3.storage">⁂</a>
</p>
