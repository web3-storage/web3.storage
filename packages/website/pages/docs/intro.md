---
title: Welcome
description: 'Learn how to use web3.storage to decentralize your data storage without all the complicated details.'
---

import Callout from 'components/callout/callout';
import { Tabs, TabItem } from 'components/tabs/tabs';
import CodeSnippet from 'components/codesnippet/codesnippet';
import PutFiles from '!!raw-loader!../../assets/code-snippets/quickstart/put-files.js';
import PackageJson from '!!raw-loader!../../assets/code-snippets/quickstart/package.json.txt';
import Img from 'components/cloudflareImage';
import ImgFilesListing from '../../public/images/docs/files-listing.png';

# Better storage.<br/>Better transfers.<br/>Better internet.

> When you need file storage for your project, website, or application, web3.storage is here for you. All it takes to [get started](#quickstart) storing on the decentralized web is a free API token — no need to wrestle with complicated details.

**In the past, storing data on the decentralized web wasn't always easy — but that's where web3.storage comes in.** Most data on the internet today is hosted by massive storage providers like Amazon, Google, and Microsoft. This makes it simpler for developers to store application data, but big corporate platforms like these create silos by locking developers and users alike into walled gardens of services. What's more, as the market continues to consolidate, a small oligopoly of providers are essentially becoming the storage backbone of the internet.

One solution to this problem is using _decentralized storage_ instead of big, corporate platforms to store data for apps and services. However, decentralized storage can be difficult to manage and add extra time and effort to an already crowded developer workflow — for example, most decentralized storage services need you to compile your data into a specific format, find a storage provider to host your data, buy some cryptocurrency to pay the storage provider, and then send your data across the internet. **This is where web3.storage comes in.**

With web3.storage, you get all the benefits of decentralized storage technologies with the frictionless experience you expect in a modern dev workflow. **All you need to use web3.storage is an API token and your data.** Under the hood, web3.storage is backed by the provable storage of [Filecoin](https://filecoin.io) and makes data accessible to your users over the public [IPFS](https://ipfs.io) network — but when it comes down to building your next application, service, or website, all you need to know is that web3.storage makes building on decentralized technologies simple.

## Quickstart

**Ready to get started using web3.storage right now?** Get up and running in minutes by following this quickstart guide. In this guide, we'll walk through the following steps:

1. [Creating a web3.storage account.](#create-an-account)
1. [Getting a free API token.](#get-an-api-token)
1. [Creating and running a simple script](#create-the-upload-script) to upload a file.
1. [Getting your uploaded file](#get-your-file) using your browser or curl.

**This guide uses Node.js since it's the fastest way to get started using the web3.storage JavaScript client programmatically**, but don't worry if Node isn't your favorite runtime environment — or if you'd rather not do any coding at all. You can also use web3.storage in the following ways:

- Work with the API methods in the [JavaScript client library](/docs/reference/js-client-library) using the JS runtime of your choice.
- Upload and retrieve files directly from your [Account page](https://web3.storage/account/) on the web3.storage website.

<Callout type="warning">
##### PREREQUISITES

You'll need **Node version 14** or higher and **NPM version 7** or higher to complete this guide. Check your local versions like this:

```bash
node --version && npm --version
> v16.4.2
> 7.18.1
```

</Callout>

## Create an account

You need a web3.storage account to get your API token and manage your stored data. You can sign up **for free** using your email address or GitHub.

<Tabs groupId='account-type'>
<TabItem value="Email" label="Email">
##### Sign up using email
1. Go to [web3.storage/login](https://web3.storage/login) to get started.
1. Enter your email address.
1. Check your inbox for a verification email from web3.storage, and click the **Log in** button in the email.
1. You're all set!
</TabItem>
<TabItem value="github" label="Github">
##### Sign up using Github
1. Go to [web3.storage/login](https://web3.storage/login) to get started.
1. Click **GitHub** on the Login screen.
1. **Authorize** web3.storage when asked by GitHub.
1. You're all set!
</TabItem>
</Tabs>

Now that you're signed up and logged in, it's time to [get your API token. ↓](#get-an-api-token)

## Get an API token

It only takes a few moments to get a free API token from web3.storage. This token enables you to interact with the web3.storage service without using the main website, enabling you to incorporate files stored using web3.storage directly into your applications and services.

1. Hover over **Account** and click **Create an API Token** in the dropdown menu to go to your [web3.storage API Tokens page](https://web3.storage/tokens).
1. Enter a descriptive name for your API token and click **Create**.
1. Make a note of the **Token** field somewhere secure where you know you won't lose it. You can click **Copy** to copy your new API token to your clipboard.

<Callout type="warning">
##### Keep your API token private
Do not share your API token with anyone else. This key is specific to your account.
</Callout>

Now that you have your new API token, it's time to use a simple script to [upload a file to web3.storage. ↓](#create-the-upload-script)

## Create the upload script

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

   <CodeSnippet lang="js" src={PutFiles}></CodeSnippet>

1. Create another file called `package.json` and paste in the following code:

   <CodeSnippet lang="json" src={PackageJson}></CodeSnippet>

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

1. Run the script by calling `node put-files.js`, using `--token` to supply your API token and specifying the path and name of the file you want to upload. If you'd like to upload more than one file at a time, simply specify their paths/names one after the other in a single command. Here's how that looks in template form:

   ```bash
   node put-files.js --token=<YOUR_TOKEN> ~/filename1 ~/filename2 ~/filenameN
   ```

   Once you've filled in your details, your command should look something like this:

   ```bash
   node put-files.js --token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweGZFYTRhODlFNUVhRjY5YWI4QUZlZUU3MUE5OTgwQjFGQ2REZGQzNzIiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2MjY5Njk3OTY1NTQsIm5hbWUiOiJib25maXJlIn0.0S9Ua2FWEAZSwaemy92N7bW8ancRUtu4XtLS3Gy1ouA ~/hello.txt
   ```

<Callout type="info">
##### Multiple files

You can upload a whole directory full of files at once by giving the script the path to a local directory. You can also upload multiple files by passing in more than one file path when you run the script.
</Callout>

1. The command will output a CID:

   ```bash
   Content added with CID: bafybeig7sgl52pc6ihypxhk2yy7gcllu4flxgfwygp7klb5xdjdrm7onse
   ```

1. **Make a note of the CID, which looks like `bafyb...`.** You'll need it in order to get your file.

<Callout type="info">
##### Get the status of your upload

It's possible to get a variety of details about your upload, including its CID, upload date, size on the network, and info on IPFS pinning and Filecoin storage deals, by using the `status()` method within the JavaScript client library. Check out the [Query how-to guide](/docs/how-tos/query/#querying-for-status-information) for more information.
</Callout>

Next up, we'll go over two methods for you to [retrieve your data from web3.storage ↓](#get-your-file)

## Get your file

You've already done the most difficult work in this guide — getting your files from web3.storage is simple.

1. Go to `https://dweb.link/ipfs/YOUR_CID`, replacing `YOUR_CID` with the CID you noted in the last step.
1. You should see a link to your file. If you uploaded multiple files at once, you'll see a list of all the files you uploaded.
1. Click on a file's link to view it in your browser!

### Finding your files again

If you ever need to find your files again, and you've forgotten the CID, head over to the [Files table](https://web3.storage/account/) in web3.storage:

<Img src={ImgFilesListing} alt="A listing of files in web3.storage" />

## Next steps

Congratulations! You've just covered the basics of web3.storage. To learn more, take a look at these useful resources:

- Checkout some [example projects in the web3.storage GitHub repo](https://github.com/web3-storage/web3.storage/tree/main/packages/client/examples)
- For a deep dive into storing files, visit the [Store how-to guide.](/docs/how-tos/store)
- To learn more about the details of getting files, have a look at the [Retrieve how-to guide.](/docs/how-tos/retrieve)
- Visit the [reference API section](/docs/reference/js-client-library) for more details on what else you can do with the web3.storage service and how to integrate it into your own projects.
