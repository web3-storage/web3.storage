CREATE SCHEMA IF NOT EXISTS cargo;

CREATE TABLE IF NOT EXISTS cargo.aggregate_entries (
  aggregate_cid TEXT NOT NULL,
  cid_v1 TEXT NOT NULL,
  datamodel_selector TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cargo.aggregates (
  aggregate_cid TEXT NOT NULL UNIQUE,
  piece_cid TEXT UNIQUE NOT NULL,
  sha256hex TEXT NOT NULL,
  export_size BIGINT NOT NULL,
  metadata JSONB,
  entry_created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cargo.deals (
  deal_id BIGINT UNIQUE NOT NULL,
  aggregate_cid TEXT NOT NULL,
  client TEXT NOT NULL,
  provider TEXT NOT NULL,
  status TEXT NOT NULL,
  status_meta TEXT,
  start_epoch INTEGER NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_epoch INTEGER NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  sector_start_epoch INTEGER,
  sector_start_time TIMESTAMP WITH TIME ZONE,
  entry_created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  entry_last_updated TIMESTAMP WITH TIME ZONE NOT NULL
);
