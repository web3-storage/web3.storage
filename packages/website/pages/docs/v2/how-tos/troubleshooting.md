---
title: Troubleshooting
description: A collection of common issues for new developers, and solutions to those problems.
---

# Troubleshooting

This page contains a collection of common issues for new developers, and solutions to those problems.

## I'm getting import errors when importing the Javascript client library

Some common situations where this might happen include:

- Using Webpack 4 (e.g., for `create-react-app`)
- Getting an error like `Can't resolve 'ipfs-car/blockstore/memory'`

To get around this issue, add the following import to the top of your `.js` scripts to import the pre-webpack-bundled version of web3.storage:

```javascript
import { Web3Storage } from 'web3.storage/dist/bundle.esm.min.js';
```

Alternatively, you can try upgrading to Webpack 5 or using a bundler that supports [`exports` in `package.json`](https://nodejs.org/api/packages.html#subpath-exports).

## The status information for my content doesn't include any Filecoin deals

Content uploaded to web3.storage is persisted to Filecoin in batches, and newly uploaded content may take up to 48 hours to be stored on Filecoin. If more than 48 hours have elapsed since upload, and a [status request][howto-query] for your content returns no `deals` information, please [contact us][contact-us] so that we can investigate.

## Files downloaded via an IPFS gateway have awkward names

Depending on the type of URL used to request content from an IPFS HTTP gateway, some web browsers may save downloaded files with generic filenames like `download`, or they may use the CID of the content as the filename. See [Setting the filename for downloads via gateways][howto-retrieve-gateway-filenames] in the [Retrieval guide][howto-retrieve] to learn how to work around this issue.

## The CID returned when uploading doesn't link directly to my file

By default, the CID returned when uploading files to web3.storage will be wrapped in a directory listing in order to preserve the original filename. The CID returned by API points to the directory object, which in turn points to the file's content.

See the [Directory Wrapping section](/docs/how-tos/store/#directory-wrapping) of the [Storage guide][howto-store] for more information about working with directory CIDs and instructions on changing the default behavior.

## I get a 429 "Too many requests" error when using the [HTTP API][reference-http]

The HTTP API imposes rate limits to ensure that a single user cannot overwhelm the service with a flood of requests.

Rate limits are imposed when more than 30 requests from the same API token are received within a ten second window. To avoid being limited, try to throttle your requests to stay within this limit. Alternatively, you can respond to a 429 status by backing off for a few seconds and retrying the request.

## I am experiencing slowness in uploads to web3.storage

Please make sure that you are using the latest version of web3.storage client: v3.5.6 or greater. There is an issue in the latest Node version ([nodejs/node#42117](https://github.com/nodejs/node/pull/42117)) and we reverted using native version of Blob in latest release until that fix is shipped.

[howto-store]: /docs/how-tos/store/
[howto-query]: /docs/how-tos/query/
[howto-retrieve]: /docs/how-tos/retrieve/
[howto-retrieve-gateway-filenames]: /docs/how-tos/retrieve/#setting-the-filename-for-downloads-via-gateways
[reference-http]: /docs/reference/http-api/
[contact-us]: /docs/community/help-and-support/
