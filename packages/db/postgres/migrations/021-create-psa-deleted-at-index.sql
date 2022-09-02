CREATE INDEX CONCURRENTLY IF NOT EXISTS psa_pin_request_deleted_at_idx ON psa_pin_request (deleted_at) INCLUDE (content_cid, auth_key_id);
