-- This file is a copy of https://raw.githubusercontent.com/nftstorage/dagcargo/master/maint/pg_schema.sql
-- In production foreign data wrappers  are used to connect to the prod cargo DB.  

CREATE SCHEMA IF NOT EXISTS cargo;

CREATE OR REPLACE
  FUNCTION cargo.valid_cid_v1(TEXT) RETURNS BOOLEAN
    LANGUAGE sql IMMUTABLE PARALLEL SAFE
AS $$
  SELECT SUBSTRING( $1 FROM 1 FOR 3 ) = 'baf'
$$;

CREATE OR REPLACE
  FUNCTION cargo.update_entry_timestamp() RETURNS TRIGGER
    LANGUAGE plpgsql
AS $$
BEGIN
  NEW.entry_last_updated = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE
  FUNCTION cargo.record_deal_event() RETURNS TRIGGER
    LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO cargo.deal_events ( deal_id, status ) VALUES ( NEW.deal_id, NEW.status );
  RETURN NULL;
END;
$$;


CREATE TABLE IF NOT EXISTS cargo.dags (
  cid_v1 TEXT NOT NULL UNIQUE CONSTRAINT valid_cidv1 CHECK ( cargo.valid_cid_v1(cid_v1) ),
  size_actual BIGINT CONSTRAINT valid_actual_size CHECK ( size_actual >= 0 ),
  entry_created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  entry_analyzed TIMESTAMP WITH TIME ZONE,
  entry_last_updated TIMESTAMP WITH TIME ZONE NOT NULL,
  meta JSONB,
  CONSTRAINT analyzis_markers CHECK ( ( size_actual IS NULL ) = ( entry_analyzed IS NULL ) )
);
CREATE INDEX IF NOT EXISTS dags_last_updated ON cargo.dags ( entry_last_updated );
CREATE INDEX IF NOT EXISTS dags_entry_analyzed ON cargo.dags ( entry_analyzed );
CREATE INDEX IF NOT EXISTS dags_size_actual ON cargo.dags ( size_actual );
CREATE TRIGGER trigger_dag_insert
  BEFORE INSERT ON cargo.dags
  FOR EACH ROW
  EXECUTE PROCEDURE cargo.update_entry_timestamp()
;
CREATE TRIGGER trigger_dag_updated
  BEFORE UPDATE OF size_actual, entry_created ON cargo.dags
  FOR EACH ROW
  WHEN (OLD IS DISTINCT FROM NEW)
  EXECUTE PROCEDURE cargo.update_entry_timestamp()
;


CREATE TABLE IF NOT EXISTS cargo.refs (
  cid_v1 TEXT NOT NULL REFERENCES cargo.dags ( cid_v1 ),
  ref_cid TEXT NOT NULL CONSTRAINT valid_ref_cid CHECK ( cargo.valid_cid_v1(ref_cid) OR SUBSTRING( ref_cid FROM 1 FOR 2 ) = 'Qm' ),
  CONSTRAINT singleton_by_ref UNIQUE ( ref_cid, cid_v1 )
);
CREATE INDEX IF NOT EXISTS refs_cid ON cargo.refs ( cid_v1 ) INCLUDE ( ref_cid );


CREATE TABLE IF NOT EXISTS cargo.sources (
  srcid BIGSERIAL NOT NULL UNIQUE,
  project INTEGER NOT NULL,
  source_label TEXT NOT NULL,
  weight INTEGER CONSTRAINT weight_range CHECK ( weight BETWEEN -99 AND 99 ),
  details JSONB,
  entry_created TIMESTAMP WITH TIME ZONE NOT NULL,
  CONSTRAINT singleton_source_record UNIQUE ( project, source_label )
);
CREATE INDEX IF NOT EXISTS sources_weight ON cargo.sources ( weight );
CREATE INDEX IF NOT EXISTS sources_source_label ON cargo.sources ( source_label );


CREATE TABLE IF NOT EXISTS cargo.dag_sources (
  srcid BIGINT NOT NULL REFERENCES cargo.sources ( srcid ),
  cid_v1 TEXT NOT NULL REFERENCES cargo.dags ( cid_v1 ),
  source_key TEXT NOT NULL,
  size_claimed BIGINT CONSTRAINT valid_climed_size CHECK ( size_claimed >= 0 ),
  details JSONB,
  entry_created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  entry_last_updated TIMESTAMP WITH TIME ZONE NOT NULL,
  entry_removed TIMESTAMP WITH TIME ZONE,
  CONSTRAINT singleton_dag_source_record UNIQUE ( srcid, source_key )
);
CREATE INDEX IF NOT EXISTS dag_sources_cidv1 ON cargo.dag_sources ( cid_v1 ) INCLUDE ( entry_removed );
CREATE INDEX IF NOT EXISTS dag_sources_entry_removed ON cargo.dag_sources ( entry_removed );
CREATE INDEX IF NOT EXISTS dag_sources_entry_not_removed ON cargo.dag_sources ( cid_v1 ) WHERE ( entry_removed IS NULL );
CREATE INDEX IF NOT EXISTS dag_sources_entry_created ON cargo.dag_sources ( entry_created );
CREATE INDEX IF NOT EXISTS dag_sources_pintime ON cargo.dag_sources ( (details ->> 'pin_reported_at') );
CREATE TRIGGER trigger_dag_source_insert
  BEFORE INSERT ON cargo.dag_sources
  FOR EACH ROW
  EXECUTE PROCEDURE cargo.update_entry_timestamp()
;
CREATE TRIGGER trigger_dag_source_updated
  BEFORE UPDATE ON cargo.dag_sources
  FOR EACH ROW
  -- *always* trigger the update tstamp bump so thath w "front-run" the remote source timestamp
  -- WHEN (OLD IS DISTINCT FROM NEW)
  EXECUTE PROCEDURE cargo.update_entry_timestamp()
;


CREATE TABLE IF NOT EXISTS cargo.aggregates (
  aggregate_cid TEXT NOT NULL UNIQUE CONSTRAINT valid_aggregate_cid CHECK ( cargo.valid_cid_v1(aggregate_cid) ),
  piece_cid TEXT UNIQUE NOT NULL,
  sha256hex TEXT NOT NULL,
  export_size BIGINT NOT NULL CONSTRAINT valid_export_size CHECK ( export_size > 0 ),
  metadata JSONB,
  entry_created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);


CREATE TABLE IF NOT EXISTS cargo.aggregate_entries (
  aggregate_cid TEXT NOT NULL REFERENCES cargo.aggregates ( aggregate_cid ),
  cid_v1 TEXT NOT NULL REFERENCES cargo.dags ( cid_v1 ),
  datamodel_selector TEXT NOT NULL,
  CONSTRAINT singleton_aggregate_entry UNIQUE ( cid_v1, aggregate_cid )
);
CREATE INDEX IF NOT EXISTS aggregate_entries_aggregate_cid ON cargo.aggregate_entries ( aggregate_cid );


CREATE TABLE IF NOT EXISTS cargo.clients (
  client TEXT NOT NULL UNIQUE CONSTRAINT valid_client_id CHECK ( SUBSTRING( client FROM 1 FOR 2 ) IN ( 'f1', 'f2', 'f3' ) ),
  filp_available BIGINT NOT NULL,
  details JSONB
);


CREATE TABLE IF NOT EXISTS cargo.providers (
  provider TEXT NOT NULL UNIQUE CONSTRAINT valid_provider_id CHECK ( SUBSTRING( provider FROM 1 FOR 2 ) = 'f0' ),
  details JSONB
);


CREATE TABLE IF NOT EXISTS cargo.deals (
  deal_id BIGINT UNIQUE NOT NULL CONSTRAINT valid_id CHECK ( deal_id > 0 ),
  aggregate_cid TEXT NOT NULL REFERENCES cargo.aggregates ( aggregate_cid ),
  client TEXT NOT NULL REFERENCES cargo.clients ( client ),
  provider TEXT NOT NULL REFERENCES cargo.providers ( provider ),
  status TEXT NOT NULL,
  status_meta TEXT,
  start_epoch INTEGER NOT NULL CONSTRAINT valid_start CHECK ( start_epoch > 0 ),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL GENERATED ALWAYS AS ( TO_TIMESTAMP( start_epoch*30 + 1598306400 ) ) STORED,
  end_epoch INTEGER NOT NULL CONSTRAINT valid_end CHECK ( end_epoch > 0 ),
  end_time TIMESTAMP WITH TIME ZONE NOT NULL GENERATED ALWAYS AS ( TO_TIMESTAMP( end_epoch*30 + 1598306400 ) ) STORED,
  sector_start_epoch INTEGER CONSTRAINT valid_sector_start CHECK ( sector_start_epoch > 0 ),
  sector_start_time TIMESTAMP WITH TIME ZONE GENERATED ALWAYS AS ( TO_TIMESTAMP( sector_start_epoch*30 + 1598306400 ) ) STORED,
  entry_created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  entry_last_updated TIMESTAMP WITH TIME ZONE NOT NULL
);
CREATE INDEX IF NOT EXISTS deals_aggregate_cid ON cargo.deals ( aggregate_cid );
CREATE INDEX IF NOT EXISTS deals_client ON cargo.deals ( client );
CREATE INDEX IF NOT EXISTS deals_provider ON cargo.deals ( provider );
CREATE INDEX IF NOT EXISTS deals_status ON cargo.deals ( status );
CREATE TRIGGER trigger_deal_insert
  BEFORE INSERT ON cargo.deals
  FOR EACH ROW
  EXECUTE PROCEDURE cargo.update_entry_timestamp()
;
CREATE TRIGGER trigger_deal_updated
  BEFORE UPDATE ON cargo.deals
  FOR EACH ROW
  WHEN (
    OLD.status IS DISTINCT FROM NEW.status
      OR
    OLD.status_meta IS DISTINCT FROM NEW.status_meta
      OR
    OLD.sector_start_epoch IS DISTINCT FROM NEW.sector_start_epoch
  )
  EXECUTE PROCEDURE cargo.update_entry_timestamp()
;
CREATE TRIGGER trigger_basic_deal_history_on_insert
  AFTER INSERT ON cargo.deals
  FOR EACH ROW
  EXECUTE PROCEDURE cargo.record_deal_event()
;
CREATE TRIGGER trigger_basic_deal_history_on_update
  AFTER UPDATE ON cargo.deals
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE PROCEDURE cargo.record_deal_event()
;


CREATE TABLE IF NOT EXISTS cargo.deal_events (
  entry_id BIGSERIAL UNIQUE NOT NULL,
  deal_id BIGINT NOT NULL REFERENCES cargo.deals( deal_id ),
  status TEXT NOT NULL,
  entry_created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS deal_events_deal_id ON cargo.deal_events ( deal_id );


CREATE OR REPLACE VIEW cargo.aggregate_summary AS (
  WITH
  per_project_membership AS (
    SELECT ae.aggregate_cid, s.project, COUNT(distinct(cid_v1)) AS cnt
      FROM cargo.aggregate_entries ae
      JOIN cargo.dag_sources ds USING ( cid_v1 )
      JOIN cargo.sources s USING ( srcid )
    GROUP BY ae.aggregate_cid, s.project
  ),
  per_project_zero_replicas AS (
    SELECT ae.aggregate_cid, s.project, COUNT(distinct(cid_v1)) AS cnt
      FROM cargo.aggregate_entries ae
      JOIN cargo.dag_sources ds USING ( cid_v1 )
      JOIN cargo.sources s USING ( srcid )
    WHERE NOT EXISTS (
      SELECT 42
        FROM cargo.aggregate_entries ae2, cargo.deals de
      WHERE
        ae.cid_v1 = ae2.cid_v1
          AND
        ae2.aggregate_cid = de.aggregate_cid
          AND
        de.status != 'terminated'
    )
    GROUP BY ae.aggregate_cid, s.project
  )
  SELECT
    a.aggregate_cid,
    a.piece_cid,
    a.export_size AS car_size,
    a.entry_created AS aggregated_at,
    'https://cargo.web3.storage/deal-cars/'||aggregate_cid||'_'||piece_cid||'.car' AS web2_source,
    ( SELECT COUNT(*) FROM cargo.deals d WHERE a.aggregate_cid = d.aggregate_cid AND d.status != 'terminated' ) AS tentative_replicas,
    (
      SELECT JSONB_OBJECT_AGG( k,v ) FROM (

        SELECT 'any_project' AS k, COUNT(*) AS v FROM cargo.aggregate_entries ae WHERE ae.aggregate_cid = a.aggregate_cid

          UNION ALL

        SELECT 'project_' || project::TEXT AS k, cnt AS v FROM per_project_membership WHERE aggregate_cid = a.aggregate_cid

          UNION ALL

        SELECT 'zero_replicas_project_' || project::TEXT AS k, cnt AS v FROM per_project_zero_replicas WHERE aggregate_cid = a.aggregate_cid

      ) j
    ) AS dag_counts,
    (
      SELECT JSONB_OBJECT_AGG( k,v ) FROM (

          SELECT 'pending' AS k, JSONB_BUILD_OBJECT( 'any_region', COUNT(*) ) AS v
            FROM cargo.deals de
          WHERE de.status = 'published' AND de.aggregate_cid = a.aggregate_cid

        UNION ALL

          SELECT 'active' AS k, JSONB_BUILD_OBJECT( 'any_region', COUNT(*) ) AS v
            FROM cargo.deals de
          WHERE de.status = 'active' AND de.aggregate_cid = a.aggregate_cid

      ) j
    ) AS replica_counts
  FROM cargo.aggregates a
  ORDER BY
    -- first prioritize "contains dags with no replicas for proj1", here "false"/NULL sorts first
    0 != ( SELECT cnt FROM per_project_zero_replicas z WHERE a.aggregate_cid = z.aggregate_cid and z.project = 1 ),
    -- then count of anything "non-terminated"
    tentative_replicas,
    -- then order again by specific dag counts
    ( SELECT COUNT(*) FROM per_project_membership m WHERE a.aggregate_cid = m.aggregate_cid AND  m.project = 1 ) DESC NULLS LAST,
    ( SELECT COUNT(*) FROM cargo.aggregate_entries ae WHERE a.aggregate_cid = ae.aggregate_cid ) DESC NULLS LAST
);

CREATE OR REPLACE VIEW cargo.dags_missing_list AS (

  SELECT m.*, s.project, COALESCE( s.weight, 100 ) AS weight
    FROM (
      SELECT
          ds.cid_v1,
          ds.source_key,
          ds.srcid,
          ds.entry_created,
          ds.entry_removed,
          ( ds.entry_removed IS NOT NULL ) AS is_tombstone,
          ( ds.details->'pin_reported_at' IS NOT NULL ) AS is_pinned,
          ( COALESCE( ds.details->>'upload_type', '' ) = 'Remote' ) AS via_psa,
          CASE WHEN ds.size_claimed = 0 THEN NULL ELSE ds.size_claimed END AS size_claimed,
          ds.details
        FROM cargo.dag_sources ds
        JOIN cargo.dags d USING ( cid_v1 )
      WHERE
        d.size_actual IS NULL
    ) m
    JOIN cargo.sources s USING ( srcid )
  ORDER BY s.project, m.srcid, m.entry_created DESC
);

CREATE OR REPLACE VIEW cargo.dags_missing_summary AS (
  WITH
  incomplete_sources AS (
    SELECT
        ml.srcid,
        COUNT(*) AS dags_missing,
        COUNT(*) FILTER (WHERE ml.is_pinned) AS dags_missing_pinned,
        MIN( ml.entry_created )::DATE AS oldest_missing,
        MAX( ml.entry_created )::DATE AS newest_missing,
        SUM( ml.size_claimed ) AS size_claimed,
        ( MIN( ml.entry_created ) FILTER (WHERE ml.is_pinned) )::DATE AS oldest_pinned,
        SUM( ml.size_claimed ) FILTER (WHERE ml.is_pinned) AS size_claimed_pinned,
        COUNT(*) FILTER (WHERE NOT ml.is_pinned) AS pins_missing,
        COUNT(*) FILTER (WHERE ml.via_psa ) AS via_psa
      FROM cargo.dags_missing_list ml
    WHERE
      ( ml.is_pinned OR NOT ml.is_tombstone )
      --  AND
      -- ml.entry_created < ( NOW() - '30 minutes'::INTERVAL )
    GROUP BY ml.srcid
  )
  (
    SELECT
        s.project AS project,
        NULL AS srcid,
        'MISSING TOTALS' AS source_email,
        NULL AS weight,
        MIN( si.oldest_missing ) AS oldest_missing,
        MAX( si.newest_missing ) AS newest_missing,
        SUM( si.dags_missing ) AS cnt,
        PG_SIZE_PRETTY( SUM( si.size_claimed ) ) AS size_claimed,
        (100::numeric * SUM( si.pins_missing )::numeric / SUM(si.dags_missing)::numeric)::numeric(7,4) AS pct_not_pinned,
        (100::numeric * SUM( si.via_psa )::numeric / SUM(si.dags_missing)::numeric)::numeric(7,4) AS pct_via_psa,
        SUM( si.dags_missing_pinned ) AS cnt_pinned,
        PG_SIZE_PRETTY( SUM( si.size_claimed_pinned ) ) AS size_pinned,
        MIN( si.oldest_pinned ) AS oldest_pinned,
        SUM( si.size_claimed_pinned ) AS bytes_pinned
      FROM incomplete_sources si
      JOIN cargo.sources s USING (srcid)
    GROUP BY s.project
    ORDER BY s.project
  )
    UNION ALL
  (
    SELECT
        s.project AS project,
        s.srcid,
        s.details ->> 'email' AS source_email,
        s.weight,
        si.oldest_missing,
        si.newest_missing,
        si.dags_missing AS cnt,
        PG_SIZE_PRETTY(si.size_claimed) AS size_claimed,
        ( 100::numeric * si.pins_missing::numeric / si.dags_missing::numeric )::numeric(7,4) AS pct_not_pinned,
        ( 100::numeric * si.via_psa::numeric / si.dags_missing::numeric )::numeric(7,4) AS pct_via_psa,
        si.dags_missing_pinned AS cnt_pinned,
        PG_SIZE_PRETTY(si.size_claimed_pinned ) AS size_pinned,
        si.oldest_pinned,
        si.size_claimed_pinned AS bytes_pinned
      FROM incomplete_sources si
      JOIN cargo.sources s USING (srcid)
    ORDER BY s.weight DESC NULLS FIRST, si.size_claimed_pinned NULLS FIRST, si.dags_missing_pinned, si.srcid
  )
);

CREATE OR REPLACE VIEW cargo.source_daily_summary AS (
  SELECT
    DATE_TRUNC( 'day', d.entry_analyzed ) AS cargo_retrieval_day,
    srcid,
    COUNT(*) AS daily_count,
    SUM( d.size_actual ) AS daily_bytes,
    MAX( EXTRACT( 'epoch' FROM d.entry_analyzed - ds.entry_created ) ) FILTER ( WHERE ds.entry_created < d.entry_analyzed )::BIGINT AS max_retrieval_lag_seconds,
    MIN( EXTRACT( 'epoch' FROM d.entry_analyzed - ds.entry_created ) ) FILTER ( WHERE ds.entry_created < d.entry_analyzed )::BIGINT AS min_retrieval_lag_seconds
    FROM cargo.dag_sources ds
    JOIN cargo.dags d USING ( cid_v1 )
  WHERE d.size_actual IS NOT NULL
  GROUP BY cargo_retrieval_day, srcid
);
CREATE OR REPLACE VIEW cargo.source_daily_ranked_volume AS (
  SELECT
      sds.cargo_retrieval_day,
      s.project,
      RANK() OVER ( PARTITION BY sds.cargo_retrieval_day, s.project ORDER BY sds.daily_bytes DESC ) AS daily_rank,
      sds.srcid,
      sds.max_retrieval_lag_seconds,
      sds.daily_count,
      sds.daily_bytes,
      COALESCE( s.details ->> 'nickname', s.details ->> 'github_id', s.source_label ) AS source_nick,
      s.details ->> 'name' AS source_name,
      s.details ->> 'email' AS source_email,
      s.details ->> 'github_id' AS source_ghkey,
      s.weight
    FROM cargo.source_daily_summary sds
    JOIN cargo.sources s USING ( srcid )
  ORDER BY cargo_retrieval_day DESC, s.project, daily_rank, sds.srcid
);
CREATE OR REPLACE VIEW cargo.source_daily_ranked_count AS (
  SELECT
      sds.cargo_retrieval_day,
      s.project,
      RANK() OVER ( PARTITION BY sds.cargo_retrieval_day, s.project ORDER BY sds.daily_count DESC ) AS daily_rank,
      sds.srcid,
      sds.max_retrieval_lag_seconds,
      sds.daily_count,
      sds.daily_bytes,
      COALESCE( s.details ->> 'nickname', s.details ->> 'github_id', s.source_label ) AS source_nick,
      s.details ->> 'name' AS source_name,
      s.details ->> 'email' AS source_email,
      s.details ->> 'github_id' AS source_ghkey,
      s.weight
    FROM cargo.source_daily_summary sds
    JOIN cargo.sources s USING ( srcid )
  ORDER BY cargo_retrieval_day DESC, s.project, daily_rank, sds.srcid
);

CREATE OR REPLACE VIEW cargo.source_all_time_summary AS (
  WITH
    summary_missing AS (
      SELECT
          ds.srcid,
          COUNT(*) AS dags_missing,
          MIN( ds.entry_created ) AS oldest_missing,
          MAX( ds.entry_created ) AS newest_missing
        FROM cargo.dag_sources ds
        JOIN cargo.dags d USING ( cid_v1 )
      WHERE
        d.size_actual IS NULL
          AND
        ds.entry_removed IS NULL
          AND
        ds.entry_created < ( NOW() - '30 minutes'::INTERVAL )
      GROUP BY ds.srcid
    ),
    summary AS (
      SELECT
        srcid,
        COUNT(*) AS count_total,
        SUM(size_actual) AS bytes_total,
        MIN(entry_created) AS oldest_dag,
        MAX(entry_created) AS newest_dag
      FROM (
          SELECT
              ds.srcid,
              ds.cid_v1,
              d.size_actual,
              ds.entry_created
            FROM cargo.dag_sources ds
            JOIN cargo.dags d USING ( cid_v1 )
          WHERE
            d.size_actual IS NOT NULL
              AND
            ds.entry_removed IS NULL

        EXCEPT

          SELECT
              ds.srcid,
              ds.cid_v1,
              d.size_actual,
              ds.entry_created
            FROM cargo.dag_sources ds
            JOIN cargo.dags d USING ( cid_v1 )
            JOIN cargo.refs r
              ON ds.cid_v1 = r.ref_cid
            JOIN cargo.dag_sources pds
              ON r.cid_v1 = pds.cid_v1
          WHERE
            -- same source only
            pds.srcid = ds.srcid
              AND
            pds.entry_removed IS NULL
      ) ded
      GROUP BY srcid
    ),
    summary_unaggregated AS (
      SELECT
        srcid,
        COUNT(*) AS count_total,
        SUM(size_actual) AS bytes_total,
        MIN(entry_created) AS oldest_dag,
        MAX(entry_created) AS newest_dag
      FROM (

        SELECT
            ds.srcid,
            ds.cid_v1,
            d.size_actual,
            ds.entry_created
          FROM cargo.dag_sources ds
          JOIN cargo.dags d USING ( cid_v1 )
          -- not yet aggregated anti-join (IS NULL below)
          LEFT JOIN cargo.aggregate_entries ae USING ( cid_v1 )
        WHERE
          -- only analysed entries (FIXME for now do not deal with oversizes/that comes later)
          ( d.size_actual IS NOT NULL AND d.size_actual <= 34000000000 )
            AND
          ds.entry_removed IS NULL
            AND
          -- not yet aggregated
          ae.cid_v1 IS NULL

      -- exclude dags that are included in other unaggregated dags from same source
      EXCEPT

        SELECT
            ds.srcid,
            ds.cid_v1,
            d.size_actual,
            ds.entry_created
          FROM cargo.dag_sources ds
          JOIN cargo.dags d USING ( cid_v1 )
          JOIN cargo.refs r
            ON ds.cid_v1 = r.ref_cid
          JOIN cargo.dag_sources pds
            ON r.cid_v1 = pds.cid_v1
          -- not yet aggregated anti-joins (IS NULL below)
          LEFT JOIN cargo.aggregate_entries ae ON
            ds.cid_v1 = ae.cid_v1
          LEFT JOIN cargo.aggregate_entries pae ON
            pds.cid_v1 = pae.cid_v1
        WHERE
          -- same source
          ds.srcid = pds.srcid
            AND
          -- neither us nor parent yet aggregated
          ( ae.cid_v1 IS NULL AND pae.cid_v1 IS NULL )
            AND
          pds.entry_removed IS NULL

      ) dedup_eligible
      GROUP BY srcid
    )
  SELECT
    s.project,
    su.srcid,
    COALESCE( s.details ->> 'nickname', s.details ->> 'github_id', s.source_label ) AS source_nick,
    s.details ->> 'name' AS source_name,
    s.details ->> 'email' AS source_email,
    s.details ->> 'github_id' AS source_ghkey,
    s.weight,
    su.count_total AS count_total,
    pg_size_pretty(su.bytes_total) AS size_total,
    ( su.bytes_total::NUMERIC / ( 1::BIGINT << 30 )::NUMERIC )::NUMERIC(99,3) AS GiB_total,
    su.newest_dag AS most_recent_upload,
    unagg.count_total AS count_unagg,
    pg_size_pretty(unagg.bytes_total) AS size_unagg,
    ( unagg.bytes_total::NUMERIC / ( 1::BIGINT << 30 )::NUMERIC )::NUMERIC(99,3) AS GiB_unagg,
    unagg.oldest_dag AS oldest_unagg,
    ms.dags_missing,
    ms.oldest_missing,
    ms.newest_missing
  FROM summary su
  JOIN cargo.sources s USING ( srcid )
  LEFT JOIN summary_unaggregated unagg USING ( srcid )
  LEFT JOIN summary_missing ms USING ( srcid )
  ORDER BY (unagg.bytes_total > 0 ), weight DESC NULLS FIRST, unagg.bytes_total DESC NULLS LAST, su.bytes_total DESC NULLS FIRST, s.project, su.srcid
);
