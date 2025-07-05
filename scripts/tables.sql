-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.
CREATE TABLE public.clients (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  email character varying NOT NULL UNIQUE,
  phone character varying,
  address text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT clients_pkey PRIMARY KEY (id),
);
CREATE TABLE public.students (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  email character varying NOT NULL UNIQUE,
  phone character varying,
  student_id character varying NOT NULL UNIQUE,
  program character varying NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT students_pkey PRIMARY KEY (id),
);
CREATE TABLE public.invoices (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  invoice_number character varying NOT NULL UNIQUE,
  type character varying NOT NULL CHECK (type::text = ANY (ARRAY['tuition'::character varying, 'product'::character varying]::text[])),
  student_id uuid,
  client_id uuid,
  items jsonb NOT NULL,
  subtotal numeric NOT NULL,
  tax_rate numeric NOT NULL,
  tax_amount numeric NOT NULL,
  total numeric NOT NULL,
  due_date date NOT NULL,
  notes text,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT invoices_pkey PRIMARY KEY (id),
  CONSTRAINT invoices_client_id_fkey FOREIGN KEY (client_id) REFERENCES clients(id),
  CONSTRAINT invoices_student_id_fkey FOREIGN KEY (student_id) REFERENCES students(id)
);

CREATE TABLE IF NOT EXISTS public.client_invoices (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  client_id uuid,
  invoice_id character varying,
  CONSTRAINT client_invoices_pkey PRIMARY KEY (id),
  CONSTRAINT client_invoices_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id),
  CONSTRAINT client_invoices_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(invoice_number)
);

CREATE TABLE IF NOT EXISTS public.student_invoices (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  student_id uuid,
  invoice_id character varying,
  CONSTRAINT student_invoices_pkey PRIMARY KEY (id),
  CONSTRAINT student_invoices_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(invoice_number),
  CONSTRAINT student_invoices_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id)
);

CREATE INDEX IF NOT EXISTS idx_invoices_student_id ON invoices(student_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at);
CREATE INDEX IF NOT EXISTS idx_students_student_id ON students(student_id);
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);

create view invoices_by_student
with
  (security_invoker = on) as
select
  i.id as invoice_id,
  i.invoice_number,
  i.type,
  i.subtotal,
  i.tax_rate,
  i.tax_amount,
  i.total,
  i.due_date,
  i.status,
  s.id as student_id,
  s.name as student_name,
  s.email as student_email
from invoices i
join students s on i.student_id = s.id;

create view invoices_by_client
with (security_invoker = on) as
select
  i.id as invoice_id,
  i.invoice_number,
  i.type,
  i.subtotal,
  i.tax_rate,
  i.tax_amount,
  i.total,
  i.due_date,
  i.status,
  c.id as client_id,
  c.name as client_name,
  c.email as client_email
from invoices i
join clients c on i.client_id = c.id;

CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pg_trgm" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "unaccent" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;

-- Function to generate invoice numbers with a specific format
CREATE OR REPLACE FUNCTION public.generate_invoice_number(prefix text DEFAULT 'PPFI-'::text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  next_id text;
  year_part text := to_char(current_date, 'YY'); 
  month_part text := to_char(current_date, 'MM');
  sequence_num integer;
BEGIN
  -- Get the next sequence number for this month
  SELECT COALESCE(MAX(SUBSTRING(invoice_number FROM '[0-9]+$')::integer), 0) + 1
  INTO sequence_num
  FROM public.invoices
  WHERE invoice_number LIKE prefix || year_part || '-' || month_part || '-%';
  
  -- Format the invoice number: INV-MM-YY-XXXX (now with 2-digit year)
  next_id := prefix || month_part || '-' || year_part || '-' || LPAD(sequence_num::text, 4, '0');
  
  RETURN next_id;
END;
$$;

-- Function to calculate invoice totals
CREATE OR REPLACE FUNCTION public.calculate_invoice_totals(
  p_items jsonb,
  p_tax_rate numeric
)
RETURNS TABLE(
  subtotal numeric,
  tax_amount numeric,
  total numeric
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_subtotal numeric := 0;
  v_tax_amount numeric := 0;
  v_total numeric := 0;
  item jsonb;
BEGIN
  -- Calculate subtotal from items array
  IF jsonb_typeof(p_items) = 'array' THEN
    FOR item IN SELECT * FROM jsonb_array_elements(p_items)
    LOOP
      v_subtotal := v_subtotal + (
        (item->>'quantity')::numeric * (item->>'price')::numeric
      );
    END LOOP;
  END IF;
  
  -- Calculate tax and total
  v_tax_amount := ROUND(v_subtotal * (p_tax_rate / 100), 2);
  v_total := v_subtotal + v_tax_amount;
  
  RETURN QUERY SELECT v_subtotal, v_tax_amount, v_total;
END;
$$;

-- Function to search clients by name, email, or phone (using trigram similarity)
CREATE OR REPLACE FUNCTION public.search_clients(search_term text)
RETURNS TABLE (
  id uuid,
  name character varying,
  email character varying,
  phone character varying,
  similarity numeric
)
LANGUAGE sql
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT 
    c.id,
    c.name,
    c.email,
    c.phone,
    GREATEST(
      similarity(c.name, search_term),
      similarity(c.email, search_term),
      similarity(COALESCE(c.phone, ''), search_term)
    ) as similarity
  FROM public.clients c
  WHERE 
    c.name ILIKE '%' || search_term || '%' OR
    c.email ILIKE '%' || search_term || '%' OR
    c.phone ILIKE '%' || search_term || '%' OR
    similarity(c.name, search_term) > 0.3 OR
    similarity(c.email, search_term) > 0.3 OR
    similarity(COALESCE(c.phone, ''), search_term) > 0.3
  ORDER BY similarity DESC;
$$;

-- Trigger function to update the 'updated_at' timestamp
CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Apply the update_timestamp trigger to all tables with updated_at column
CREATE TRIGGER update_clients_timestamp
BEFORE UPDATE ON public.clients
FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER update_students_timestamp
BEFORE UPDATE ON public.students
FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER update_invoices_timestamp
BEFORE UPDATE ON public.invoices
FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER update_client_invoices_timestamp
BEFORE UPDATE ON public.client_invoices
FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER update_student_invoices_timestamp
BEFORE UPDATE ON public.student_invoices
FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER sync_invoice_relations_trigger
AFTER INSERT OR UPDATE ON public.invoices
FOR EACH ROW EXECUTE FUNCTION public.sync_invoice_relations();

-- Trigger function to automatically update invoice totals when items change
CREATE OR REPLACE FUNCTION public.update_invoice_totals()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  calc_result record;
BEGIN
  -- Only recalculate if items or tax_rate changed
  IF (TG_OP = 'INSERT') OR 
     (TG_OP = 'UPDATE' AND (OLD.items <> NEW.items OR OLD.tax_rate <> NEW.tax_rate)) THEN
    
    -- Use the calculate_invoice_totals function
    SELECT * FROM public.calculate_invoice_totals(NEW.items, NEW.tax_rate) INTO calc_result;
    
    -- Update the invoice with calculated values
    NEW.subtotal := calc_result.subtotal;
    NEW.tax_amount := calc_result.tax_amount;
    NEW.total := calc_result.total;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Apply the update_invoice_totals trigger
CREATE TRIGGER update_invoice_totals_trigger
BEFORE INSERT OR UPDATE ON public.invoices
FOR EACH ROW EXECUTE FUNCTION public.update_invoice_totals();

-- Trigger function to automatically create entries in junction tables
CREATE OR REPLACE FUNCTION public.sync_invoice_relations()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- For new invoices or when client_id changes
  IF (TG_OP = 'INSERT') OR 
     (TG_OP = 'UPDATE' AND OLD.client_id IS DISTINCT FROM NEW.client_id) THEN
    
    -- If client_id is set, ensure there's a client_invoices entry
    IF NEW.client_id IS NOT NULL THEN
      -- Delete any existing relation for this invoice with different client
      DELETE FROM public.client_invoices 
      WHERE invoice_id = NEW.invoice_number 
      AND client_id <> NEW.client_id;
      
      -- Insert new relation if it doesn't exist
      INSERT INTO public.client_invoices (client_id, invoice_id)
      VALUES (NEW.client_id, NEW.invoice_number)
      ON CONFLICT (client_id, invoice_id) DO NOTHING;
    END IF;
  END IF;
  
  -- For new invoices or when student_id changes
  IF (TG_OP = 'INSERT') OR 
     (TG_OP = 'UPDATE' AND OLD.student_id IS DISTINCT FROM NEW.student_id) THEN
    
    -- If student_id is set, ensure there's a student_invoices entry
    IF NEW.student_id IS NOT NULL THEN
      -- Delete any existing relation for this invoice with different student
      DELETE FROM public.student_invoices 
      WHERE invoice_id = NEW.invoice_number 
      AND student_id <> NEW.student_id;
      
      -- Insert new relation if it doesn't exist
      INSERT INTO public.student_invoices (student_id, invoice_id)
      VALUES (NEW.student_id, NEW.invoice_number)
      ON CONFLICT (student_id, invoice_id) DO NOTHING;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Apply the sync_invoice_relations trigger
CREATE TRIGGER sync_invoice_relations_trigger
AFTER INSERT OR UPDATE ON public.invoices
FOR EACH ROW EXECUTE FUNCTION public.sync_invoice_relations();

-- Add unique constraints to prevent duplicate relations
ALTER TABLE public.client_invoices 
ADD CONSTRAINT client_invoices_client_invoice_unique 
UNIQUE (client_id, invoice_id);

ALTER TABLE public.student_invoices 
ADD CONSTRAINT student_invoices_student_invoice_unique 
UNIQUE (student_id, invoice_id);

-- Create indexes for foreign keys to optimize joins
CREATE INDEX IF NOT EXISTS idx_client_invoices_client_id ON public.client_invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_client_invoices_invoice_id ON public.client_invoices(invoice_id);
CREATE INDEX IF NOT EXISTS idx_student_invoices_student_id ON public.student_invoices(student_id);
CREATE INDEX IF NOT EXISTS idx_student_invoices_invoice_id ON public.student_invoices(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON public.invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_student_id ON public.invoices(student_id);