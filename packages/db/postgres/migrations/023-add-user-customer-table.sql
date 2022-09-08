-- add table to keep track of 0..1 customer id for each user
CREATE TABLE IF NOT EXISTS user_customer
(
  id               BIGSERIAL PRIMARY KEY,
  user_id          BIGINT NOT NULL UNIQUE REFERENCES public.user (id),
  customer_id      TEXT NOT NULL UNIQUE
);

CREATE INDEX CONCURRENTLY IF NOT EXISTS user_customer_user_id_idx ON public.user_customer (user_id);
