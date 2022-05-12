UPDATE "upload" SET "backup_urls" = (SELECT array_agg(jsonb_build_object('url', url, 'inserted_at', inserted_at)) FROM backup WHERE "upload_id" = "upload"."id");
