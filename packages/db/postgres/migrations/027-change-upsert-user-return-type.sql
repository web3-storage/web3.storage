-- This replaces the previous upsert_user function, which returned "id" BIGINT not text
-- the bigints were cast to Numbers by our js lib and overflowed Number.MAX_SAFE_INTEGER
DROP FUNCTION IF EXISTS upsert_user(text,text,text,text,text,text);
CREATE OR REPLACE FUNCTION upsert_user(_name TEXT, _picture TEXT, _email TEXT, _issuer TEXT, _github TEXT, _public_address TEXT)
RETURNS TABLE (
  "id" TEXT,
  "issuer" TEXT,
  "inserted" BOOLEAN
)
LANGUAGE plpgsql
AS
$$
#variable_conflict use_column
DECLARE
  inserted BOOLEAN;

BEGIN
  SELECT (COUNT(id) = 0) into inserted FROM public.user WHERE issuer = _issuer;

  RETURN QUERY
  INSERT INTO public.user AS u (name, picture, email, issuer, github, public_address) 
  VALUES (_name, _picture, _email, _issuer, _github, _public_address)
  ON CONFLICT (issuer) DO UPDATE
  SET 
    name = EXCLUDED.name,
    picture = EXCLUDED.picture,
    email = EXCLUDED.email,
    github = EXCLUDED.github,
    public_address = EXCLUDED.public_address
  RETURNING u.id::TEXT, u.issuer, inserted;

END
$$;
