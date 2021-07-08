# web3.storage

The simple file storage service for IPFS & Filecoin

## Getting started

This project uses node v16 and npm v7. It's a monorepo that use [npm workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces) to handle resolving dependencies between the local `packages/*` folders.

```console
npm install
```

To add a new workspace to the repo:

```console
npm init -w ./packages/website
```

To run an npm script in one or more workspaces

```console
npm run test --workspace=a --workspace=b
```

<p align="center">
  <a href="https://web3.storage">⁂</a>
</p>
