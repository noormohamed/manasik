-- Backfill hotel_id_md5 for all hotels that don't have it set
UPDATE hotels SET hotel_id_md5 = MD5(id) WHERE hotel_id_md5 IS NULL;
