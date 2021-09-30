# Postgres <!-- omit in toc -->

## Local env

### 0. Local machine Setup

You will need to install docker (check official docker documentation) and postgres locally.

```bash
brew install postgres
```

### 1. Start Database and postgrest

```bash
cd docker
docker-compose up
```

### 2. Populate Database

```bash
psql service=local -f tables.sql
psql service=local -f functions.sql
# For reseting the database contente:
# psql service=local -f reset.sql
```
