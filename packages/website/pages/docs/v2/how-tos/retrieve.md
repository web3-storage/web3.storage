---
title: How to retrieve data from web3.storage
description: Learn how to retrieve data stored using web3.storage in this quick how-to guide.
---

import { Tabs, TabItem } from 'components/tabs/tabs';
import Callout from 'components/callout/callout';
import CodeSnippet from 'components/codesnippet/codesnippet';
import Img from 'components/cloudflareImage';
import ImgGatewayDir from '../../../../public/images/docs/gateway-directory-listing.png';

# How to retrieve data from web3.storage

> **TODO**: replace "retrieve" with "read" throughout

In this how-to guide, **you'll learn several methods for retrieving data from web3.storage.**

All data stored using web3.storage is made available for retrieval via [IPFS](https://ipfs.io), the InterPlanetary File System. IPFS is a distributed, peer-to-peer network for storing and sharing [content-addressed data][concepts-content-addressing]. This guide shows you several ways to retrieve your data from IPFS:

- In your browser using an [HTTP gateway](#using-an-ipfs-http-gateway).
- In your terminal using the [IPFS command-line tools](#using-the-ipfs-command-line).
- In your terminal using [curl or Powershell](#using-curl-or-powershell).

## Using an IPFS HTTP gateway

You can easily fetch any data stored using web3.storage using an IPFS HTTP gateway. Because IPFS is a peer-to-peer, decentralized network, you can use any public HTTP gateway to fetch your data. In this guide, we'll use the gateway at `w3s.link` (the public gateway [we run](https://web3.storage/products/w3link/) that can be up to 10x faster than other public gateways), but you can see more worldwide gateways on the [IPFS Public Gateway Checker](https://ipfs.github.io/public-gateway-checker/).

> **TODO**: paragraph below should distinguish between "data CID" and CAR CID, since w3up shows both. Also, current w3up-client deals only with CARs, so just talking about files may not be appropriate...

When you [store data using the web3.storage client][howto-store], the `upload` method returns an [IPFS content identifier (CID)][ipfs-docs-cid] string. That CID points to an IPFS directory that contains all the files you passed in using the `upload` method.

You can use an IPFS gateway to view a list of all the files in that directory from your browser. To do so, simply create a gateway URL. For example, if your CID is `bafybeidd2gyhagleh47qeg77xqndy2qy3yzn4vkxmk775bg2t5lpuy7pcu`, you can make a URL for the `w3s.link` gateway as follows: [bafybeidd2gyhagleh47qeg77xqndy2qy3yzn4vkxmk775bg2t5lpuy7pcu.ipfs.w3s.link](https://bafybeidd2gyhagleh47qeg77xqndy2qy3yzn4vkxmk775bg2t5lpuy7pcu.ipfs.w3s.link/). Follow that link, and you'll see a page similar to this:

<Img src={ImgGatewayDir} alt="Screenshot of an IPFS gateway directory listing" />

If you want to link directly to a file within that directory, just add the file path after the CID portion of the link. For example: [bafybeidd2gyhagleh47qeg77xqndy2qy3yzn4vkxmk775bg2t5lpuy7pcu.ipfs.w3s.link/not-distributed.jpg](https://bafybeidd2gyhagleh47qeg77xqndy2qy3yzn4vkxmk775bg2t5lpuy7pcu.ipfs.w3s.link/not-distributed.jpg) could be used as a shareable link for your new favorite wallpaper.

<Callout>
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

> **TODO**: Audit all links, make sure they resolve to v2 docs

[reference-js]: /docs/reference/js-client-library/
[quickstart-guide]: /docs/intro.md#quickstart
[concepts-content-addressing]: /docs/concepts/content-addressing/
[howto-store]: /docs/how-tos/store/
[reference-js-web3response]: /docs/reference/js-client-library/#return-value-2
[reference-js-constructor]: /docs/reference/js-client-library/#constructor
[ipfs-docs-cid]: https://docs.ipfs.io/concepts/content-addressing/
[ipfs-docs-cli-quickstart]: https://docs.ipfs.io/how-to/command-line-quick-start/
[ipfs-docs-desktop-quickstart]: https://docs.ipfs.io/install/ipfs-desktop/
[mdn-fetch]: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
[mdn-file]: https://developer.mozilla.org/en-US/docs/Web/API/File
[mdn-response]: https://developer.mozilla.org/en-US/docs/Web/API/Response
