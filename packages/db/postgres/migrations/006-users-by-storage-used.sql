ALTER TYPE used_storage ADD ATTRIBUTE total TEXT;

-- Because function return type has changed
DROP FUNCTION users_storage_used(integer, integer);

-- Get storage used for a specified user: uploaded, pinned and total
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
      SELECT COALESCE(SUM(c.dag_size), 0)
      FROM upload u
      JOIN content c ON c.cid = u.content_cid
      WHERE u.user_id = query_user_id::BIGINT
      AND u.deleted_at is null
    );

  pinned := 
    (
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
    ); 

  total := uploaded + pinned;

  SELECT  uploaded::TEXT,
          pinned::TEXT,
          total::TEXT
  INTO    used_storage;

  return used_storage;
END
$$;

CREATE OR REPLACE FUNCTION users_by_storage_used(
  from_percent INTEGER,
  to_percent INTEGER DEFAULT NULL
)
  RETURNS TABLE
    (
      name          TEXT,
      email         TEXT,
      storage_quota TEXT,
      storage_used  TEXT
    )
LANGUAGE plpgsql
AS
$$
DECLARE
  default_quota BIGINT := 1099511627776;
BEGIN
  RETURN QUERY
    SELECT  u.name                                          AS name,
            u.email                                         AS email,
            COALESCE(ut.value::BIGINT, default_quota)::TEXT AS storage_quota,
            (user_used_storage(u.id)).total                 AS storage_used
    FROM public.user u
    FULL OUTER JOIN user_tag ut ON u.id = ut.user_id
    WHERE (ut.tag IS NULL
        OR (ut.tag = 'StorageLimitBytes' AND ut.deleted_at IS NULL))
    AND (user_used_storage(u.id)).total::BIGINT 
            >= (from_percent::NUMERIC/100) * COALESCE(ut.value::BIGINT, default_quota)
    AND (to_percent IS NULL
        OR (user_used_storage(u.id)).total::BIGINT 
            < (to_percent::NUMERIC/100) * COALESCE(ut.value::BIGINT, default_quota))
    ORDER BY (user_used_storage(u.id)).total::BIGINT DESC;
END
$$;

DO 
$$
BEGIN
  -- Types for notification emails
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'email_type') THEN
    CREATE TYPE email_type AS ENUM 
      (
        'Used75PercentStorage',
        'Used80PercentStorage',
        'Used85PercentStorage',
        'Used90PercentStorage',
        'UsedOver100PercentStorage'
      );
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS email_notification_history 
(
  id              BIGSERIAL PRIMARY KEY,
  -- The id of the user being notified
  user_id         BIGINT NOT NULL REFERENCES public.user (id),
  -- The type of the email sent
  email_type      email_type NOT NULL,
  -- The unique id of the email service message
  message_id      TEXT NOT NULL,
  sent_at         TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);