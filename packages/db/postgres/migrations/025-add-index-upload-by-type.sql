CREATE INDEX CONCURRENTLY upload_type_car_idx ON upload (type) WHERE type = 'Car';
CREATE INDEX CONCURRENTLY upload_type_upload_idx ON upload (type) WHERE type = 'Upload';
CREATE INDEX CONCURRENTLY upload_type_multipart_idx ON upload (type) WHERE type = 'Multipart';
CREATE INDEX CONCURRENTLY upload_type_blob_idx ON upload (type) WHERE type = 'Blob';