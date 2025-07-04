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
