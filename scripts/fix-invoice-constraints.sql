-- Fix the status check constraint to allow the correct status values
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_status_check;

-- Add the correct status constraint
ALTER TABLE invoices ADD CONSTRAINT invoices_status_check 
CHECK (status IN ('draft', 'issue', 'paid', 'overdue'));

-- Also ensure the type constraint is correct
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_type_check;
ALTER TABLE invoices ADD CONSTRAINT invoices_type_check 
CHECK (type IN ('student', 'client'));
