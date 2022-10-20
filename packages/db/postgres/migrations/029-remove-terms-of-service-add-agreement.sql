ALTER TABLE terms_of_service RENAME TO agreement; 
ALTER INDEX terms_of_service_user_id_idx RENAME TO agreement_user_id_idx;
