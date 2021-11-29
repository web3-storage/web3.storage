# Website

Frontend build for the web3.storage website.

## Getting Started

### Prerequisites

If you don't have `nvm` installed to manage node versions, then it is highly suggested. See [the nvm github](https://github.com/creationix/nvm) for more details.

```
- node >=v16.0.3
- yarn v1.22.10
```

## Usage

### Running Locally


#### Development
NPM:
```bash
cd packages/website
npm run dev
```

Yarn: 
```bash
cd packages/website
yarn dev
```

#### Production
NPM:
```bash
cd packages/website
npm run build
npm run start
```

Yarn: 
```bash
cd packages/website
yarn build
yarn start
```

### Linting
NPM:
```bash
cd packages/website
npm run lint
```

Yarn: 
```bash
cd packages/website
yarn lint
```

### Running Storybook

```bash
After `Running Locally`
npm run storybook
```

## Deploy

TBD