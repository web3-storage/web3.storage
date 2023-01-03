-- create_content stopped creating pin sync requests because it started using
-- linkdex. This updates create_psa_pin_request to manually add a pin sync
-- request after creating the psa pin request.

-- Creates a pin request with relative content, pins, pin_requests and backups.
CREATE OR REPLACE FUNCTION create_psa_pin_request(data json) RETURNS TEXT
    LANGUAGE plpgsql
    volatile
    PARALLEL UNSAFE
AS
$$
DECLARE
  inserted_pin_request_id TEXT;
BEGIN
  -- Set timeout as imposed by heroku
  SET LOCAL statement_timeout = '30s';

  PERFORM create_content(data);

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

  -- Create a Pin Sync Request
  INSERT INTO pin_sync_request (pin_id, inserted_at)
  VALUES (data ->> 'source_cid', (data ->> 'inserted_at')::TIMESTAMPTZ)
  ON CONFLICT (pin_id) DO NOTHING;

  return (inserted_pin_request_id)::TEXT;
END
$$;
