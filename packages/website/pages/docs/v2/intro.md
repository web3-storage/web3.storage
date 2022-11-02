---
title: Welcome
description: 'Learn how to use web3.storage to decentralize your data storage without all the complicated details.'
---

import Callout from 'components/callout/callout';
import { Tabs, TabItem } from 'components/tabs/tabs';
import CodeSnippet from 'components/codesnippet/codesnippet';
import Img from 'components/cloudflareImage';
import ImgFilesListing from '../../../public/images/docs/files-listing.png';

# Better storage.<br/>Better transfers.<br/>Better internet.

> When you need file storage for your project, website, or application, web3.storage is here for you. All it takes to [get started](#quickstart) storing on the decentralized web is a free account — no need to wrestle with complicated details.

> **TODO**: new intro with less sniping at Amazon, et al.

With web3.storage, you get all the benefits of decentralized storage technologies with the frictionless experience you expect in a modern dev workflow. **All you need to use web3.storage is an account and your data.** Under the hood, web3.storage is backed by the provable storage of [Filecoin](https://filecoin.io) and makes data accessible to your users over the public [IPFS](https://ipfs.io) network — but when it comes down to building your next application, service, or website, all you need to know is that web3.storage makes building on decentralized technologies simple.

## Quickstart

**Ready to get started using web3.storage right now?** Get up and running in minutes by following this quickstart guide. In this guide, we'll walk through the following steps:

> **TODO**: replace first two steps with UCAN registration flow (and / or account signup via web gui)

1. [Creating a web3.storage account.](#create-an-account)
1. [Getting a free API token.](#get-an-api-token)
1. [Creating and running a simple script](#create-the-upload-script) to upload a file.
1. [Getting your uploaded file](#get-your-file) using your browser or curl.

**This guide uses Node.js since it's the fastest way to get started using the web3.storage JavaScript client programmatically**, but don't worry if Node isn't your favorite runtime environment — or if you'd rather not do any coding at all. You can also use web3.storage in the following ways:

> **TODO**: Update link to JS reference docs, once new client docs have a stable URL

- Work with the API methods in the [JavaScript client library](/docs/reference/js-client-library) using the JS runtime of your choice.
- Upload and retrieve files directly from your [Account page](https://web3.storage/account/) on the web3.storage website.

<Callout type="warning">
##### PREREQUISITES

You'll need **Node version 16** or higher and **NPM version 7** or higher to complete this guide. Check your local versions like this:

```bash
node --version && npm --version
> v16.4.2
> 7.18.1
```

</Callout>

## Create an account

<Callout>
**TODO**: figure out the simplest UCAN signup flow for quickstart purposes... Some details will depend on how functional the GUI console is when we ship the docs.

- should we just use the `w3up` cli to register?
  - if so, need to include install instructions.
  - Probably not though, because (as I understand it), we're planning to remove the `export-settings` to encourage each agent to keep its own keys.
- Maybe the quickstart is a "choose your own adventure", where the branches are "use the w3up cli" and "fork this w3ui example app".
- Or, just use the `register.js` script from the `simple-upload` example. The quickstart is then basically a walkthrough of setting up and using the `simple-upload` example.

</Callout>

## Create the upload script

> **TODO**: rewrite this to use the simple-upload example.

You can use the web3.storage site to upload files, but it's also quick and easy to create and run a simple upload script — making it especially convenient to add large numbers of files. This script contains logic to upload a file to web3.storage and get a [_content identifier_ (CID)](/docs/concepts/content-addressing) back in return.

<Callout type="warning">
##### CAUTION
All data uploaded to web3.storage is available to anyone who requests it using the correct CID. Do not store any private or sensitive information in an unencrypted form using web3.storage.
</Callout>

1. Create a folder for this quickstart project, and move into that folder:

   ```bash
   mkdir web3-storage-quickstart
   cd web3-storage-quickstart
   ```

1. Create a file called `put-files.js` and paste in the following code:

   > **TODO**: new code snippet

1. Create another file called `package.json` and paste in the following code:

   > **TODO**: new package json (if needed in new quickstart example...)

1. Save both files, and then run `npm install` from your project folder:

   ```bash
   npm install
   ```

   This step may take a few moments. Once it's done, the command should output something like this:

   ```
   added 224 packages, and audited 225 packages in 14s

   40 packages are looking for funding
    run `npm fund` for details

   found 0 vulnerabilities
   ```

Your script is good to go! Next, we'll [run the script to upload a file. ↓](#run-the-script)

## Run the script

Now that you've got your script ready to go, you just need to run it in your terminal window using `node`.

> **TODO**: instructions for using the script.

Next up, we'll go over two methods for you to [retrieve your data from web3.storage ↓](#get-your-file)

## Get your file

You've already done the most difficult work in this guide — getting your files from web3.storage is simple.

1. Go to `https://w3s.link/ipfs/YOUR_CID`, replacing `YOUR_CID` with the CID you noted in the last step.
1. You should see a link to your file. If you uploaded multiple files at once, you'll see a list of all the files you uploaded.
1. Click on a file's link to view it in your browser!

### Finding your files again

If you ever need to find your files again, and you've forgotten the CID, head over to the [Files table](https://web3.storage/account/) in web3.storage:

> **TODO**: update screenshot (Assuming UI changes for v2 uploads)

<Img src={ImgFilesListing} alt="A listing of files in web3.storage" />

## Next steps

Congratulations! You've just covered the basics of web3.storage. To learn more, take a look at these useful resources:

> **TODO**: make sure all links resolve to v2 material

- Checkout some [example projects in the web3.storage GitHub repo](https://github.com/web3-storage/web3.storage/tree/main/packages/client/examples)
- For a deep dive into storing files, visit the [Store how-to guide.](/docs/how-tos/store)
- To learn more about the details of getting files, have a look at the [Retrieve how-to guide.](/docs/how-tos/retrieve)
- Visit the [reference API section](/docs/reference/js-client-library) for more details on what else you can do with the web3.storage service and how to integrate it into your own projects.
