---
title: How to retrieve data from web3.storage
description: Learn how to retrieve data stored using web3.storage in this quick how-to guide.
---

import { Tabs, TabItem } from 'components/tabs/tabs';
import Callout from 'components/callout/callout';
import CodeSnippet from 'components/codesnippet/codesnippet';
import howtoSource from '!!raw-loader!../../../assets/code-snippets/how-to/index.js'
import golangRetrieve from '!!raw-loader!../../../assets/code-snippets/how-to/golang/retrieve/retrieve.go';
import Img from 'components/cloudflareImage';
import ImgGatewayDir from '../../../public/images/docs/gateway-directory-listing.png';

# How to retrieve data from web3.storage

In this how-to guide, **you'll learn several methods for retrieving data from web3.storage.**

All data stored using web3.storage is made available for retrieval via [IPFS](https://ipfs.io), the InterPlanetary File System. IPFS is a distributed, peer-to-peer network for storing and sharing [content-addressed data][concepts-content-addressing]. This guide shows you several ways to retrieve your data from IPFS:

- In your browser using an [HTTP gateway](#using-an-ipfs-http-gateway).
- Programmatically using the [web3.storage client libraries](#using-the-client-libraries).
- In your terminal using the [IPFS command-line tools](#using-the-ipfs-command-line).
- In your terminal using [curl or Powershell](#using-curl-or-powershell).

## Using an IPFS HTTP gateway

You can easily fetch any data stored using web3.storage using an IPFS HTTP gateway. Because IPFS is a peer-to-peer, decentralized network, you can use any public HTTP gateway to fetch your data. In this guide, we'll use the gateway at `w3s.link` (the public gateway [we run](https://web3.storage/products/w3link/) that can be up to 10x faster than other public gateways), but you can see more worldwide gateways on the [IPFS Public Gateway Checker](https://ipfs.github.io/public-gateway-checker/).

When you [store data using the web3.storage client][howto-store], the `put` method returns an [IPFS content identifier (CID)][ipfs-docs-cid] string. That CID points to an IPFS directory that contains all the files you passed in using the `put` method.

You can use an IPFS gateway to view a list of all the files in that directory from your browser. To do so, simply create a gateway URL. For example, if your CID is `bafybeidd2gyhagleh47qeg77xqndy2qy3yzn4vkxmk775bg2t5lpuy7pcu`, you can make a URL for the `w3s.link` gateway as follows: [bafybeidd2gyhagleh47qeg77xqndy2qy3yzn4vkxmk775bg2t5lpuy7pcu.ipfs.w3s.link](https://bafybeidd2gyhagleh47qeg77xqndy2qy3yzn4vkxmk775bg2t5lpuy7pcu.ipfs.w3s.link/). Follow that link, and you'll see a page similar to this:

<Img src={ImgGatewayDir} alt="Screenshot of an IPFS gateway directory listing" />

If you want to link directly to a file within that directory, just add the file path after the CID portion of the link. For example: [bafybeidd2gyhagleh47qeg77xqndy2qy3yzn4vkxmk775bg2t5lpuy7pcu.ipfs.w3s.link/not-distributed.jpg](https://bafybeidd2gyhagleh47qeg77xqndy2qy3yzn4vkxmk775bg2t5lpuy7pcu.ipfs.w3s.link/not-distributed.jpg) could be used as a shareable link for your new favorite wallpaper.

You can easily fetch any data stored using web3.storage using an IPFS HTTP gateway. Because IPFS is a peer-to-peer, decentralized network, you can use any public HTTP gateway to fetch your data. In this guide, we'll use the gateway at `w3s.link` (which is optimized for content stored on web3.storage), but you can see more worldwide gateways on the [IPFS Public Gateway Checker](https://ipfs.github.io/public-gateway-checker/).

<Callout>
w3link (`https://ipfs.w3s.link/*`) has a rate limit of 200 requests per minute by IP.
</Callout>

When you [store data using the web3.storage client][howto-store], the `put` method returns an [IPFS content identifier (CID)][ipfs-docs-cid] string. That CID points to an IPFS directory that contains all the files you passed in using the `put` method.

You can use an IPFS gateway to view a list of all the files in that directory from your browser. To do so, simply create a gateway URL. For example, if your CID is `bafybeidd2gyhagleh47qeg77xqndy2qy3yzn4vkxmk775bg2t5lpuy7pcu`, you can make a URL for the `w3s.link` gateway as follows: [bafybeidd2gyhagleh47qeg77xqndy2qy3yzn4vkxmk775bg2t5lpuy7pcu.ipfs.w3s.link](https://bafybeidd2gyhagleh47qeg77xqndy2qy3yzn4vkxmk775bg2t5lpuy7pcu.ipfs.w3s.link/). Follow that link, and you'll see a page similar to this:

<Img src={ImgGatewayDir} alt="Screenshot of an IPFS gateway directory listing" />

If you want to link directly to a file within that directory, just add the file path after the CID portion of the link. For example: [bafybeidd2gyhagleh47qeg77xqndy2qy3yzn4vkxmk775bg2t5lpuy7pcu.ipfs.w3s.link/not-distributed.jpg](https://bafybeidd2gyhagleh47qeg77xqndy2qy3yzn4vkxmk775bg2t5lpuy7pcu.ipfs.w3s.link/not-distributed.jpg) could be used as a shareable link for your new favorite wallpaper.

<Callout type="info">
##### Tip
Your [Files page](https://web3.storage/account) on web3.storage includes IPFS gateway links to all the content you've uploaded, so if you're looking to link to one of your own files, you don't even have to create a gateway URL.
</Callout>

### Setting the filename for downloads via gateways

When downloading files from an HTTP gateway, web browsers will set the default filename for the downloaded file based on the path component of the gateway link. For example, if you use your browser's "Save link as..." feature on the following link, it should prompt you to save a file named `treehouse.jpeg`:

[https://bafybeicfnbaeigdtklwkrj35r4wtfppix732zromsadvgiu33mowah74yq.ipfs.w3s.link/treehouse.jpeg](https://bafybeicfnbaeigdtklwkrj35r4wtfppix732zromsadvgiu33mowah74yq.ipfs.w3s.link/treehouse.jpeg)

In the link above, the CID `bafybeicfnbaeigdtklwkrj35r4wtfppix732zromsadvgiu33mowah74yq` points to an IPFS directory listing, which maps from the filename `treehouse.jpeg` to the CID for the image itself.

Since the web3.storage client [wraps your uploaded files in a directory by default](/docs/how-tos/store/#directory-wrapping), this is the most common kind of gateway link you're likely to need, and your users should get nice filenames when they download their content.

However, the behavior is a bit different if you make a gateway link directly to the image CID:

- [https://bafkreifvallbyfxnedeseuvkkswt5u3hbdb2fexcygbyjqy5a5rzmhrzei.ipfs.w3s.link/](https://bafkreifvallbyfxnedeseuvkkswt5u3hbdb2fexcygbyjqy5a5rzmhrzei.ipfs.w3s.link/)
- [https://ipfs.io/ipfs/bafkreifvallbyfxnedeseuvkkswt5u3hbdb2fexcygbyjqy5a5rzmhrzei](https://ipfs.io/ipfs/bafkreifvallbyfxnedeseuvkkswt5u3hbdb2fexcygbyjqy5a5rzmhrzei)

Both of the URLs above link directly to the CID of the image, without an associated filename. The first URL uses the recommended "subdomain" URL format for gateway links, while the second form uses a "path prefix" format that you may see in use elsewhere in the IPFS ecosystem.

Depending on which style of link you use, your browser will prompt you to save a file with a generic name like `download`, or with the CID as the filename.

If you have such a link, you can override the default filename by adding a query string parameter to your link of the form `?filename=<desired-filename>`. For example, the following link will save as `treehouse.jpeg`, even though it links directly to the image by CID:

[https://bafkreifvallbyfxnedeseuvkkswt5u3hbdb2fexcygbyjqy5a5rzmhrzei.ipfs.w3s.link/?filename=treehouse.jpeg](https://bafkreifvallbyfxnedeseuvkkswt5u3hbdb2fexcygbyjqy5a5rzmhrzei.ipfs.w3s.link/?filename=treehouse.jpeg)

## Using the client libraries

<Callout>
Please note: retrieval using the client libraries is currently not as reliable as we'd like. We're working on a permanent fix to greatly improve this situation. In the meantime, if you experience errors trying to fetch data using a client library, please try [using an HTTP gateway](#using-an-ipfs-http-gateway) like [w3link](https://web3.storage/products/w3link/) or [the ipfs command line tool](#using-the-ipfs-command-line).
</Callout>

<Tabs groupId="lang">

<TabItem value="js" label="JavaScript">
The web3.storage JavaScript client provides a `get` method that allows you to retrieve any IPFS content using that content's [content identifier (CID)][ipfs-docs-cid].

First, you'll need to create a web3.storage client using your API token. Getting an API token is free, but you'll need a free web3.storage account. If you already have an account and a token, read on. If not, have a look at the [quickstart guide][quickstart-guide] to get up and running in just a few minutes.

First you'll need to add the `web3.storage` package to your project's dependencies:

```bash
npm install web3.storage
```

Use the following code to create a web3.storage client:

<CodeSnippet lang="js" src={howtoSource} region="makeStorageClient" />

Once you have a client, you can call `client.get`, passing in a CID string:

<CodeSnippet lang="js" src={howtoSource} region="retrieve-basics" />

#### The `Web3Response` object

The `get` method returns a `Web3Response` object. This object extends the [`Response` object][mdn-response] from the Web [Fetch API][mdn-fetch] with two methods that provide access to the retrieved IPFS data: `files` and `unixFsIterator()`.

The [`files` method][reference-js-web3response] returns an array of `Web3File` objects, which represent all files contained in the content archive identified by the given CID. A `Web3File` is just like a regular Web [`File` object][mdn-file], with the addition of `path` and `cid` properties. These contain the relative path of the file within the archive and the CID of the file, respectively.

Here's the example from above, now with the code to unpack and inspect the files in the response:

<CodeSnippet lang="js" src={howtoSource} region="retrieve-unpack-files" />

<Callout type="info">
##### Tip
Another option is to use the array of `unixFs` objects provided by the `unixFsIterator()` method to iterate through your files. While in the vast majority of cases you'll want to use the `files()` method outlined above, existing IPFS users may prefer interacting with `unixFs` objects if they have existing code or tooling that supports it. For more details, see the [JavaScript client library reference][reference-js].
</Callout>

</TabItem>

<TabItem value="go" label="Go">
The Go client library's [`Client` interface](https://pkg.go.dev/github.com/web3-storage/go-w3s-client#Client) provides a `Get` method that accepts a [`context.Context`](https://pkg.go.dev/context#Context) and a [`Cid`](https://pkg.go.dev/github.com/ipfs/go-cid#Cid) from the [`go-cid` library](https://pkg.go.dev/github.com/ipfs/go-cid).

The `Get` method returns a [`w3http.Web3Response`](https://pkg.go.dev/github.com/web3-storage/go-w3s-client/http#Web3Response), which is a standard [`http.Response`](https://pkg.go.dev/net/http#Response) with an additional [`Files` method](https://pkg.go.dev/github.com/web3-storage/go-w3s-client/http#Web3Response.Files) that provides access to the downloaded files.

First, import the client package and a few other things we'll be using:

<CodeSnippet lang="go" src={golangRetrieve} region="imports" />

Assuming you've already [created a Client](https://pkg.go.dev/github.com/web3-storage/go-w3s-client#NewClient),
you can use it to `Get` files by cid. The method below takes a CID string and converts it to a [`Cid` type](https://pkg.go.dev/github.com/ipfs/go-cid#Cid), which is what the `Get` method expects. You may not need this step if you're already using the `Cid` type in your code base.

<CodeSnippet lang="go" src={golangRetrieve} region="retrieveFiles" />

The `Files` method returns an [`fs.File`](https://pkg.go.dev/io/fs#File) that may be either a single file or a directory, depending on the CID that you requested. To distinguish, you can call `Stat` on the file and check the `IsDir` method of the returned [`fs.FileInfo`](https://pkg.go.dev/io/fs#FileInfo). If it is a directory, you can type-cast to the [`fs.ReadDirFile`](https://pkg.go.dev/io/fs#ReadDirFile) interface and use `ReadDirFile`'s `ReadDir` method to list the contents:

<CodeSnippet lang="go" src={golangRetrieve} region="listDirectory" />

Alternatively, you can use the second return value of the `Files` method, which is an [`fs.FS`](https://pkg.go.dev/io/fs#FS) "file system" that represents all files included in the download. The [`fs.ReadDir` function](https://pkg.go.dev/io/fs#ReadDir) takes an `fs.FS` and the name of a directory to read, which can be `"/"` to read the root:

<CodeSnippet lang="go" src={golangRetrieve} region="listDirectoryUsingFilesystem" />

The examples above only list the direct contents of a directory, without descending into nested subdirectories. You can pass the returned `fs.FS` to [`fs.WalkDir`](https://pkg.go.dev/io/fs#WalkDir) to walk the entire structure, including all nested folders:

<CodeSnippet lang="go" src={golangRetrieve} region="walkDirectory" />
</TabItem>
</Tabs>

## Using the IPFS command line

If you have the [IPFS command line interface][ipfs-docs-cli-quickstart] installed, you can use it directly to fetch data without going through a gateway. This also works if you've installed [IPFS Desktop][ipfs-docs-desktop-quickstart], which includes the IPFS CLI.

To get the whole bundle and save it to a directory, run the following command:

```bash
ipfs get bafybeidd2gyhagleh47qeg77xqndy2qy3yzn4vkxmk775bg2t5lpuy7pcu
```

If you want to get a specific file out of the bundle, add its name onto the end of the `ipfs get bafybie...` command:

```bash
ipfs get bafybeidd2gyhagleh47qeg77xqndy2qy3yzn4vkxmk775bg2t5lpuy7pcu/youareanonsense.jpg
```

## Using curl or Powershell

Sometimes you may need to just download a specific file to your computer using the command line. Unix-based operating systems, like Linux and macOS, can use curl. Windows users can use Powershell.

<Tabs groupId="os">
<TabItem value="linux" label="Linux">
1.  Open a terminal window.
1.  Use `curl` to download your file:

        ```bash
        curl https://<YOUR CID>.ipfs.w3s.link/<FILE NAME> -o ~/<OUTPUT FILE>
        ```

        Replace `<YOUR CID>`, `<FILE NAME>`, and `<OUTPUT FILE>` with their respective values.

        | Variable | Replace with | Example |
        | --- | --- | --- |
        | `<YOUR CID>` | The CID of the file you want to download. | `bafybeie2bjap32zi2yqh5jmpve5njwulnkualcbiszvwfu36jzjyqskceq` |
        | `<FILE NAME>` | The _name_ of the file that you originally uploaded to web3.storage. | `example.txt` |
        | `<OUTPUT FILE>` | The path and filename that you want curl to save the file to. This can be different to `<FILE NAME>`. | `Desktop/output-file.txt` |

        Your complete command should look something like this:

        ```bash
        curl https://bafybeie2bjap32zi2yqh5jmpve5njwulnkualcbiszvwfu36jzjyqskceq.ipfs.w3s.link/example.txt -o ~/output-file.txt
        ```

</TabItem>
<TabItem value="mac" label="macOS">

1.  Open a terminal window.
1.  Use `curl` to download your file:

        ```bash
        curl https://<YOUR CID>.ipfs.w3s.link/<FILE NAME> -o ~/<OUTPUT FILE>
        ```

        Replace `<YOUR CID>`, `<FILE NAME>`, and `<OUTPUT FILE>` with their respective values.

        | Variable        | Replace with                                                                                                | Example                                                       |
        | --------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
        | `<YOUR CID>`    | The CID of the file you want to download.                                                                   | `bafybeie2bjap32zi2yqh5jmpve5njwulnkualcbiszvwfu36jzjyqskceq` |
        | `<FILE NAME>`   | The _name_ of the file that you originally uploaded to web3.storage.                                        | `example.txt`                                                 |
        | `<OUTPUT FILE>` | The path and filename that you want Powershell to save the file to. This can be different to `<FILE NAME>`. | `Desktop/output-file.txt`                                     |

        Your complete command should look something like this:

        ```bash
        curl https://bafybeie2bjap32zi2yqh5jmpve5njwulnkualcbiszvwfu36jzjyqskceq.ipfs.w3s.link/example.txt -o ~/output-file.txt
        ```

</TabItem>
<TabItem value="windows" label="Windows">

1.  Open a Powershell window.
1.  Use `Invoke-WebRequest` to download your file:

    ```powershell
     Invoke-WebRequest -Uri "https://<YOUR_CID>.ipfs.w3s.link/<FILE NAME>" -OutFile "C:\Users\<USERNAME>\<OUTPUT FILE>
    ```

    Replace `<YOUR CID>`, `<FILE NAME>`, `<USERNAME>`, and `<OUTPUT FILE>` with their respective values.

    | Variable        | Replace with                                                                                                | Example                                                       |
    | --------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
    | `<YOUR CID>`    | The CID of the file you want to download.                                                                   | `bafybeie2bjap32zi2yqh5jmpve5njwulnkualcbiszvwfu36jzjyqskceq` |
    | `<FILE NAME>`   | The _name_ of the file that you originally uploaded to web3.storage.                                        | `example.txt`                                                 |
    | `<USERNAME>`    | The username you use to log into Windows with.                                                              | `Laika`                                                       |
    | `<OUTPUT FILE>` | The path and filename that you want Powershell to save the file to. This can be different to `<FILE NAME>`. | `Desktop/output-file.txt`                                     |

    Your complete command should look something like this:

    ```powershell
    Invoke-WebRequest -Uri "https://bafybeie2bjap32zi2yqh5jmpve5njwulnkualcbiszvwfu36jzjyqskceq.ipfs.w3s.link/example.txt" -OutFile "C:\Users\Laika\Desktop\output-file.txt"
    ```

</TabItem>
</Tabs>

## Next steps

If you haven't yet explored in depth how to store data using web3.storage, check out the [storage how-to guide][howto-store] for a deep dive on how to upload files using the [JavaScript client library][reference-js].

You can also use the client library to get more information about the status of your data. See the [query how-to guide][howto-query] to learn how to get more details about your data, including the status of any Filecoin storage deals.

[reference-js]: /docs/reference/js-client-library/
[quickstart-guide]: /docs/intro.md#quickstart
[concepts-content-addressing]: /docs/concepts/content-addressing/
[howto-store]: /docs/how-tos/store/
[howto-query]: /docs/how-tos/query/
[reference-js-web3response]: /docs/reference/js-client-library/#return-value-2
[reference-js-constructor]: /docs/reference/js-client-library/#constructor
[ipfs-docs-cid]: https://docs.ipfs.io/concepts/content-addressing/
[ipfs-docs-cli-quickstart]: https://docs.ipfs.io/how-to/command-line-quick-start/
[ipfs-docs-desktop-quickstart]: https://docs.ipfs.io/install/ipfs-desktop/
[mdn-fetch]: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
[mdn-file]: https://developer.mozilla.org/en-US/docs/Web/API/File
[mdn-response]: https://developer.mozilla.org/en-US/docs/Web/API/Response
