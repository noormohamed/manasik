-- Make company_id nullable in hotels table
-- This allows individual agents to create hotels without being part of a company

ALTER TABLE hotels 
MODIFY COLUMN company_id VARCHAR(36) NULL,
DROP FOREIGN KEY hotels_ibfk_1,
ADD CONSTRAINT hotels_ibfk_1 FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;
