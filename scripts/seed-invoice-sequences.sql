-- Seed some sample invoice sequences for testing
-- This script demonstrates the invoice numbering system

-- Insert sample students if they don't exist
INSERT INTO students (id, name, student_id, email, program, phone) 
VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', 'Sophea Chan', 'PPFI240001', 'sophea.chan@example.com', 'Fashion Design', '+855 12 345 678'),
    ('550e8400-e29b-41d4-a716-446655440002', 'Dara Kim', 'PPFI240002', 'dara.kim@example.com', 'Fashion Marketing', '+855 12 345 679')
ON CONFLICT (id) DO NOTHING;

-- Insert sample clients if they don't exist
INSERT INTO clients (id, name, email, phone, address) 
VALUES 
    ('660e8400-e29b-41d4-a716-446655440001', 'Fashion Boutique Ltd', 'orders@fashionboutique.com', '+855 23 123 456', '123 Fashion Street, Phnom Penh'),
    ('660e8400-e29b-41d4-a716-446655440002', 'Style Studio', 'contact@stylestudio.com', '+855 23 123 457', '456 Design Avenue, Phnom Penh')
ON CONFLICT (id) DO NOTHING;

-- Insert sample invoices to establish sequence
INSERT INTO invoices (
    id, 
    invoice_number, 
    type, 
    student_id, 
    client_id, 
    items, 
    subtotal, 
    tax_rate, 
    tax_amount, 
    total, 
    due_date, 
    status,
    notes
) VALUES 
    (
        '770e8400-e29b-41d4-a716-446655440001',
        'PPFI-STU-2024-0001',
        'student',
        '550e8400-e29b-41d4-a716-446655440001',
        NULL,
        '[{"id": "1", "description": "Fashion Design Course - Semester 1", "quantity": 1, "unit_price": 500.00, "total": 500.00}]'::json,
        500.00,
        10.0,
        50.00,
        550.00,
        '2024-12-31',
        'sent',
        'First semester tuition fee'
    ),
    (
        '770e8400-e29b-41d4-a716-446655440002',
        'PPFI-CLI-2024-0001',
        'client',
        NULL,
        '660e8400-e29b-41d4-a716-446655440001',
        '[{"id": "1", "description": "Custom Fashion Design Service", "quantity": 2, "unit_price": 200.00, "total": 400.00}]'::json,
        400.00,
        10.0,
        40.00,
        440.00,
        '2024-12-31',
        'draft',
        'Custom design consultation and creation'
    )
ON CONFLICT (id) DO NOTHING;

-- Insert corresponding relationship records
INSERT INTO student_invoices (student_id, invoice_id)
VALUES ('550e8400-e29b-41d4-a716-446655440001', 'PPFI-STU-2024-0001')
ON CONFLICT DO NOTHING;

INSERT INTO client_invoices (client_id, invoice_id)
VALUES ('660e8400-e29b-41d4-a716-446655440001', 'PPFI-CLI-2024-0001')
ON CONFLICT DO NOTHING;
