-- Add hotel_id_md5 column to hotels table for deterministic URL generation
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS hotel_id_md5 VARCHAR(32) UNIQUE COMMENT 'MD5 hash of hotel ID for clean URLs';

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_hotels_hotel_id_md5 ON hotels(hotel_id_md5);
