DROP FUNCTION IF EXISTS user_auth_keys_list;

CREATE OR REPLACE FUNCTION user_auth_keys_list(query_user_id BIGINT, include_deleted BOOLEAN default false)
  RETURNS TABLE
          (
              "id"                text,
              "name"              text,
              "secret"            text,
              "created"           timestamptz,
              "has_uploads"           boolean
          )
  LANGUAGE sql
AS
$$
SELECT (ak.id)::TEXT AS id,
       ak.name AS name,
       ak.secret AS secret,
       ak.inserted_at AS created,
       EXISTS(SELECT 42 FROM upload u WHERE u.auth_key_id = ak.id) AS has_uploads
  FROM auth_key ak
 WHERE ak.user_id = query_user_id AND 
  (include_deleted OR ak.deleted_at IS NULL)
$$;
