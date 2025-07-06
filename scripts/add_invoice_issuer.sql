-- Add issuer field to the invoices table
ALTER TABLE invoices 
ADD COLUMN issuer VARCHAR(255);

-- Add a comment to document the field
COMMENT ON COLUMN invoices.issuer IS 'Name of the person who issued the invoice';

-- Create an index for better query performance when filtering by issuer
CREATE INDEX IF NOT EXISTS idx_invoices_issuer ON invoices(issuer);

-- Update existing invoices with a default issuer (optional)
-- You can customize this default value or leave it NULL for existing records
UPDATE invoices 
SET issuer = 'System Administrator' 
WHERE issuer IS NULL;

-- Add a check constraint to ensure issuer name is not empty when provided
ALTER TABLE invoices 
ADD CONSTRAINT check_issuer_not_empty 
CHECK (issuer IS NULL OR LENGTH(TRIM(issuer)) > 0);
