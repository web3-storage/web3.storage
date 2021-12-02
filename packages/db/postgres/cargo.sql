CREATE SCHEMA IF NOT EXISTS cargo;

-- Import dag cargo schema
IMPORT FOREIGN SCHEMA cargo
    LIMIT TO (aggregate_entries, aggregates, deals, dags)
    FROM SERVER dag_cargo_server
    INTO cargo;

-- Grant permisions to web3_storage
GRANT USAGE ON SCHEMA cargo TO web3_storage;
GRANT SELECT ON ALL TABLES IN SCHEMA cargo TO web3_storage;
ALTER DEFAULT PRIVILEGES IN SCHEMA cargo GRANT SELECT ON TABLES TO web3_storage;