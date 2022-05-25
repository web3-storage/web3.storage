ALTER TYPE used_storage ADD ATTRIBUTE total TEXT;

-- Because function return type has changed
DROP FUNCTION user_used_storage(bigint);

-- Get storage used for a specified user: uploaded, pinned and total
CREATE OR REPLACE FUNCTION user_used_storage(query_user_id BIGINT)
  RETURNS used_storage
  LANGUAGE plpgsql
AS
$$
DECLARE
  used_storage  used_storage;
  uploaded      BIGINT;
  psa_pinned        BIGINT;
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
    SELECT *
    FROM (
      SELECT  u.id::TEXT                                      AS id,
              u.name                                          AS name,
              u.email                                         AS email,
              COALESCE(ut.value::BIGINT, default_quota)::TEXT AS storage_quota,
              (user_used_storage(u.id)).total::TEXT         AS storage_used
      FROM public.user u
      LEFT JOIN user_tag ut ON u.id = ut.user_id
      WHERE ut.tag IS NULL OR (ut.tag = 'StorageLimitBytes' AND ut.deleted_at IS NULL)
      ) user_account
    WHERE user_account.storage_used::BIGINT >= (from_percent/100::NUMERIC) * user_account.storage_quota::BIGINT
    AND (to_percent IS NULL OR user_account.storage_used::BIGINT < (to_percent/100::NUMERIC) * user_account.storage_quota::BIGINT)
    ORDER BY user_account.storage_used::BIGINT DESC;
END
$$;

DO
$$
BEGIN
  -- Types for notification emails
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'email_type') THEN
    CREATE TYPE email_type AS ENUM
      (
        'User75PercentStorage',
        'User80PercentStorage',
        'User85PercentStorage',
        'User90PercentStorage',
        'User100PercentStorage',
        'AdminStorageExceeded'
      );
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS email_history
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
