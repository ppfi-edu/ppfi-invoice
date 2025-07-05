-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.client_invoices (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  client_id uuid,
  invoice_id character varying,
  CONSTRAINT client_invoices_pkey PRIMARY KEY (id),
  CONSTRAINT client_invoices_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id),
  CONSTRAINT client_invoices_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(invoice_number)
);
CREATE TABLE public.clients (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  email character varying NOT NULL UNIQUE,
  phone character varying,
  address text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT clients_pkey PRIMARY KEY (id)
);
CREATE TABLE public.invoices (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  invoice_number character varying NOT NULL UNIQUE,
  type character varying NOT NULL CHECK (type::text = ANY (ARRAY['tuition'::character varying::text, 'product'::character varying::text])),
  student_id uuid,
  client_id uuid,
  items jsonb NOT NULL,
  subtotal numeric NOT NULL,
  tax_rate numeric NOT NULL,
  tax_amount numeric NOT NULL,
  total numeric NOT NULL,
  due_date date NOT NULL,
  notes text,
  status character varying DEFAULT 'pending'::character varying CHECK (status::text = ANY (ARRAY['pending'::character varying, 'paid'::character varying, 'overdue'::character varying, 'cancelled'::character varying]::text[])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT invoices_pkey PRIMARY KEY (id),
  CONSTRAINT invoices_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id),
  CONSTRAINT invoices_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id)
);
CREATE TABLE public.student_invoices (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  student_id uuid,
  invoice_id character varying,
  CONSTRAINT student_invoices_pkey PRIMARY KEY (id),
  CONSTRAINT student_invoices_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.invoices(invoice_number),
  CONSTRAINT student_invoices_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id)
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
  CONSTRAINT students_pkey PRIMARY KEY (id)
);
-- Insert sample students
INSERT INTO students (name, email, phone, student_id, program) VALUES
('Sophea Chan', 'sophea.chan@email.com', '+855 12 345 678', 'PPFI2024001', 'Fashion Design'),
('Raksmey Pich', 'raksmey.pich@email.com', '+855 12 345 679', 'PPFI2024002', 'Fashion Marketing'),
('Dara Sok', 'dara.sok@email.com', '+855 12 345 680', 'PPFI2024003', 'Fashion Design'),
('Mealea Chea', 'mealea.chea@email.com', '+855 12 345 681', 'PPFI2024004', 'Fashion Business'),
('Pisach Lim', 'pisach.lim@email.com', '+855 12 345 682', 'PPFI2024005', 'Fashion Design'),
('Sreypov Nhem', 'sreypov.nhem@email.com', '+855 12 345 683', 'PPFI2024006', 'Fashion Marketing'),
('Vibol Keo', 'vibol.keo@email.com', '+855 12 345 684', 'PPFI2024007', 'Fashion Design'),
('Chenda Ros', 'chenda.ros@email.com', '+855 12 345 685', 'PPFI2024008', 'Fashion Business')
ON CONFLICT (email) DO NOTHING;

-- Insert sample clients
INSERT INTO clients (name, email, phone, address) VALUES
('Angkor Fashion Boutique', 'info@angkorfashion.com', '+855 23 456 789', 'Street 240, Phnom Penh, Cambodia'),
('Royal Style Gallery', 'contact@royalstyle.com', '+855 23 456 790', 'Russian Market, Phnom Penh, Cambodia'),
('Mekong Fashion House', 'hello@mekongfashion.com', '+855 23 456 791', 'BKK1, Phnom Penh, Cambodia'),
('Silk Road Boutique', 'orders@silkroad.com', '+855 23 456 792', 'Central Market, Phnom Penh, Cambodia'),
('Khmer Couture', 'info@khmercouture.com', '+855 23 456 793', 'Street 178, Phnom Penh, Cambodia')
ON CONFLICT (email) DO NOTHING;
