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
```

Production vars are set in Github Actions secrets.

### 3. Ready to go

You can now start your development and run DB tests. The test setup has hooks to start your local docker containers and stop/clean them in the end.

## Local DB Setup

If you want to run your own local DB for development using this package DB client, you can easily do it as follows:

### 1. Start Database and postgrest

Start a docker compose with a Postgres Database and Postgrest.

```bash
npm start
```

### 2. Populate Database

```bash
node scripts/cli.js db-sql --cargo --testing
```

### 3. Ready to go

You can now interact with your local database. Its URL and Token are defined in the previous section.

Once you are done, the local setup can easily be stopped:

```bash
npm stop
```

If you'd like to also clear the database and all docker artifacts you can run

```
npm run stop:clean
```

### 4. Alter DB schema and migrations

1. Add the schema changes to `db/postgres` sql files as needed.

2. Apply the changes to the Postgres DB using:

    ```bash
    node scripts/cli.js --reset db-sql
    ```

3. Run the following which uses `openapi-typescript` to update `pg-rest-api-types.ts`, the TypeScript interface version of the OpenAPI schema for the updated DB:

    ```bash
    node scripts/cli.js pg-rest-api-types
    ```

4. Add the schema changes to `db-client-types.ts` as well.

5. If the schema changes include creating a new table, type or view update `reset.sql` as well.

6. Add the required migration script(s) to [postgres/migration](./postgres/migrations/) folder. Please follow the naming convention and add an incremental number suffix to the name of the migration file.

7. Once the PR is merged to main please add a comment to the [release-please](https://github.com/googleapis/release-please) PR pointing to the migrations script.  
    ie
    > Required migration [000-fix-peer_location.peer_id.sql](./postgres/migrations/000-fix-peer_location.peer_id.sql)
    

## DB package CLI
The `scripts/cli.js` to run some common operations on the database.

Please run
```
./scripts/cli.js --help
```
to find out more.

## Database Diagram

![image](https://user-images.githubusercontent.com/7295071/137729026-50aebb55-e89c-45ed-b636-b3e39cc53cc0.png)

Powered by [dbdiagram.io](https://dbdiagram.io/d/61546519825b5b014618caf6).
