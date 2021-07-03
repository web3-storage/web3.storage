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
