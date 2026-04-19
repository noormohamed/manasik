-- Add provider information to hotels table
ALTER TABLE hotels ADD COLUMN provider_name VARCHAR(255) NULL COMMENT 'Hotel provider/distributor company name';
ALTER TABLE hotels ADD COLUMN provider_reference VARCHAR(100) NULL COMMENT 'Provider reference code';
ALTER TABLE hotels ADD COLUMN provider_phone VARCHAR(20) NULL COMMENT 'Provider contact phone';

-- Create index for provider lookups
CREATE INDEX idx_provider_name ON hotels(provider_name);
