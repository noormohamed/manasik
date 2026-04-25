-- Add hotel_rules column to hotels table
ALTER TABLE hotels ADD COLUMN IF NOT EXISTS hotel_rules TEXT AFTER cancellation_policy;
