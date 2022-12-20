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

With web3.storage, you get all the benefits of decentralized storage technologies with the frictionless experience you expect in a modern dev workflow. **All you need to use web3.storage is an account and your data.** Under the hood, web3.storage is backed by the provable storage of [Filecoin](https://filecoin.io) and makes data accessible to your users over the public [IPFS](https://ipfs.io) network — but when it comes down to building your next application, service, or website, all you need to know is that web3.storage makes building on decentralized technologies simple.

## Quickstart

**Ready to get started using web3.storage right now?** Get up and running in minutes by following this quickstart guide.

In this guide, we'll walk through the following steps:

1. [Install the web3.storage tools](#installation) for your project or environment.
1. [Create and register your first space](#create-and-register-a-space).
1. [Upload a file or directory](#upload-a-file-or-directory).
1. [View your file with IPFS](#view-your-files).

<Callout type="warning">
##### PREREQUISITES

You'll need **Node version 16** or higher and **NPM version 7** or higher to complete this guide. Check your local versions like this:

```bash
node --version && npm --version
> v16.4.2
> 7.18.1
```

</Callout>

### Installation

<Tabs groupId='quickstart-env'>
<TabItem value='cli' label="Command line (w3cli)">

Install the `@web3-storage/w3cli` package with `npm`:

```bash
npm install -g @web3-storage/w3cli
```

Once the install is complete, you'll have a `w3` command available. Try running `w3 help` to get an idea of what's possible.
</TabItem>

<TabItem value='node' label='Node.js (w3up-client)'>
Coming soon!
</TabItem>

<TabItem value='browser' label='Browser JavaScript (w3ui)'>
Coming soon!
</TabItem>

</Tabs>

### Create and register a space

<Tabs groupId='quickstart-env'>
<TabItem value='cli' label='Command line (w3cli)'>
Yo
</TabItem>

<TabItem value='node' label='Node.js (w3up-client)'>
Coming soon!
</TabItem>

<TabItem value='browser' label='Browser JavaScript (w3ui)'>
Coming soon!
</TabItem>
</Tabs>

### Upload a file or directory

### View your files

You've already done the most difficult work in this guide — getting your files from web3.storage is simple.

1. Go to `https://w3s.link/ipfs/YOUR_CID`, replacing `YOUR_CID` with the CID you noted in the last step.
1. You should see a link to your file. If you uploaded multiple files at once, you'll see a list of all the files you uploaded.
1. Click on a file's link to view it in your browser!

### Finding your files again

If you ever need to find your files again, and you've forgotten the CID, head over to the [Files table](https://web3.storage/account/) in web3.storage:

{/_ **TODO**: update screenshot (Assuming UI changes for v2 uploads) _/}

<Img src={ImgFilesListing} alt="A listing of files in web3.storage" />

## Next steps

Congratulations! You've just covered the basics of web3.storage. To learn more, take a look at these useful resources:

> **TODO**: make sure all links resolve to v2 material

- Checkout some [example projects in the web3.storage GitHub repo](https://github.com/web3-storage/web3.storage/tree/main/packages/client/examples)
- For a deep dive into storing files, visit the [Store how-to guide.](/docs/how-tos/store)
- To learn more about the details of getting files, have a look at the [Retrieve how-to guide.](/docs/how-tos/retrieve)
- Visit the [reference API section](/docs/reference/js-client-library) for more details on what else you can do with the web3.storage service and how to integrate it into your own projects.
