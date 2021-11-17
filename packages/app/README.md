# Website

Frontend build for the web3.storage website.

## Getting Started

Inside the `/packages/website` folder create a file called `.env.local` with the following content.

```ini
NEXT_PUBLIC_ENV=dev
NEXT_PUBLIC_API=http://127.0.0.1:8787
NEXT_PUBLIC_MAGIC=<magic test mode publishable key>
```

Production vars should set in Cloudflare Pages settings.

## Usage

### Running Locally

```bash
cd packages/website
npm install
npm start
```

## Deploy

The site is deployed from Github Actions. When a PR that changes website code is merged to main, the website is built and uploaded to web3.storage. The CID for the new build is set as a dnslink for https://staging.web3.storage so you can see the site served from an IPFS gateway, or fetch it over IPFS in Brave or any browser with IPFS Companion installed.

When a release-please PR is merged for the latest set of website changes, CI does the same thing again but for https://web3.storage *and* it deploys that build to Cloudflare Pages as well, by mirroring the main branch for that tag to the `website-prod` branch. Cloudflare watches that branch for changes and rebuilds and deploys the latest to https://web3.storage so that http access is as fast as possible. The dnslink is set in the same way as for staging, so IPFS users get to fetch the production site over IPFS instead.