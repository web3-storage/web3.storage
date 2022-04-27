CREATE OR REPLACE FUNCTION user_used_storage(query_user_id BIGINT) 
  RETURNS used_storage
  LANGUAGE plpgsql
AS
$$
DECLARE 
  used_storage  used_storage;
  uploaded      BIGINT;
  pinned        BIGINT;
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

  pinned := 
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

  total := uploaded + pinned;

  SELECT  uploaded::TEXT,
          pinned::TEXT,
          total::TEXT
  INTO    used_storage;

  return used_storage;
END
$$;
