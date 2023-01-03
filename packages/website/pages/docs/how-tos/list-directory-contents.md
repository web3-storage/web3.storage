---
title: Listing the contents of an IPFS directory
description: Learn how to list the contents of an IPFS directory without having to fetch the whole thing.
---

import { Tabs, TabItem } from 'components/tabs/tabs';
import AccordionSingle from 'components/accordionsingle/accordionsingle';

# Listing the contents of an IPFS directory

When [storing data][howto-store] using the default options, web3.storage will wrap your uploaded files in an IPFS directory listing. This preserves the original filenames and provides a nicer user experience when downloading files.

The [Retrieval guide][howto-retrieve] shows several ways to fetch your data from IPFS using the CID returned by web3.storage and the original filenames. However, you may want to simply list the contents of an IPFS directory without downloading all the data inside.

This simple how-to guide will show a few ways to list the contents of an IPFS directory:

- From JavaScript [using the IPFS HTTP client package](#using-the-javascript-ipfs-http-client-package)
- [Using HTTP requests](#using-http-requests), with examples for curl and PowerShell.
- In your terminal [using the IPFS command line tools](#using-the-ipfs-command-line).

## Using the JavaScript ipfs-http-client package

You can use the [ipfs-http-client package](https://github.com/ipfs/js-ipfs/tree/master/packages/ipfs-http-client) to send requests to remote IPFS nodes, including public gateway nodes like the one available at `https://dweb.link`.
The function below uses the HTTP client package to call the `ls` method, which yields an object describing each link from an IPFS directory object to the files inside.

```js
import { create } from 'ipfs-http-client';

async function getLinks(ipfsPath) {
  const url = 'https://dweb.link/api/v0';
  const ipfs = create({ url });

  const links = [];
  for await (const link of ipfs.ls(ipfsPath)) {
    links.push(link);
  }
  console.log(links);
}
```

See the example output below for the structure of the response objects.

<AccordionSingle heading="Show getLinks() usage example">
```js with-output
getLinks('bafybeifpaez32hlrz5tmr7scndxtjgw3auuloyuyxblynqmjw5saapewmu')
```

```js
[
  {
    name: 'dr-is-tired.jpg',
    path: 'bafybeifpaez32hlrz5tmr7scndxtjgw3auuloyuyxblynqmjw5saapewmu/dr-is-tired.jpg',
    size: 94482,
    cid: CID(bafkreiabltrd5zm73pvi7plq25pef3hm7jxhbi3kv4hapegrkfpkqtkbme),
    type: 'file',
  },
  {
    name: 'not-distributed.jpg',
    path: 'bafybeifpaez32hlrz5tmr7scndxtjgw3auuloyuyxblynqmjw5saapewmu/not-distributed.jpg',
    size: 414201,
    cid: CID(bafkreidrsgkip425zjamc3pvmil7dpatss7ncedyaatepxyionxi7py5fq),
    type: 'file',
  },
  {
    name: 'youareanonsense.jpg',
    path: 'bafybeifpaez32hlrz5tmr7scndxtjgw3auuloyuyxblynqmjw5saapewmu/youareanonsense.jpg',
    size: 55415,
    cid: CID(bafkreiaqv66m5nd6mwgkk7h5lwqnjzj54s4f7knmnrjhb7ylzqfg2vdo54),
    type: 'file',
  },
];
```

</AccordionSingle>

## Using HTTP requests

You can use any HTTP client to invoke the [`ls` API call][ipfs-docs-http-ls] on a remote IPFS node, including public gateway nodes like the one at `https://dweb.link`.

To get the contents of a directory using the HTTP API, make a `GET` request using a URL of the form:

```
https://<gateway-host>/api/v0/ls?arg=<cid>
```

Replace `<gateway-host>` with the address of an IPFS HTTP gateway, and replace `<cid>` with the Content Identifier of the directory you want to list.

For the examples, we'll use the URL `https://dweb.link/api/v0/ls?arg=bafybeifpaez32hlrz5tmr7scndxtjgw3auuloyuyxblynqmjw5saapewmu`.

<Tabs groupId="list-http">
<TabItem value="curl" label="curl (macOS / Linux)">

The example below uses [`curl`](https://curl.se/), which is pre-installed on macOS and many Linux distributions.

```bash with-output
curl -s "https://dweb.link/api/v0/ls?arg=bafybeifpaez32hlrz5tmr7scndxtjgw3auuloyuyxblynqmjw5saapewmu"
```

```json
{
  "Objects": [
    {
      "Hash": "bafybeifpaez32hlrz5tmr7scndxtjgw3auuloyuyxblynqmjw5saapewmu",
      "Links": [
        {
          "Name": "dr-is-tired.jpg",
          "Hash": "bafkreiabltrd5zm73pvi7plq25pef3hm7jxhbi3kv4hapegrkfpkqtkbme",
          "Size": 94482,
          "Type": 2,
          "Target": ""
        },
        {
          "Name": "not-distributed.jpg",
          "Hash": "bafkreidrsgkip425zjamc3pvmil7dpatss7ncedyaatepxyionxi7py5fq",
          "Size": 414201,
          "Type": 2,
          "Target": ""
        },
        {
          "Name": "youareanonsense.jpg",
          "Hash": "bafkreiaqv66m5nd6mwgkk7h5lwqnjzj54s4f7knmnrjhb7ylzqfg2vdo54",
          "Size": 55415,
          "Type": 2,
          "Target": ""
        }
      ]
    }
  ]
}
```

To format the response for display, you can install the [jq tool](https://stedolan.github.io/jq/) and add `| jq` to the end of the command above.

<AccordionSingle heading="Show formatted response">

```bash with-output
curl -s "https://dweb.link/api/v0/ls?arg=bafybeifpaez32hlrz5tmr7scndxtjgw3auuloyuyxblynqmjw5saapewmu" | jq
```

```json
{
  "Objects": [
    {
      "Hash": "bafybeifpaez32hlrz5tmr7scndxtjgw3auuloyuyxblynqmjw5saapewmu",
      "Links": [
        {
          "Name": "dr-is-tired.jpg",
          "Hash": "bafkreiabltrd5zm73pvi7plq25pef3hm7jxhbi3kv4hapegrkfpkqtkbme",
          "Size": 94482,
          "Type": 2,
          "Target": ""
        },
        {
          "Name": "not-distributed.jpg",
          "Hash": "bafkreidrsgkip425zjamc3pvmil7dpatss7ncedyaatepxyionxi7py5fq",
          "Size": 414201,
          "Type": 2,
          "Target": ""
        },
        {
          "Name": "youareanonsense.jpg",
          "Hash": "bafkreiaqv66m5nd6mwgkk7h5lwqnjzj54s4f7knmnrjhb7ylzqfg2vdo54",
          "Size": 55415,
          "Type": 2,
          "Target": ""
        }
      ]
    }
  ]
}
```

</AccordionSingle>
</TabItem>

<TabItem value="powershell" label="PowerShell (Windows)">

The example below uses the [`System.Net.WebClient` class](https://docs.microsoft.com/en-us/dotnet/api/system.net.webclient?view=net-5.0) to download a JSON object describing the links in the requested CID.

```powershell with-output
$wc = New-Object System.Net.WebClient
$wc.DownloadString("https://dweb.link/api/v0/ls?arg=bafybeifpaez32hlrz5tmr7scndxtjgw3auuloyuyxblynqmjw5saapewmu")
```

```json
{
  "Objects": [
    {
      "Hash": "bafybeifpaez32hlrz5tmr7scndxtjgw3auuloyuyxblynqmjw5saapewmu",
      "Links": [
        {
          "Name": "dr-is-tired.jpg",
          "Hash": "bafkreiabltrd5zm73pvi7plq25pef3hm7jxhbi3kv4hapegrkfpkqtkbme",
          "Size": 94482,
          "Type": 2,
          "Target": ""
        },
        {
          "Name": "not-distributed.jpg",
          "Hash": "bafkreidrsgkip425zjamc3pvmil7dpatss7ncedyaatepxyionxi7py5fq",
          "Size": 414201,
          "Type": 2,
          "Target": ""
        },
        {
          "Name": "youareanonsense.jpg",
          "Hash": "bafkreiaqv66m5nd6mwgkk7h5lwqnjzj54s4f7knmnrjhb7ylzqfg2vdo54",
          "Size": 55415,
          "Type": 2,
          "Target": ""
        }
      ]
    }
  ]
}
```

To format the response for display, you can add ` | ConvertFrom-Json | ConvertTo-Json -Depth 100` to the end of the final command.

<AccordionSingle heading="Show formatted response">

```powershell with-output
$wc = New-Object System.Net.WebClient
$wc.DownloadString("https://dweb.link/api/v0/ls?arg=bafybeifpaez32hlrz5tmr7scndxtjgw3auuloyuyxblynqmjw5saapewmu") | ConvertFrom-Json | ConvertTo-Json -Depth 100
```

```json
{
  "Objects": [
    {
      "Hash": "bafybeifpaez32hlrz5tmr7scndxtjgw3auuloyuyxblynqmjw5saapewmu",
      "Links": [
        {
          "Name": "dr-is-tired.jpg",
          "Hash": "bafkreiabltrd5zm73pvi7plq25pef3hm7jxhbi3kv4hapegrkfpkqtkbme",
          "Size": 94482,
          "Type": 2,
          "Target": ""
        },
        {
          "Name": "not-distributed.jpg",
          "Hash": "bafkreidrsgkip425zjamc3pvmil7dpatss7ncedyaatepxyionxi7py5fq",
          "Size": 414201,
          "Type": 2,
          "Target": ""
        },
        {
          "Name": "youareanonsense.jpg",
          "Hash": "bafkreiaqv66m5nd6mwgkk7h5lwqnjzj54s4f7knmnrjhb7ylzqfg2vdo54",
          "Size": 55415,
          "Type": 2,
          "Target": ""
        }
      ]
    }
  ]
}
```

</AccordionSingle>
</TabItem>
</Tabs>

## Using the IPFS command line

If you have the [IPFS command line interface][ipfs-docs-cli-quickstart] installed, you can use the [`ipfs ls` command][ipfs-docs-cli-ls] to list the contents of a directory.

```bash
ipfs ls -v bafybeifpaez32hlrz5tmr7scndxtjgw3auuloyuyxblynqmjw5saapewmu
```

```
Hash                                                        Size   Name
bafkreiabltrd5zm73pvi7plq25pef3hm7jxhbi3kv4hapegrkfpkqtkbme 94482  dr-is-tired.jpg
bafkreidrsgkip425zjamc3pvmil7dpatss7ncedyaatepxyionxi7py5fq 414201 not-distributed.jpg
bafkreiaqv66m5nd6mwgkk7h5lwqnjzj54s4f7knmnrjhb7ylzqfg2vdo54 55415  youareanonsense.jpg
```

Note that omitting the `-v` flag will remove the header line from the output. Run `ipfs ls --help` for more usage information.

[howto-store]: /docs/how-tos/store/
[howto-retrieve]: /docs/how-tos/retrieve/
[ipfs-docs-cli-quickstart]: https://docs.ipfs.io/how-to/command-line-quick-start/
[ipfs-docs-cli-ls]: https://docs.ipfs.io/reference/cli/#ipfs-ls
[ipfs-docs-http-ls]: https://docs.ipfs.io/reference/http/api/#api-v0-ls
