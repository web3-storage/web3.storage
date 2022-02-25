BEGIN TRANSACTION;
INSERT INTO public.user_tag
(
    user_id,
    tag,
    value,
    reason,
	inserted_at
)
SELECT
     user_id,
     'HasPsaAccess' as tag,
     'true' as value,
     'Approved access' as reason,
	 inserted_at
 FROM public.pinning_authorization
 WHERE deleted_at IS NULL;
 
INSERT INTO public.user_tag
(
    user_id,
    tag,
    value,
    reason,
	inserted_at,
	deleted_at
)
SELECT
     user_id,
     'HasPsaAccess' as tag,
     'false' as value,
     'Revoked access' as reason,
	 inserted_at,
	 deleted_at
 FROM public.pinning_authorization
 WHERE deleted_at IS NOT NULL;

DROP TABLE public.pinning_authorization;
COMMIT;