CREATE OR REPLACE FUNCTION update_dag_size(options json) RETURNS TABLE(cid text)
    LANGUAGE plpgsql
    volatile
    PARALLEL UNSAFE
AS
$$
BEGIN
 
  return QUERY 
    UPDATE public.content c
      SET 
        dag_size = d.size_actual,
        updated_at = TIMEZONE('utc'::TEXT, NOW())
    FROM cargo.dags d
    WHERE
      c.cid = d.cid_v1 AND
      c.cid in (
        SELECT c.cid
        FROM public.content c
        JOIN cargo.dags d on c.cid = d.cid_v1
        WHERE
          d.size_actual > 0 AND 
          c.dag_size != d.size_actual AND 
          c.inserted_at > (options ->> 'start')::timestamptz
        LIMIT(options ->> 'limit')::int
      )
    RETURNING c.cid;
END
$$;
