---
title: Getting started
description: Learn web3.storage by example with sample applications and starter projects.
---

# Getting started examples

The [web3.storage GitHub repository][github-main-repo] contains some example projects to help you get started with the web3.storage JavaScript client library. The examples are stored in the [`packages/client/examples` directory][github-examples-dir] and include code for Node.js and several browser toolchains. Each example directory has a `README.md` explaining how to install dependencies and run the code.

Here's a brief look at how to run the Node.js example:

1. First, clone the web3.storage GitHub repo:

   ```bash
   git clone https://github.com/web3-storage/web3.storage
   ```

1. Move into the NodeJS example folder and install the dependencies using NPM:

   ```bash
   cd web3.storage/packages/client/examples/node.js
   npm install
   ```

   ```bash output
   added 232 packages, and audited 233 packages in 10s

   42 packages are looking for funding
     run `npm fund` for details

   found 0 vulnerabilities
   ```

1. Run the `put-files.js` script, along with the associated variables:

   ```bash
   node put-files.js --token="your-token" ~/file.txt
   ```

1. That's it!

Running the script is easy, but to really learn how things work, you should take a look at the script itself! Open it up in a text editor and play around with the functions. One of the best ways to learn how something works is by breaking it.

[github-main-repo]: https://github.com/web3-storage/web3.storage
[github-examples-dir]: https://github.com/web3-storage/web3.storage/tree/main/packages/client/examples
[github-browser-examples-dir]: https://github.com/web3-storage/web3.storage/tree/main/packages/client/examples/browser
