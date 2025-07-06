-- Create a function to handle atomic invoice sequence generation
-- This ensures thread-safe invoice number generation

CREATE OR REPLACE FUNCTION get_next_invoice_sequence(pattern_prefix TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    next_seq INTEGER;
    last_invoice_num TEXT;
    sequence_part TEXT;
BEGIN
    -- Lock the table to prevent concurrent access issues
    LOCK TABLE invoices IN EXCLUSIVE MODE;
    
    -- Get the last invoice number matching the pattern (e.g., PPFI-STU250705%)
    SELECT invoice_number INTO last_invoice_num
    FROM invoices 
    WHERE invoice_number LIKE pattern_prefix || '%'
    ORDER BY invoice_number DESC 
    LIMIT 1;
    
    -- If no matching invoice found, start with 1
    IF last_invoice_num IS NULL THEN
        RETURN 1;
    END IF;
    
    -- Extract the sequence number from the end of the invoice number
    -- For pattern PPFI-STU2507050001, extract the last 4 digits
    sequence_part := RIGHT(last_invoice_num, 4);
    
    -- Check if the sequence part is numeric
    IF sequence_part ~ '^\d+$' THEN
        next_seq := CAST(sequence_part AS INTEGER) + 1;
    ELSE
        next_seq := 1;
    END IF;
    
    RETURN next_seq;
END;
$$;

-- Create an index to improve performance of invoice number lookups
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number_pattern 
ON invoices USING btree (invoice_number text_pattern_ops);

-- Create a unique constraint to prevent duplicate invoice numbers
ALTER TABLE invoices 
ADD CONSTRAINT unique_invoice_number 
UNIQUE (invoice_number);
