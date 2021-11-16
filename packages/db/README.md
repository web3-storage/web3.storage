# DB

web3.storage currently uses Postgres and its setup can be seen next.

## Getting started

### 1. Install postgres and docker

You will need to install docker (check official docker documentation) and postgres locally.

```bash
brew install postgres
```

### 2. Define local env vars

Inside the `/packages/db` folder create a file called `.env.local` with the following content.

```ini
# PostgREST API URL
PG_REST_URL=http://localhost:3000
# PostgREST API token, for role "postgres", using secret value PGRST_JWT_SECRET from './postgres/docker/docker-compose.yml'
# https://postgrest.org/en/v8.0/tutorials/tut1.html#step-3-sign-a-token
PG_REST_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoicG9zdGdyZXMifQ.oM0SXF31Vs1nfwCaDxjlczE237KcNKhTpKEYxMX-jEU

# Connection string for locally running postgres used in tests
PG_CONNECTION=postgres://postgres:postgres@127.0.0.1:5432/postgres

# Read-only `dagcargo` credentials for "foreign data wrapper" (fdw) in tests
DAG_CARGO_HOST=<get from password vault - dagcargo replica>
DAG_CARGO_USER=<get from password vault - dagcargo replica>
DAG_CARGO_PASSWORD=<get from password vault - dagcargo replica>
DAG_CARGO_DATABASE=<get from password vault - dagcargo replica>
```

Production vars are set in Github Actions secrets.

### 3. Ready to go

You can now start your development and run DB tests. The test setup has hooks to start your local docker containers and stop/clean them in the end.

## Local DB Setup

If you want to run your own local DB for development using this package DB client, you can easily do it as follows:

### 1. Start Database and postgrest

Start a docker compose with a Postgres Database and Postgrest.

```bash
node scripts/cli.js db --start --project web3-storage
```

### 2. Populate Database

```bash
node scripts/cli.js db-sql --cargo --testing
```

### 3. Ready to go

You can now interact with your local database. Its URL and Token are defined in the previous section.

Once you are done, the local setup can easily be stopped and cleaned using:

```bash
node scripts/cli.js db --stop --clean --project web3-storage
```

### 4. Alter DB schema

In order for your changes to the DB schema to be reflected in Postgres you need to run an `openapi-typescript` script:

```bash
node scripts/cli.js db-sql
```

`pg-rest-api-types.ts` stores the types of the various DB tables and their columns.
In order to get them updated after a change to your db structure you can run:

```bash
node scripts/cli.js pg-rest-api-types
```

Do not forget to update `db-client-types.ts` to reflect your changes to the schema.

If you're creating a new table, type or view please remember to update `reset.sql` as well.

## Database Diagram

![image](https://user-images.githubusercontent.com/7295071/137729026-50aebb55-e89c-45ed-b636-b3e39cc53cc0.png)

Powered by [dbdiagram.io](https://dbdiagram.io/d/61546519825b5b014618caf6).
