-- create_content without the insert into pin_request
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

-- drop the table after the function that uses it has been updated
DROP TABLE IF EXISTS pin_request;
