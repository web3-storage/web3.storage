-- Authenticator login
GRANT web_anon TO authenticator;
-- Web3.Storage user
GRANT web3_storage TO authenticator;
GRANT USAGE ON SCHEMA public TO web3_storage;
-- allow access to all tables/sequences/functions in the public schema currently
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO web3_storage;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO web3_storage;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO web3_storage;
-- allow access to new tables/sequences/functions that are created in the public schema in the future
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE ON TABLES TO web3_storage;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO web3_storage;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT EXECUTE ON FUNCTIONS TO web3_storage;