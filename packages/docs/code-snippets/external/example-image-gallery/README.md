# Web3.Storage example-image-gallery

This is an example of using [Web3.Storage](https://web3.storage) to create a simple image gallery that can be shared with your friends using decentralized web tech like [IPFS](https://ipfs.io) and [Filecoin](https://filecoin.io).

## Usage

Clone this repository and enter the new directory:

```shell
git clone https://github.com/web3-storage/example-image-gallery
cd example-image-gallery
```

Install dependencies:

```shell
npm install
```

Run the dev server:

```shell
npm run dev
```

Open http://localhost:3000 in your browser.

On the first run, you'll be redirected to http://localhost:3000/settings.html to paste in an API token. If you don't have a token yet, see the [Quickstart guide](https://docs.web3.storage/) to learn how to get one.
The token is saved to your browser's local storage, so you should only need to do this once.

### Building for production

The commands above will run a development server that supports fancy features like hot-reloading when you change the code. This is provided by [Vite.js](https://vitejs.dev), which also bundles up the site for a production deployment.

If you want to deploy the site somewhere, you can run

```shell
npm run build
```

This will create a `dist` folder with the compiled site. It will look something like this:

```
dist
├── assets
│   ├── favicon.17e50649.svg
│   ├── gallery.c6431f3b.js
│   ├── main.af36d20e.js
│   ├── main.b06b9f34.js
│   ├── main.b26a67ee.css
│   ├── settings.ad3ba2b6.js
│   └── vendor.061fb27f.js
├── gallery.html
├── index.html
└── settings.html
```

The contents of the `dist` folder can be copied to any static web host, or even published to IPFS and Filecoin using Web3.Storage.

To view the compiled site on your local computer, you'll need to run a basic web server - just opening the `.html` files in your browser won't work, since it will block the request to load the javascript files thanks to CORS policies.

You can run a simple static HTTP server to preview the build output by running:

```shell
npm run serve
```

You should see something like this:

```
> example-image-gallery@0.0.0 serve
> vite preview


  vite v2.4.3 build preview server running at:

  > Local: http://localhost:5000/
  > Network: use `--host` to expose
```

Opening http://localhost:5000 should then take you to the site.

### Deploying to Web3.Storage

You can upload the compiled site directly to Web3.Storage by running:

```shell
export WEB3STORAGE_TOKEN="your-API-token"
npm run deploy
```

You'll need to replace `your-API-token` with an API token from Web3.Storage.

The [deploy script](./scripts/deploy.js) will output something similar to this:

```
Loading site files...
Uploading 10 files to Web3.Storage...
Deployed to Web3.Storage!
Root cid:  bafybeifl6l3b4s7hpdm4d32vkh3gwi3cuta7owap3gooxfbrqhp7olx6m4
Gateway url: https://bafybeifl6l3b4s7hpdm4d32vkh3gwi3cuta7owap3gooxfbrqhp7olx6m4.ipfs.dweb.link
```

## Code Overview

This example project is written in "vanilla" JavaScript, HTML and CSS, so there's no UI framework like React or Vue in the mix, just good old `document.getElementById` and friends.

The JavaScript code uses features from the ES2018 language standard, which is supported by all modern browsers (Internet Explorer [officially doesn't count](https://techcommunity.microsoft.com/t5/windows-it-pro-blog/internet-explorer-11-desktop-app-retirement-faq/ba-p/2366549)).

There are three HTML pages inside the `src` directory:

- `index.html` has the image upload UI
- `gallery.html` has a carousel that displays your uploaded images
- `settings.html` has a box to paste your API token into (or delete it)

Each page has a corresponding JavaScript file that it imports a [JavaScript module](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules). 
For example, `src/gallery.html` imports `src/js/gallery.js`.

There are also some helpers for DOM manipulation and other common needs in `src/js/helpers.js`, and the code for interacting with Web3.Storage in `src/js/storage.js`. Each page imports some code from these common files.

### Web3.Storage interactions

The code that's specific to Web3.Storage lives in [`src/js/storage.js](./src/js/storage.js).

#### Uploading images

Images are uploaded in the `storeImage` function, which takes a [File](https://developer.mozilla.org/en-US/docs/Web/API/File) object and some caption text as input.

The `storeImage` function actually stores two files - we also create a small `metadata.json` file that includes the caption text and the original filename. Both files are bundled up by Web3.Storage into one IPFS directory listing.

#### Listing images for the gallery view

The `listImageMetadata` function returns an [async iterator](https://2ality.com/2016/10/asynchronous-iteration.html) that will `yield` metadata about our stored images. This includes the caption we stored, as well as the IPFS Content ID and an IPFS gateway URL to the image.

`listImageMetadata` uses the [`list` Web3.Storage client method](https://docs.web3.storage/reference/client-library/#list-uploads) to get metadata about all files stored using Web3.Storage and selects the ones we're interested in by checking their `name` field for a special string prefix (added in the `storeImage` method when uploading). Once it has the root CID for each upload, `listImageMetadata` will fetch the stored `metadata.json` and `yield` a metadata object to the calling function.

