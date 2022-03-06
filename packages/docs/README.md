# web3.storage docs repo

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg)](https://protocol.ai)
[![](https://img.shields.io/badge/platform-Docusaurus-green.svg)](https://docuasurus.io/)
[![](https://img.shields.io/badge/deployed%20on-Fleek-ff69b4.svg)](http://fleek.co/)


This repository contains code and content for [Web3.Storage/docs](https://web3.storage/docs, the documentation site for the [Web3.Storage](https://web3.storage/) service.

_You can find the code for the main web3.storage website and the underlying API here: https://github.com/web3-storage/web3.storage_

## For documentation authors:
- Check this repo's [issues page](https://github.com/web3-storage/docs/issues) to see what items are in need of help, including content request issues looking for writers.
- If you're writing something new, please read through the [contribution guide](CONTRIBUTING.md) for guidelines on types of content, grammar, formatting, and style.
- For details on building the site locally and submitting pull requests, see the ["For site developers"](#for-site-developers) section below.


## For site developers

### Build and run locally

This site is built in [Docusaurus](https://docusaurus.io), and uses React/JavaScript for functional code and Markdown for post content.

To build a local copy, run the following:

1. Clone this repository:

   ```bash
   git clone https://github.com/web3-storage/docs.git
   ```

1. Move into the `docs` folder and install the NPM dependencies:

   ```bash
   cd docs
   npm install
   ```

1. Boot up the application in _dev mode_:

   ```bash
   npm start
   ```

1. Open [localhost:3030](http://localhost:3030) in your browser.
1. Close the local server with `CTRL` + `c`.
1. To restart the local server, run `npm start` from within the `docs` folder.

### PR and preview

Once you're happy with your local changes, please make a PR **against the `main` branch**. Including detailed notes on your PR - particularly screenshots to depict any changes in UI - will help speed up approval and deployment.

All PRs against `main` automatically generate Fleek previews to make it easier to check your work. You can view your PR's preview by clicking `Details` in the `fleek/build` check at the bottom of your PR page:<br/>
![image](https://user-images.githubusercontent.com/1507828/110034382-9dbb5b80-7cf7-11eb-89a4-7772970677d3.png)

Your preview URL will look something like this: `https://<cid>.on.fleek.co` (example: https://bafybeibwksog6le7t6anr4zenlcg2qntrmfznx6e64goree7hmzfsxcnl4.on.fleek.co/)

A reviewer will be by shortly to have a look!

### Hosting / Deployment

We're using Fleek as the hosting and deployment platform.
Auto deployments are enabled on the `main` branch and preview builds are generated when PRs are created merging to the `main` branch.

### 🔗 Links:

- ~~Production (`main` branch): https://docs.web3.storage or https://web3-storage-docs.on.fleek.co/~~ 
- Preview builds (see screenshot above): `https://<cid>.on.fleek.co` (example: https://bafybeibwksog6le7t6anr4zenlcg2qntrmfznx6e64goree7hmzfsxcnl4.on.fleek.co/)

## Maintainers

This site's codebase is under active maintenance by members of the core team at [Protocol Labs](https://protocol.ai/).

## License

All software code is copyright (c) Protocol Labs, Inc. under the **[MIT](LICENSE) license**. Other written documentation and content is copyright (c) Protocol Labs, Inc. under the [**Creative Commons Attribution-Share-Alike License**](https://creativecommons.org/licenses/by/4.0/).
