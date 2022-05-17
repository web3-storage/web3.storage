UPDATE "upload" SET "backup_urls" = (SELECT json_object_agg(url, jsonb_build_object('url', url, 'created', inserted_at)) FROM backup WHERE "upload_id" = "upload"."id");
