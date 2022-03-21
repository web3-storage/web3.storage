CREATE OR REPLACE FUNCTION truncate_tables(username IN VARCHAR, schema_n in VARCHAR) RETURNS void AS $$
DECLARE
    statements CURSOR FOR
        SELECT tablename FROM pg_tables
        WHERE tableowner = username AND schemaname = schema_n;
BEGIN

    FOR stmt IN statements LOOP
        EXECUTE 'TRUNCATE TABLE ' || schema_n || '.' || quote_ident(stmt.tablename) || ' RESTART IDENTITY CASCADE;';
    END LOOP;
END;
$$ LANGUAGE plpgsql;


SELECT truncate_tables('postgres', 'public');
SELECT truncate_tables('postgres', 'cargo');

