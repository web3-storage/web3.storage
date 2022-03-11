DROP FUNCTION IF EXISTS upsert_pin;
DROP FUNCTION IF EXISTS upsert_pins;

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
  insert into pin_location (peer_id, peer_name, ipfs_peer_id, region)
  values (data -> 'pin' -> 'location' ->> 'peer_id',
          data -> 'pin' -> 'location' ->> 'peer_name',
          data -> 'pin' -> 'location' ->> 'ipfs_peer_id',
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

  return (pin_result_id)::TEXT;
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
