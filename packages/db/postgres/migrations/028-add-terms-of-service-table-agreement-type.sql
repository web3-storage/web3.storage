-- Migration to setup terms_of_service
CREATE TYPE agreement_type AS ENUM
(
  'web3.storage-tos-v1'
);

CREATE TABLE IF NOT EXISTS terms_of_service (
  id              BIGSERIAL PRIMARY KEY,
  user_id         BIGINT                                                        NOT NULL REFERENCES public.user (id),
  agreement       agreement_type                                                NOT NULL,
  inserted_at     TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE (user_id, agreement)
);

CREATE INDEX IF NOT EXISTS terms_of_service_user_id_idx ON terms_of_service (user_id);

