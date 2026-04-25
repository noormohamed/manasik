-- Add custom_policies column to hotels table for storing custom hotel rules
ALTER TABLE hotels ADD COLUMN custom_policies JSON DEFAULT NULL AFTER cancellation_policy;
