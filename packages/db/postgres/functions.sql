DROP FUNCTION IF EXISTS json_arr_to_text_arr;
DROP FUNCTION IF EXISTS json_arr_to_json_element_array;
DROP FUNCTION IF EXISTS create_key;
DROP FUNCTION IF EXISTS create_upload;
DROP FUNCTION IF EXISTS upsert_pin;
DROP FUNCTION IF EXISTS user_used_storage;
DROP FUNCTION IF EXISTS user_keys_list;
DROP FUNCTION IF EXISTS content_dag_size_total;
DROP FUNCTION IF EXISTS pin_dag_size_total;
DROP FUNCTION IF EXISTS find_deals_by_content_cids;
DROP FUNCTION IF EXISTS publish_name_record;

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

CREATE OR REPLACE FUNCTION create_upload(data json) RETURNS TEXT
    LANGUAGE plpgsql
    volatile
    PARALLEL UNSAFE
AS
$$
DECLARE
  backup_url TEXT;
  pin json;
  pin_result_id BIGINT;
  pin_location_result_id BIGINT;
  inserted_upload_id BIGINT;
BEGIN
  -- Set timeout as imposed by heroku
  SET LOCAL statement_timeout = '30s';

  -- Add to content table if new
  insert into content (cid, dag_size, updated_at, inserted_at)
  values (data ->> 'content_cid',
          (data ->> 'dag_size')::BIGINT,
          (data ->> 'updated_at')::timestamptz,
          (data ->> 'inserted_at')::timestamptz)
    ON CONFLICT ( cid ) DO NOTHING;
  
  -- Add to pin_request table if new
  insert into pin_request (content_cid, attempts, updated_at, inserted_at)
  values (data ->> 'content_cid',
          0,
          (data ->> 'updated_at')::timestamptz,
          (data ->> 'inserted_at')::timestamptz)
    ON CONFLICT ( content_cid ) DO NOTHING;

  -- Iterate over received pins
  foreach pin in array json_arr_to_json_element_array(data -> 'pins')
  loop
        -- Add to pin_location table if new
        insert into pin_location (peer_id, peer_name, region)
        values (pin -> 'location' ->> 'peer_id',
                pin -> 'location' ->> 'peer_name',
                pin -> 'location' ->> 'region')
        -- Force update on conflict to get result, otherwise needs a follow up select
        ON CONFLICT ( peer_id ) DO UPDATE
          SET "peer_name" = pin -> 'location' ->> 'peer_name',
              "region" = pin -> 'location' ->> 'region'
        returning id into pin_location_result_id;

        insert into pin (content_cid, status, pin_location_id, updated_at, inserted_at)
        values (data ->> 'content_cid',
                (pin ->> 'status')::pin_status_type,
                pin_location_result_id,
                (data ->> 'updated_at')::timestamptz,
                (data ->> 'inserted_at')::timestamptz)
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

  insert into upload (user_id,
                      auth_key_id,
                      content_cid,
                      source_cid,
                      type,
                      name,
                      inserted_at,
                      updated_at)
  values ((data ->> 'user_id')::BIGINT,
            (data ->> 'auth_key_id')::BIGINT,
            data ->> 'content_cid',
            data ->> 'source_cid',
            (data ->> 'type')::upload_type,
            data ->> 'name',
            (data ->> 'inserted_at')::timestamptz,
            (data ->> 'updated_at')::timestamptz)
  ON CONFLICT ( user_id, source_cid ) DO UPDATE
    SET "updated_at" = (data ->> 'updated_at')::timestamptz,
        "name" = data ->> 'name',
        "deleted_at" = null
  returning id into inserted_upload_id;

  foreach backup_url in array json_arr_to_text_arr(data -> 'backup_urls')
  loop
    -- insert into backup with update
    insert into backup (upload_id,
                        url,
                        inserted_at)
    values (inserted_upload_id,
            backup_url,
            (data ->> 'inserted_at')::timestamptz)
    ON CONFLICT ( url ) DO NOTHING;
  end loop;

  return (inserted_upload_id)::TEXT;
END
$$;

CREATE OR REPLACE FUNCTION upsert_pin(data json) RETURNS TEXT
    LANGUAGE plpgsql
    volatile
    PARALLEL UNSAFE
AS
$$
DECLARE
  pin_location_result_id BIGINT;
  pin_result_id BIGINT;
BEGIN
  -- DATA => content_cid, pin(status, location(peer_id, peer_name, region))

  -- Add to pin_location table if new
  insert into pin_location (peer_id, peer_name, region)
  values (data -> 'pin' -> 'location' ->> 'peer_id',
          data -> 'pin' -> 'location' ->> 'peer_name',
          data -> 'pin' -> 'location' ->> 'region')
  ON CONFLICT ( peer_id ) DO UPDATE
          SET "peer_name" = data -> 'pin' -> 'location' ->> 'peer_name',
              "region" = data -> 'pin' -> 'location' ->> 'region'
  returning id into pin_location_result_id;

  -- Add to pin table if new
  insert into pin (content_cid, status, pin_location_id, updated_at)
  values (data ->> 'content_cid',
        (data -> 'pin' ->> 'status')::pin_status_type,
        pin_location_result_id,
        (NOW())::timestamptz)
  ON CONFLICT ( content_cid, pin_location_id ) DO UPDATE
        SET "status" = (data -> 'pin' ->> 'status')::pin_status_type,
            "updated_at" = NOW()
  returning id into pin_result_id;

  return (pin_location_result_id)::TEXT;
END
$$;

CREATE OR REPLACE FUNCTION user_used_storage(query_user_id BIGINT) RETURNS TEXT
  LANGUAGE plpgsql
AS
$$
BEGIN
  return(
    select sum(c.dag_size)
    from upload u
    join content c on c.cid = u.content_cid
    where u.user_id = query_user_id and u.deleted_at is null
  )::TEXT;
END
$$;

CREATE OR REPLACE FUNCTION user_keys_list(query_user_id BIGINT)
  RETURNS TABLE
          (
              "id"                text,
              "name"              text,
              "secret"            text,
              "created"           timestamptz,
              "uploads"           bigint
          )
  LANGUAGE sql
AS
$$
SELECT (ak.id)::TEXT AS id,
       ak.name AS name,
       ak.secret AS secret,
       ak.inserted_at AS created,
       CASE WHEN EXISTS(SELECT 42 FROM upload u WHERE ak.id = u.auth_key_id AND u.deleted_at IS NULL) THEN 1::BIGINT ELSE 0::BIGINT END
  FROM auth_key ak
 WHERE ak.user_id = query_user_id AND ak.deleted_at IS NULL
$$;

CREATE OR REPLACE FUNCTION pin_from_status_total(query_status TEXT) RETURNS TEXT
  LANGUAGE plpgsql
AS
$$
BEGIN
  return(
    select count(*)
    from pin
    where status = (query_status)::pin_status_type
  )::TEXT;
END
$$;

CREATE OR REPLACE FUNCTION content_dag_size_total() RETURNS TEXT
  LANGUAGE plpgsql
AS
$$
BEGIN
  return(
    select sum(c.dag_size)
    from content c
  )::TEXT;
END
$$;

CREATE OR REPLACE FUNCTION pin_dag_size_total() RETURNS TEXT
  LANGUAGE plpgsql
AS
$$
BEGIN
  return(
    select sum(c.dag_size)
    from pin p
    join content c on c.cid = p.content_cid
    where p.status = ('Pinned')::pin_status_type
  )::TEXT;
END
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
FROM public.aggregate_entry ae
         join public.aggregate a using (aggregate_cid)
         LEFT JOIN public.deal de USING (aggregate_cid)
WHERE ae.cid_v1 = ANY (cids)
ORDER BY de.entry_last_updated
$$;

CREATE OR REPLACE FUNCTION publish_name_record(data json) RETURNS VOID
    LANGUAGE plpgsql
    volatile
    PARALLEL UNSAFE
AS
$$
BEGIN
  INSERT INTO name (key, record, has_v2_sig, seqno, validity)
  VALUES (data ->> 'key',
          data ->> 'record',
          (data ->> 'has_v2_sig')::BOOLEAN,
          (data ->> 'seqno')::BIGINT,
          (data ->> 'validity')::BIGINT)
  ON CONFLICT (key) DO UPDATE
    SET record = data ->> 'record',
        has_v2_sig = (data ->> 'has_v2_sig')::BOOLEAN,
        seqno = (data ->> 'seqno')::BIGINT,
        validity = (data ->> 'validity')::BIGINT,
        updated_at = TIMEZONE('utc'::TEXT, NOW())
    WHERE
        -- https://github.com/ipfs/go-ipns/blob/a8379aa25ef287ffab7c5b89bfaad622da7e976d/ipns.go#L325
        ((data ->> 'has_v2_sig')::BOOLEAN = TRUE AND name.has_v2_sig = FALSE) OR
        ((data ->> 'has_v2_sig')::BOOLEAN = name.has_v2_sig AND (data ->> 'seqno')::BIGINT > name.seqno) OR
        ((data ->> 'has_v2_sig')::BOOLEAN = name.has_v2_sig AND (data ->> 'seqno')::BIGINT = name.seqno AND (data ->> 'validity')::BIGINT > name.validity) OR
        ((data ->> 'has_v2_sig')::BOOLEAN = name.has_v2_sig AND (data ->> 'seqno')::BIGINT = name.seqno AND (data ->> 'validity')::BIGINT = name.validity AND DECODE(data ->> 'record', 'base64') > DECODE(name.record, 'base64'));
END
$$;
