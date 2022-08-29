-- Remove things for storing IPNS name records, as this functionality has moved to w3name.
DROP FUNCTION IF EXISTS publish_name_record;
DROP TABLE IF EXISTS name;
