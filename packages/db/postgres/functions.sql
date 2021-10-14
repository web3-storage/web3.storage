DROP FUNCTION IF EXISTS json_arr_to_text_arr;
DROP FUNCTION IF EXISTS json_arr_to_json_element_array;
DROP FUNCTION IF EXISTS create_upload;
DROP FUNCTION IF EXISTS find_deals_by_content_cids;

-- transform a JSON array property into an array of SQL text elements
CREATE OR REPLACE FUNCTION json_arr_to_text_arr(_json json)
  RETURNS text[] LANGUAGE sql IMMUTABLE PARALLEL SAFE AS
'SELECT ARRAY(SELECT json_array_elements_text(_json))';

-- transform a JSON array property into an array of SQL json elements
CREATE OR REPLACE FUNCTION json_arr_to_json_element_array(_json json)
  RETURNS json[] LANGUAGE sql IMMUTABLE PARALLEL SAFE AS
'SELECT ARRAY(SELECT * FROM json_array_elements(_json))';

CREATE OR REPLACE FUNCTION create_upload(data json) RETURNS BIGINT
    LANGUAGE plpgsql
    volatile
    PARALLEL UNSAFE
AS
$$
DECLARE
  backup_url TEXT;
  pin json;
  pin_location_result_id BIGINT;
  inserted_upload_id BIGINT;
BEGIN
  -- Add to content table if new
  insert into content (cid, dag_size, updated_at, inserted_at)
  values (data ->> 'content_cid',
          (data ->> 'dag_size')::BIGINT,
          (data ->> 'updated_at')::timestamptz,
          (data ->> 'inserted_at')::timestamptz)
    ON CONFLICT ( cid ) DO NOTHING;

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
        ON CONFLICT ( content_cid, pin_location_id ) DO NOTHING;
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
            (data ->> 'updated_at')::timestamptz,
            (data ->> 'inserted_at')::timestamptz)
  ON CONFLICT ( user_id, source_cid ) DO UPDATE
    SET "updated_at" = (data ->> 'updated_at')::timestamptz,
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

  return inserted_upload_id;
END
$$;

CREATE OR REPLACE FUNCTION upsert_pin(data json) RETURNS BIGINT
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

  return pin_location_result_id;
END
$$;

CREATE OR REPLACE FUNCTION user_used_storage(query_user_id BIGINT) RETURNS BIGINT
  LANGUAGE plpgsql
AS
$$
BEGIN
  return(
    select sum(c.dag_size)
    from upload u
    join content c on c.cid = u.content_cid
    where u.user_id = query_user_id and u.deleted_at is null
  );
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
