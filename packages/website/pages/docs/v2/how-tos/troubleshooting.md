---
title: Troubleshooting
description: A collection of common issues for new developers, and solutions to those problems.
---

# Troubleshooting

This page contains a collection of common issues for new developers, and solutions to those problems.

## The CID returned when uploading doesn't link directly to my file

By default, the CID returned when uploading files to web3.storage will be wrapped in a directory listing in order to preserve the original filename. The CID returned by API points to the directory object, which in turn points to the file's content.

See the [Directory Wrapping section](/docs/how-tos/store/#directory-wrapping) of the [Storage guide][howto-store] for more information about working with directory CIDs and instructions on changing the default behavior.

[howto-store]: /docs/v2/how-tos/store/
[contact-us]: /docs/community/help-and-support/
