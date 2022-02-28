CREATE TYPE used_storage AS (uploaded TEXT, pinned TEXT);

DROP FUNCTION user_used_storage(bigint);

CREATE OR REPLACE FUNCTION user_used_storage(query_user_id BIGINT) 
RETURNS used_storage
LANGUAGE plpgsql
AS
$$
DECLARE used_storage used_storage;
BEGIN
  SELECT COALESCE(SUM(c.dag_size), 0)
  INTO used_storage.uploaded::TEXT
  FROM upload u
  JOIN content c ON c.cid = u.content_cid
  WHERE u.user_id = query_user_id::BIGINT
  AND u.deleted_at is null;

  -- NOTE: auth_key.deleted_at is NOT included in the where clause, since the 
  -- auth_key is only used to authorize a request.
  SELECT COALESCE((
    SELECT COALESCE(SUM(c.dag_size), 0)
    FROM psa_pin_request psa_pr
    JOIN content c ON c.cid = psa_pr.content_cid
    JOIN pin p ON p.content_cid = psa_pr.content_cid
    JOIN auth_key a ON a.id = psa_pr.auth_key_id
    WHERE a.user_id = query_user_id::BIGINT
    AND psa_pr.deleted_at is null
    AND p.status = 'Pinned'
    GROUP BY p.status
  ), 0) 
  INTO used_storage.pinned::TEXT;

  return used_storage;
END
$$;