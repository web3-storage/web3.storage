-- A user of web3.storage.
CREATE TABLE IF NOT EXISTS public.user
(
  id              BIGSERIAL PRIMARY KEY,
  name            TEXT                                                          NOT NULL,
  picture         TEXT,
  email           TEXT                                                          NOT NULL,
  -- The Decentralized ID of the Magic User who generated the DID Token.
  issuer          TEXT                                                          NOT NULL UNIQUE,
  -- GitHub user handle, may be null if user logged in via email.
  github          TEXT,
  -- Cryptographic public address of the Magic User.
  public_address  TEXT                                                          NOT NULL UNIQUE,
  inserted_at     TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS user_updated_at_idx ON public.user (updated_at);

-- User authentication keys.
CREATE TABLE IF NOT EXISTS auth_key
(
  id              BIGSERIAL PRIMARY KEY,
  -- User assigned name.
  name            TEXT                                                          NOT NULL,
  -- Secret that corresponds to this token.
  secret          TEXT                                                          NOT NULL,
  -- User this token belongs to.
  user_id         BIGINT                                                        NOT NULL REFERENCES public.user (id),
  inserted_at     TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  deleted_at      TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS auth_key_user_id_idx ON auth_key (user_id);

-- Details of the root of a file/directory stored on web3.storage.
CREATE TABLE IF NOT EXISTS content
(
  -- Root CID for this content. Normalized as v1 base32.
  cid             TEXT PRIMARY KEY,
  -- Size of the DAG in bytes. Either the cumulativeSize for dag-pb or the sum of block sizes in the CAR.
  dag_size        BIGINT,
  inserted_at     TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS content_updated_at_idx ON content (updated_at);
-- TODO: Sync with @ribasushi as we can start using this as the primary key
CREATE UNIQUE INDEX content_cid_with_size_idx ON content (cid) INCLUDE (dag_size);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pin_status_type') THEN
    
    -- IPFS Cluster tracker status values.
    -- https://github.com/ipfs/ipfs-cluster/blob/54c3608899754412861e69ee81ca8f676f7e294b/api/types.go#L52-L83
    -- TODO: nft.storage only using a subset of these: https://github.com/ipfs-shipyard/nft.storage/blob/main/packages/api/db/tables.sql#L2-L7
    CREATE TYPE pin_status_type AS ENUM
    (
      -- Should never see this value. When used as a filter. It means "all".
      'Undefined',
      -- The cluster node is offline or not responding.
      'ClusterError',
      -- An error occurred pinning.
      'PinError',
      -- An error occurred unpinning.
      'UnpinError',
      -- The IPFS daemon has pinned the item.
      'Pinned',
      -- The IPFS daemon is currently pinning the item.
      'Pinning',
      -- The IPFS daemon is currently unpinning the item.
      'Unpinning',
      -- The IPFS daemon is not pinning the item.
      'Unpinned',
      -- The IPFS daemon is not pinning the item but it is being tracked.
      'Remote',
      -- The item has been queued for pinning on the IPFS daemon.
      'PinQueued',
      -- The item has been queued for unpinning on the IPFS daemon.
      'UnpinQueued',
      -- The IPFS daemon is not pinning the item through this CID but it is tracked
      -- in a cluster dag
      'Sharded'
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'upload_type') THEN
    -- Upload type is the type of received upload data.
    CREATE TYPE upload_type AS ENUM
    (
      -- A CAR file upload.
      'Car',
      -- Files uploaded and converted into a CAR file.
      'Upload',
      -- A raw blob upload in the request body.
      'Blob',
      -- A multi file upload using a multipart request.
      'Multipart'
    );
  END IF;
END$$;

-- An IPFS node that is pinning content.
CREATE TABLE IF NOT EXISTS pin_location
(
  id              BIGSERIAL PRIMARY KEY,
  -- Libp2p peer ID of the node pinning this pin.
  peer_id         TEXT                                                          NOT NULL UNIQUE,
  -- Name of the peer pinning this pin.
  peer_name       TEXT,
  -- Geographic region this node resides in.
  region          TEXT
);

-- Information for piece of content pinned in IPFS.
CREATE TABLE IF NOT EXISTS pin
(
  id              BIGSERIAL PRIMARY KEY,
  -- Pinning status at this location.
  status          pin_status_type                                               NOT NULL,
  -- The content being pinned.
  content_cid     TEXT                                                          NOT NULL REFERENCES content (cid),
  -- Identifier for the service that is pinning this pin.
  pin_location_id BIGINT                                                        NOT NULL REFERENCES pin_location (id),
  inserted_at     TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE (content_cid, pin_location_id)
);

CREATE INDEX IF NOT EXISTS pin_content_cid_idx ON pin (content_cid);
CREATE INDEX IF NOT EXISTS pin_location_id_idx ON pin (pin_location_id);
CREATE INDEX IF NOT EXISTS pin_updated_at_idx ON pin (updated_at);
CREATE INDEX IF NOT EXISTS pin_status_idx ON pin (status);
CREATE INDEX IF NOT EXISTS pin_composite_pinned_at_idx ON pin (content_cid, updated_at) WHERE status = 'Pinned';


-- An upload created by a user.
CREATE TABLE IF NOT EXISTS upload
(
  id              BIGSERIAL PRIMARY KEY,
  -- User that uploaded this content.
  user_id         BIGINT                                                        NOT NULL REFERENCES public.user (id),
  -- User authentication token that was used to upload this content.
  -- Note: nullable, because the user may have used a Magic.link token.
  auth_key_id     BIGINT REFERENCES auth_key (id),
  -- The root of the uploaded content (base32 CIDv1 normalised).
  content_cid     TEXT                                                          NOT NULL REFERENCES content (cid),
  -- CID in the from we found in the received file.
  source_cid      TEXT                                                          NOT NULL,
  -- Type of received upload data.
  type            upload_type                                                   NOT NULL,
  -- User provided name for this upload.
  name            TEXT,
  inserted_at     TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  deleted_at      TIMESTAMP WITH TIME ZONE,
  UNIQUE (user_id, source_cid)
);

CREATE INDEX IF NOT EXISTS upload_auth_key_id_idx ON upload (auth_key_id);
CREATE INDEX IF NOT EXISTS upload_content_cid_idx ON upload (content_cid);
CREATE INDEX IF NOT EXISTS upload_updated_at_idx ON upload (updated_at);

-- Details of the backups created for an upload.
CREATE TABLE IF NOT EXISTS backup
(
  id              BIGSERIAL PRIMARY KEY,
  -- Upload that resulted in this backup.
  upload_id       BIGINT                                                        NOT NULL REFERENCES upload (id) ON DELETE CASCADE,
  -- Backup url location.
  url             TEXT                                                          NOT NULL UNIQUE,
  inserted_at     TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS backup_upload_id_idx ON backup (upload_id);

-- Tracks requests to replicate content to more nodes.
CREATE TABLE IF NOT EXISTS pin_request
(
  id              BIGSERIAL PRIMARY KEY,
  -- Root CID of the Pin we want to replicate.
  content_cid     TEXT                                                          NOT NULL UNIQUE REFERENCES content (cid),
  attempts        INT DEFAULT 0,
  inserted_at     TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS pin_request_content_cid_idx ON pin_request (content_cid);

-- A request to keep a Pin in sync with the nodes that are pinning it.
CREATE TABLE IF NOT EXISTS pin_sync_request
(
  id              BIGSERIAL PRIMARY KEY,
  -- Identifier for the pin to keep in sync.
  pin_id          BIGINT                                                        NOT NULL UNIQUE REFERENCES pin (id),
  inserted_at     TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS pin_sync_request_pin_id_idx ON pin_sync_request (pin_id);

-- A migration tracker.
CREATE TABLE IF NOT EXISTS migration_tracker
(
  id              BIGSERIAL PRIMARY KEY,
  cid             TEXT                                                          NOT NULL,
  duration        BIGINT,
  dump_started_at TIMESTAMP WITH TIME ZONE,
  dump_ended_at   TIMESTAMP WITH TIME ZONE NOT NULL,
  inserted_at     TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS name
(
    -- base36 "libp2p-key" encoding of the public key
    key         TEXT PRIMARY KEY,
    -- the serialized IPNS record - base64 encoded
    record      TEXT NOT NULL,
    -- next 3 fields are derived from the record & used for newness comparisons
    -- see: https://github.com/ipfs/go-ipns/blob/a8379aa25ef287ffab7c5b89bfaad622da7e976d/ipns.go#L325
    has_v2_sig  BOOLEAN NOT NULL,
    seqno       BIGINT NOT NULL,
    validity    BIGINT NOT NULL, -- nanoseconds since 00:00, Jan 1 1970 UTC
    inserted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
