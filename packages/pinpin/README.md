<h1 align="center">⁂<br/>web3.storage</h1>
<p align="center">Pin pins on Piñata ✨</p>

Backup all content pinned on our IPFS Cluster to Piñata's infra.

It's a task queue! Fetch the oldest 600 PinRequests from the DB and pin them on Piñata, then delete the PinRequests from the db when successfully submitted.
- At the time of writing the Fauna query to fetch PinRequests hits errors if a batch size other than 600 is used.
- We can only upload to Piñata at 3req/s max, as they have rate-limiting in place.

## Getting started

Ensure you have all the dependencies, by running `npm i` in the parent project.

To run this locally you will need the following in your `packages/cron/.env` file:

```ini
FAUNA_KEY="<your key here>"
PINATA_JWT="<your jwt here>"
```

You also need to have:

- a dev account and db set up on FaunaDB with the latest schema imported as per [../db/README.md](../db/README.md)

Run the job:

```sh
npm run start
```

## Running on Heroku

A Procfile is added to the root of the monorepo to define the `pinpin` process.
- we have a web3-storage team, so run it there.
- set 