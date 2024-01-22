DROP FUNCTION IF EXISTS json_arr_to_text_arr;
DROP FUNCTION IF EXISTS json_arr_to_json_element_array;
DROP FUNCTION IF EXISTS create_key;
DROP FUNCTION IF EXISTS create_upload;
DROP FUNCTION IF EXISTS upsert_pin;
DROP FUNCTION IF EXISTS upsert_pins;
DROP FUNCTION IF EXISTS user_uploaded_storage;
DROP FUNCTION IF EXISTS user_psa_storage;
DROP FUNCTION IF EXISTS user_used_storage;
DROP FUNCTION IF EXISTS user_auth_keys_list;
DROP FUNCTION IF EXISTS find_deals_by_content_cids;
DROP FUNCTION IF EXISTS upsert_user;
DROP TYPE IF EXISTS stored_bytes;

-- transform a JSON array property into an array of SQL text elements
CREATE OR REPLACE FUNCTION json_arr_to_text_arr(_json json)
  RETURNS text[] LANGUAGE sql IMMUTABLE PARALLEL SAFE AS
'SELECT ARRAY(SELECT json_array_elements_text(_json))';

-- transform a JSON array property into an array of SQL json elements
CREATE OR REPLACE FUNCTION json_arr_to_json_element_array(_json json)
  RETURNS json[] LANGUAGE sql IMMUTABLE PARALLEL SAFE AS
'SELECT ARRAY(SELECT * FROM json_array_elements(_json))';

CREATE OR REPLACE FUNCTION create_key(data json) RETURNS TEXT
    LANGUAGE plpgsql
    volatile
    PARALLEL UNSAFE
AS
$$
DECLARE
  inserted_key_id BIGINT;
BEGIN
  insert into auth_key (name, secret, user_id, inserted_at, updated_at)
  VALUES (data ->> 'name',
          data ->> 'secret',
          (data ->> 'user_id')::BIGINT,
          (data ->> 'inserted_at')::timestamptz,
          (data ->> 'updated_at')::timestamptz)
  returning id into inserted_key_id;

  return (inserted_key_id)::TEXT;
END
$$;

-- Creates a content table, with relative pins and pin_requests
CREATE OR REPLACE FUNCTION create_content(data json) RETURNS TEXT
    LANGUAGE plpgsql
    volatile
    PARALLEL UNSAFE
AS
$$
DECLARE
  pin json;
  pin_result_id BIGINT;
  inserted_cid TEXT;
BEGIN
  -- Set timeout as imposed by heroku
  SET LOCAL statement_timeout = '30s';

  -- Add to content table if new
  insert into content (cid, dag_size, updated_at, inserted_at)
  values (data ->> 'content_cid',
          (data ->> 'dag_size')::BIGINT,
          (data ->> 'updated_at')::timestamptz,
          (data ->> 'inserted_at')::timestamptz)
    ON CONFLICT ( cid ) DO NOTHING
  returning cid into inserted_cid;

  -- Iterate over received pins
  foreach pin in array json_arr_to_json_element_array(data -> 'pins')
  loop
        INSERT INTO pin_location (peer_id, peer_name, ipfs_peer_id, region)
          SELECT * FROM (
            SELECT pin -> 'location' ->> 'peer_id' AS peer_id,
                   pin -> 'location' ->> 'peer_name' AS peer_name,
                   pin -> 'location' ->> 'ipfs_peer_id' AS ipfs_peer_id,
                   pin -> 'location' ->> 'region' AS region
          ) AS tmp
          WHERE NOT EXISTS (
            SELECT 42 FROM pin_location WHERE peer_id = pin -> 'location' ->> 'peer_id'
          );

        INSERT INTO pin (content_cid, status, pin_location_id, updated_at, inserted_at)
          SELECT data ->> 'content_cid' AS content_cid,
                 (pin ->> 'status')::pin_status_type AS status,
                 id AS pin_location_id,
                 (data ->> 'updated_at')::timestamptz AS updated_at,
                 (data ->> 'inserted_at')::timestamptz AS inserted_at
            FROM pin_location
           WHERE peer_id = pin -> 'location' ->> 'peer_id'
        -- Force update on conflict to get result, otherwise needs a follow up select
        ON CONFLICT ( content_cid, pin_location_id ) DO UPDATE
          SET "updated_at" = (data ->> 'updated_at')::timestamptz
        returning id into pin_result_id;
  end loop;

  return (inserted_cid);
END
$$;

CREATE OR REPLACE FUNCTION create_content_with_pin_sync_request(data json) RETURNS TEXT
    LANGUAGE plpgsql
    volatile
    PARALLEL UNSAFE
AS
$$
DECLARE
  pin json;
  pin_result_id BIGINT;
  inserted_cid TEXT;
BEGIN
  -- Set timeout as imposed by heroku
  SET LOCAL statement_timeout = '30s';

  -- Add to content table if new
  insert into content (cid, dag_size, updated_at, inserted_at)
  values (data ->> 'content_cid',
          (data ->> 'dag_size')::BIGINT,
          (data ->> 'updated_at')::timestamptz,
          (data ->> 'inserted_at')::timestamptz)
    ON CONFLICT ( cid ) DO NOTHING
  returning cid into inserted_cid;

  -- Iterate over received pins
  foreach pin in array json_arr_to_json_element_array(data -> 'pins')
  loop
        INSERT INTO pin_location (peer_id, peer_name, ipfs_peer_id, region)
          SELECT * FROM (
            SELECT pin -> 'location' ->> 'peer_id' AS peer_id,
                   pin -> 'location' ->> 'peer_name' AS peer_name,
                   pin -> 'location' ->> 'ipfs_peer_id' AS ipfs_peer_id,
                   pin -> 'location' ->> 'region' AS region
          ) AS tmp
          WHERE NOT EXISTS (
            SELECT 42 FROM pin_location WHERE peer_id = pin -> 'location' ->> 'peer_id'
          );

        INSERT INTO pin (content_cid, status, pin_location_id, updated_at, inserted_at)
          SELECT data ->> 'content_cid' AS content_cid,
                 (pin ->> 'status')::pin_status_type AS status,
                 id AS pin_location_id,
                 (data ->> 'updated_at')::timestamptz AS updated_at,
                 (data ->> 'inserted_at')::timestamptz AS inserted_at
            FROM pin_location
           WHERE peer_id = pin -> 'location' ->> 'peer_id'
        -- Force update on conflict to get result, otherwise needs a follow up select
        ON CONFLICT ( content_cid, pin_location_id ) DO UPDATE
          SET "updated_at" = (data ->> 'updated_at')::timestamptz
        returning id into pin_result_id;

        -- Create a Pin Sync Request if not pinned
        IF (pin ->> 'status')::pin_status_type != ('Pinned')::pin_status_type THEN
          insert into pin_sync_request (pin_id, inserted_at)
          values (pin_result_id,
                  (data ->> 'inserted_at')::timestamptz)
          ON CONFLICT ( pin_id ) DO NOTHING;
        END IF;
  end loop;

  return (inserted_cid);
END
$$;

-- Creates an upload with relative content, pins and backups.
CREATE OR REPLACE FUNCTION create_upload(data json) RETURNS TEXT
    LANGUAGE plpgsql
    volatile
    PARALLEL UNSAFE
AS
$$
DECLARE
  inserted_upload_id BIGINT;

BEGIN
  -- Set timeout as imposed by heroku
  SET LOCAL statement_timeout = '30s';

  PERFORM create_content(data);

  insert into upload as upld (user_id,
                      auth_key_id,
                      content_cid,
                      source_cid,
                      type,
                      name,
                      inserted_at,
                      updated_at,
                      backup_urls)
  values ((data ->> 'user_id')::BIGINT,
            (data ->> 'auth_key_id')::BIGINT,
            data ->> 'content_cid',
            data ->> 'source_cid',
            (data ->> 'type')::upload_type,
            data ->> 'name',
            (data ->> 'inserted_at')::timestamptz,
            (data ->> 'updated_at')::timestamptz,
            json_arr_to_text_arr(data -> 'backup_urls'))
  ON CONFLICT ( user_id, source_cid ) DO UPDATE
    SET "updated_at" = (data ->> 'updated_at')::timestamptz,
        "name" = data ->> 'name',
        "deleted_at" = null,
        "backup_urls" = upld.backup_urls || json_arr_to_text_arr(data -> 'backup_urls')
  returning id into inserted_upload_id;

  return (inserted_upload_id)::TEXT;
END
$$;

-- Creates a pin request with relative content, pins, pin_requests and backups.
CREATE OR REPLACE FUNCTION create_psa_pin_request(data json) RETURNS TEXT
    LANGUAGE plpgsql
    volatile
    PARALLEL UNSAFE
AS
$$
DECLARE
-- TODO - Validate UUID type is available
  inserted_pin_request_id TEXT;
BEGIN
  -- Set timeout as imposed by heroku
  SET LOCAL statement_timeout = '30s';

  PERFORM create_content_with_pin_sync_request(data);

  insert into psa_pin_request (
                      auth_key_id,
                      content_cid,
                      source_cid,
                      name,
                      origins,
                      meta,
                      inserted_at,
                      updated_at
                    )
  values (
            (data ->> 'auth_key_id')::BIGINT,
            data ->> 'content_cid',
            data ->> 'source_cid',
            data ->> 'name',
            (data ->> 'origins')::jsonb,
            (data ->> 'meta')::jsonb,
            (data ->> 'inserted_at')::timestamptz,
            (data ->> 'updated_at')::timestamptz
          )

  returning id into inserted_pin_request_id;

-- TODO - Validate and use UUID type
  return (inserted_pin_request_id)::TEXT;
END
$$;

CREATE OR REPLACE FUNCTION upsert_pin(data json) RETURNS TEXT
    LANGUAGE plpgsql
    volatile
    PARALLEL UNSAFE
AS
$$
DECLARE
  pin_result_id BIGINT;
BEGIN
  -- DATA => content_cid, pin(status, location(peer_id, peer_name, region))

  -- Add to pin_location table if new
  INSERT INTO pin_location (peer_id, peer_name, ipfs_peer_id, region)
    SELECT * FROM (
      SELECT data -> 'pin' -> 'location' ->> 'peer_id' AS peer_id,
             data -> 'pin' -> 'location' ->> 'peer_name' AS peer_name,
             data -> 'pin' -> 'location' ->> 'ipfs_peer_id' AS ipfs_peer_id,
             data -> 'pin' -> 'location' ->> 'region' AS region
    ) AS tmp
    WHERE NOT EXISTS (
      SELECT 42 FROM pin_location WHERE peer_id = data -> 'pin' -> 'location' ->> 'peer_id'
    );

  -- Add to pin table if new
  insert into pin (content_cid, status, pin_location_id, updated_at)
    SELECT data ->> 'content_cid' AS content_cid,
           (data -> 'pin' ->> 'status')::pin_status_type AS status,
           id AS pin_location_id,
           (NOW())::timestamptz AS updated_at
      FROM pin_location
     WHERE peer_id = data -> 'pin' -> 'location' ->> 'peer_id'
  ON CONFLICT ( content_cid, pin_location_id ) DO UPDATE
        SET "status" = (data -> 'pin' ->> 'status')::pin_status_type,
            "updated_at" = NOW()
  returning id into pin_result_id;

  return (pin_result_id)::TEXT;
END
$$;

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

CREATE TYPE stored_bytes AS (uploaded TEXT, psa_pinned TEXT, total TEXT);

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

CREATE OR REPLACE FUNCTION users_by_storage_used(
  from_percent INTEGER,
  to_percent INTEGER DEFAULT NULL,
  user_id_gt BIGINT DEFAULT 0,
  user_id_lte BIGINT DEFAULT NULL
)
  RETURNS TABLE
    (
      id            TEXT,
      name          TEXT,
      email         TEXT,
      storage_quota TEXT,
      storage_used  TEXT
    )
LANGUAGE plpgsql
AS
$$
DECLARE
  -- Default storage quota 1TiB = 1099511627776 bytes
  default_quota BIGINT := 1099511627776;
BEGIN
  RETURN QUERY
    WITH user_account AS (
      SELECT  u.id::TEXT                                        AS id,
              u.name                                            AS name,
              u.email                                           AS email,
              COALESCE(ut.value::BIGINT, default_quota)::TEXT   AS storage_quota,
              (user_used_storage(u.id)).total::TEXT             AS storage_used
      FROM public.user u
      LEFT JOIN user_tag ut ON u.id = ut.user_id
      WHERE (ut.tag IS NULL OR ut.tag = 'StorageLimitBytes')
      AND ut.deleted_at IS NULL
      AND NOT EXISTS (
        SELECT 42
        FROM user_tag r
        WHERE u.id = r.user_id
        AND r.tag = 'HasAccountRestriction'
        AND r.value ILIKE 'true'
        AND r.deleted_at IS NULL
      )
      AND u.id > user_id_gt
      AND u.id <= user_id_lte
    )
    SELECT *
    FROM user_account
    WHERE user_account.storage_used::BIGINT >= (from_percent/100::NUMERIC) * user_account.storage_quota::BIGINT
    AND (to_percent IS NULL OR user_account.storage_used::BIGINT < (to_percent/100::NUMERIC) * user_account.storage_quota::BIGINT)
    ORDER BY user_account.storage_used::BIGINT DESC;
END
$$;

CREATE OR REPLACE FUNCTION upsert_pins(data json) RETURNS TEXT[]
    LANGUAGE plpgsql
    volatile
    PARALLEL UNSAFE
AS
$$
DECLARE
  pin json;
  pin_ids TEXT[];
BEGIN
  FOREACH pin IN array json_arr_to_json_element_array(data -> 'pins')
  LOOP
    SELECT pin_ids || upsert_pin(pin -> 'data') INTO pin_ids;
  END LOOP;

  RETURN pin_ids;
END
$$;

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

CREATE OR REPLACE FUNCTION find_deals_by_content_cids(cids text[])
    RETURNS TABLE
            (
                status              text,
                "created"           timestamptz,
                "updated"           timestamptz,
                "dealId"            bigint,
                "dataModelSelector" text,
                "statusText"        text,
                "dealActivation"    timestamptz,
                "dealExpiration"    timestamptz,
                "storageProvider"   text,
                "pieceCid"          text,
                "batchRootCid"      text,
                "dataCid"           text
            )
    LANGUAGE sql
    STABLE
    PARALLEL SAFE
AS
$$
SELECT COALESCE(de.status, 'queued') as status,
       de.entry_created              as created,
       de.entry_last_updated         as updated,
       de.deal_id                    as dealId,
       ae.datamodel_selector         as dataModelSelector,
       de.status_meta                as statusText,
       de.start_time                 as dealActivation,
       de.end_time                   as dealExpiration,
       de.provider                   as storageProvider,
       a.piece_cid                   as pieceCid,
       ae.aggregate_cid              as batchRootCid,
       ae.cid_v1                     as dataCid
FROM cargo.aggregate_entries ae
         join cargo.aggregates a using (aggregate_cid)
         LEFT JOIN cargo.deals de USING (aggregate_cid)
WHERE ae.cid_v1 = ANY (cids)
ORDER BY de.entry_last_updated
$$;


-- a custom UPSERT operation for user account, so that we can distinguish between
-- newly inserted users and updated ones.
CREATE OR REPLACE FUNCTION upsert_user(_name TEXT, _picture TEXT, _email TEXT, _issuer TEXT, _github TEXT, _public_address TEXT)
RETURNS TABLE (
  "id" TEXT,
  "issuer" TEXT,
  "inserted" BOOLEAN
)
LANGUAGE plpgsql
AS
$$
#variable_conflict use_column
DECLARE
  inserted BOOLEAN;

BEGIN
  SELECT (COUNT(id) = 0) into inserted FROM public.user WHERE issuer = _issuer;

  RETURN QUERY
  INSERT INTO public.user AS u (name, picture, email, issuer, github, public_address) 
  VALUES (_name, _picture, _email, _issuer, _github, _public_address)
  ON CONFLICT (issuer) DO UPDATE
  SET 
    name = EXCLUDED.name,
    picture = EXCLUDED.picture,
    email = EXCLUDED.email,
    github = EXCLUDED.github,
    public_address = EXCLUDED.public_address
  RETURNING u.id::TEXT, u.issuer, inserted;

END
$$;
