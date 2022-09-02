-- Due to the parameters differing from the old function definition, if we don't drop the old one then it's not replaced.
DROP FUNCTION IF EXISTS user_used_storage;

CREATE OR REPLACE FUNCTION user_used_storage(query_user_id BIGINT)
  RETURNS stored_bytes
  LANGUAGE plpgsql
AS
$$
DECLARE
  used_storage  stored_bytes;
  uploaded      BIGINT;
  psa_pinned    BIGINT;
  total         BIGINT;
BEGIN
  uploaded :=
    (
      SELECT COALESCE((
        SELECT SUM(dag_size) 
        FROM (
          SELECT  c.cid,
                  c.dag_size
          FROM upload u
          JOIN content c ON c.cid = u.content_cid
          JOIN pin p ON p.content_cid = u.content_cid
          WHERE u.user_id = query_user_id::BIGINT
          AND u.deleted_at is null
          AND p.status = 'Pinned'
          GROUP BY c.cid,
                  c.dag_size
        ) AS uploaded_content), 0)
    );

  psa_pinned :=
    (
      SELECT COALESCE((
        SELECT SUM(dag_size)
        FROM (
          SELECT  psa_pr.content_cid,
                  c.dag_size
          FROM psa_pin_request psa_pr
          JOIN content c ON c.cid = psa_pr.content_cid
          JOIN pin p ON p.content_cid = psa_pr.content_cid
          JOIN auth_key a ON a.id = psa_pr.auth_key_id
          WHERE a.user_id = query_user_id::BIGINT
          AND psa_pr.deleted_at is null
          AND p.status = 'Pinned'
          GROUP BY psa_pr.content_cid,
                  c.dag_size
        ) AS pinned_content), 0)
    );

  total := uploaded + psa_pinned;

  SELECT  uploaded::TEXT,
          psa_pinned::TEXT,
          total::TEXT
  INTO    used_storage;

  return used_storage;
END
$$;
