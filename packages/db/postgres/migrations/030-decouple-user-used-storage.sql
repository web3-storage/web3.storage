CREATE INDEX CONCURRENTLY IF NOT EXISTS psa_pin_request_search_idx ON psa_pin_request (auth_key_id) INCLUDE (content_cid, deleted_at);

DROP INDEX IF EXISTS psa_pin_request_content_cid_idx;
DROP INDEX IF EXISTS psa_pin_request_deleted_at_idx;

CREATE OR REPLACE FUNCTION user_uploaded_storage(query_user_id BIGINT)
  RETURNS text
  LANGUAGE plpgsql
AS
$$
DECLARE
  total         BIGINT;
BEGIN
  total :=
    (
      SELECT COALESCE((
        SELECT SUM(dag_size)
        FROM (
          SELECT  c.cid,
                  c.dag_size
          FROM upload u
          JOIN content c ON c.cid = u.content_cid
          WHERE u.user_id = query_user_id::BIGINT
          AND u.deleted_at is null
          GROUP BY c.cid,
                  c.dag_size
        ) AS uploaded_content), 0)
    );
  return (total)::TEXT;
END
$$;

CREATE OR REPLACE FUNCTION user_psa_storage(query_user_id BIGINT)
  RETURNS text
  LANGUAGE plpgsql
AS
$$
DECLARE
  total         BIGINT;
BEGIN
  total :=
    (
      SELECT COALESCE((
        SELECT SUM(dag_size)
        FROM (
          SELECT  psa_pr.content_cid,
                  c.dag_size
          FROM psa_pin_request psa_pr
          JOIN content c ON c.cid = psa_pr.content_cid
          JOIN auth_key a ON a.id = psa_pr.auth_key_id
          WHERE a.user_id = query_user_id::BIGINT
          AND psa_pr.deleted_at is null
          GROUP BY psa_pr.content_cid,
                  c.dag_size
        ) AS pinned_content), 0)
    );
  return (total)::TEXT;
END
$$;

CREATE OR REPLACE FUNCTION user_used_storage(query_user_id BIGINT)
  RETURNS stored_bytes
  LANGUAGE plpgsql
AS
$$
DECLARE
  used_storage  stored_bytes;
  uploaded      BIGINT := (user_uploaded_storage(query_user_id))::BIGINT;
  psa_pinned    BIGINT := (user_psa_storage(query_user_id))::BIGINT;
  total         BIGINT;
BEGIN
  total := uploaded + psa_pinned;

  SELECT  uploaded::TEXT,
          psa_pinned::TEXT,
          total::TEXT
  INTO    used_storage;

  return used_storage;
END
$$;
