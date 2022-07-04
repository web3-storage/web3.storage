ALTER TYPE pin_status_type RENAME TO pin_status_type_old;

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
    -- The item has been queued for pinning on the IPFS daemon.
    'PinQueued',
    -- The item has been queued for unpinning on the IPFS daemon.
    'UnpinQueued',
    -- The IPFS daemon is not pinning the item through this CID but it is tracked
    -- in a cluster dag
    'Sharded',
    -- The item should be pinned, but it is not pinned and not queued/pinning.
    'UnexpectedlyUnpinned'
);

ALTER TABLE pin ALTER COLUMN status TYPE pin_status_type USING status::text::pin_status_type;

DROP TYPE pin_status_type_old;
