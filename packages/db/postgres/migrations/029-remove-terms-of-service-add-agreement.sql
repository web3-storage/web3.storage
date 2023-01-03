-- no longer unique
ALTER TABLE terms_of_service DROP CONSTRAINT terms_of_service_user_id_agreement_key;

-- rename table terms_of_service -> agreement
ALTER TABLE terms_of_service RENAME TO agreement; 
-- and things named after old table name
ALTER INDEX terms_of_service_user_id_idx RENAME TO agreement_user_id_idx;
ALTER TABLE agreement RENAME CONSTRAINT terms_of_service_pkey TO agreement_pkey;
ALTER TABLE agreement RENAME CONSTRAINT terms_of_service_user_id_fkey TO agreement_user_id_fkey;
