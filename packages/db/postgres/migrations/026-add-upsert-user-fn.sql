-- a custom UPSERT operation for user account, so that we can distinguish between
-- newly inserted users and updated ones.
CREATE OR REPLACE FUNCTION upsert_user(_name TEXT, _picture TEXT, _email TEXT, _issuer TEXT, _github TEXT, _public_address TEXT)
RETURNS TABLE (
  "id" BIGINT,
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
  RETURNING u.id, u.issuer, inserted;

END
$$;