ALTER TABLE "psa_pin_request" ADD COLUMN IF NOT EXISTS "backup_urls" TEXT[];
CREATE INDEX CONCURRENTLY IF NOT EXISTS psa_pin_request_backup_urls_idx ON psa_pin_request (backup_urls);
