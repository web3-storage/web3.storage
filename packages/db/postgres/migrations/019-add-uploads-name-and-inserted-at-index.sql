CREATE INDEX CONCURRENTLY IF NOT EXISTS upload_name_idx ON upload (name);
CREATE INDEX CONCURRENTLY IF NOT EXISTS upload_inserted_at_idx ON upload (inserted_at);
