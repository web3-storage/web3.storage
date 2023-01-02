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
<TabItem value='cli' label='CLI'>

To use web3.storage from the command line, you'll need the `w3` tool, which is provided by the `@web3-storage/w3cli` package.

Install the `@web3-storage/w3cli` package with `npm`:

```bash
npm install -g @web3-storage/w3cli
```

Once the install is complete, you'll have a `w3` command available. Try running `w3 --help` to get an idea of what's possible.
</TabItem>

<TabItem value='node' label='Node.js'>
Node.js projects can use the `@web3-storage/w3up-client` package to integrate with the web3.storage services.

Add the library to your project's dependencies:

```bash
npm install @web3-storage/w3up-client
```

To use the client, import and call the `create` function:

```js
import { create } from '@web3-storage/w3up-client';

const client = await create();
```

See the [client reference docs][reference-w3up-client] for more options.

</TabItem>

<TabItem value='web' label='Web'>
The simplest way to integrate web3.storage into your browser-based app is with [w3ui][w3ui-site], a collection of components that work with several popular frontend frameworks, as well as vanilla JavaScript.

In this guide, we'll use w3ui's React components, but the process is very similar for other frameworks like Solid and Vue.

To add file uploads to your React app, add the `@w3ui/react-uploader` package to your project's dependencies:

```bash
npm install @w3ui/react-uploader
```

</TabItem>

</Tabs>

### Create and register a space

When you upload things to web3.storage, each upload is associated with a "space," which is a unique identifier that acts as a namespace for your content.

Spaces are identified by [DID][concepts-did] using keys created locally on your devices. To use a space for uploads, it needs to be registered with the storage service by providing an email address.

<Tabs groupId='quickstart-env'>
<TabItem value='cli' label='CLI'>

To create a space using the `w3` command line tool, use the `w3 space create` command. You can optionally give your space a "friendly" name, which acts like an alias for the space's DID and can make it easier to tell your spaces apart. In the example below, we'll use the name `Documents`:

```bash
w3 space create Documents
```

The DID for the new space will be printed to the console. It should look something like this, although the part after `did:key` will be unique to your space:

```
did:key:z6MkixXechJLc3TWibQj9RN6AiFx8VoMY9HNB3Y97WcwK3fm
```

You can now run `w3 spaces ls` to show a list of your spaces:

```bash
* did:key:z6MkixXechJLc3TWibQj9RN6AiFx8VoMY9HNB3Y97WcwK3fm Documents
```

The `*` symbol indicates that the `Documents` space is currently active. If you make multiple spaces, you can switch between them with `w3 space use`, passing in the name or DID of the space you want to activate.

Before you can upload, you'll need to register the new space with the web3.storage service using `w3 space register`:

```bash
w3 space register you@mail-provider.net
```

This command will wait for you to check your email and click the confirmation link that was sent to your address. Once you confirm your email, you'll see a success message and are ready to upload.

</TabItem>

<TabItem value='node' label='Node.js'>
Coming soon!
</TabItem>

<TabItem value='web' label='Web'>
Coming soon!
</TabItem>
</Tabs>

### Upload a file or directory

Now that you've [created and registered a space](#create-and-register-a-space), you're ready to upload files to web3.storage!

<Tabs groupId='quickstart-env'>
<TabItem value='cli' label='CLI'>
Use the `w3 up` command to upload a file or directory:

```bash
w3 up your-file.txt
```

Once your upload is complete, you should see a URL that links to your file on the `w3s.link` IPFS gateway.

If you uploaded a single file, the link will resolve to an IPFS directory listing, with the actual file contained in the directory. This "wrapper" directory preserves the original filename of your upload, which can help organize your content and allows people to download files using their original names. If you don't want to create the wrapper directory, you can pass in the `--no-wrap` flag when running `w3 up`.

When uploading directories, files beginning with a `.` character are ignored by default. To include hidden files instead, pass in the `-H` or `--hidden` flag.

</TabItem>

<TabItem value='node' label='Node.js'>
</TabItem>

<TabItem value='web' label='Web'>
</TabItem>
</Tabs>

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

- For a deep dive into storing files, visit the [Store how-to guide.](/docs/v2/how-tos/store)
- To learn more about the details of getting files, have a look at the [Retrieve how-to guide.](/docs/v2/how-tos/retrieve)

[reference-w3up-client]: https://github.com/web3-storage/w3up-client#API
[w3ui-site]: https://beta.ui.web3.storage
[concepts-did]: /docs/v2/concepts/accounts-and-dids
