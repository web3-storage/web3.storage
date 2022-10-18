DROP TABLE IF EXISTS terms_of_service;
DROP INDEX IF EXISTS terms_of_service_user_id_idx;

CREATE TABLE IF NOT EXISTS agreement (
  id              BIGSERIAL PRIMARY KEY,
  user_id         BIGINT                                                        NOT NULL REFERENCES public.user (id),
  agreement_type  agreement_type                                                NOT NULL,
  inserted_at     TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE (user_id, agreement_type)
);

CREATE INDEX IF NOT EXISTS agreement_user_id_idx ON agreement (user_id);
