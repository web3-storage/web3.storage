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
DATABASE=postgres

FAUNA_KEY="<your key here>"
PINATA_JWT="<your jwt here>"

# PostgREST API URL
PG_REST_URL=http://localhost:3000
# PostgREST API token, for role "postgres", using secret value PGRST_JWT_SECRET from './postgres/docker/docker-compose.yml'
# https://postgrest.org/en/v8.0/tutorials/tut1.html#step-3-sign-a-token
PG_REST_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoicG9zdGdyZXMifQ.oM0SXF31Vs1nfwCaDxjlczE237KcNKhTpKEYxMX-jEU
```

You also need to have:

- a dev account and db set up on FaunaDB with the latest schema imported as per [../db/README.md](../db/README.md)

Run the job:

```sh
npm run start
```

## Running on Heroku

Deploy using the `heroku` command. Install the `heroku` cli and log in with `heroku login`. A Procfile is added to the root of the monorepo to define the `pinpin` process. It's a worker that should run on a single dyno. There is no `web` worker, which heroku assumes there will be, so we have to explicitly scale the dynos to make that the case. Deployment uses git, and you get `heroku` remote to push to, added to your repo automatically.

Deploying from scratch looks like this:

```console
# create the app as a resource under the web3-storage team, and add `heroku` as git remote
$ heroku create --team=web3-storage web3-storage

# set the env (or better, use the webui for secrets)
$ heroku config.set FAUNA_KEY=*** PINATA_JWT=***

# deploy the local pinpin branch to heroku via git (you might push from a local main branch instead.)
$ git push heroku pinpin:main

# disable http access by removing all web dynos and ensure only 1 pinpin is running.
$ heroku ps:scale web=0 pinpin=1
```

If you are on the web3-storage heroku team you can see the logs here: https://dashboard.heroku.com/apps/web3-storage/logs
