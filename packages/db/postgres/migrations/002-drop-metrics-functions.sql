DROP FUNCTION IF EXISTS pin_from_status_total;
DROP FUNCTION IF EXISTS content_dag_size_total;
DROP FUNCTION IF EXISTS pin_dag_size_total;

-- Metric contains the current values of collected metrics.
CREATE TABLE IF NOT EXISTS metric
(
    name TEXT PRIMARY KEY,
    value BIGINT NOT NULL,
    inserted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
