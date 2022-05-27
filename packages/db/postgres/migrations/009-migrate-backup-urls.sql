UPDATE "upload" SET "backup_urls" = (SELECT array_agg("url") FROM "backup" WHERE "upload_id" = "upload"."id");
