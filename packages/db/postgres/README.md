# Postgres <!-- omit in toc -->

## Database Diagram

![image](https://user-images.githubusercontent.com/7295071/135415822-be854ec5-d1e2-4588-a951-f287b60b65be.png)

Powered by [dbdiagram.io](https://dbdiagram.io/d/61546519825b5b014618caf6).

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
DATABASE_URL=http://localhost:3000
# Create a token, for role "postgres", using secret value PGRST_JWT_SECRET from './postgres/docker/docker-compose.yml'
# https://postgrest.org/en/v8.0/tutorials/tut1.html#step-3-sign-a-token
DATABASE_TOKEN=<jwt token>

# Connection string for locally running postgres used in tests
DATABASE_CONNECTION=postgres://postgres:postgres@127.0.0.1:5432/postgres

# RO dagcargo credentials for fdw in tests
DAG_CARGO_HOST=<get from password vault - replica>
DAG_CARGO_USER=<get from password vault - replica>
DAG_CARGO_PASSWORD=<get from password vault - replica>
DAG_CARGO_DATABASE=<get from password vault - replica>
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
