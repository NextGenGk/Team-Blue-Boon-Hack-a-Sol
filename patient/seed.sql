-- ============================================
-- AYURSUTRAM DEMO SEED DATA
-- Realistic data with multiple variations
-- ============================================

-- Clear existing data (optional)
TRUNCATE TABLE sync_queue, app_translations, receipts, finance_transactions, 
    medication_adherence, prescriptions, appointments, doctors, patients, users 
RESTART IDENTITY CASCADE;

-- ============================================
-- USERS (Mix of Patients, Doctors, Admin)
-- ============================================

-- Patients (10 users with diverse profiles)
INSERT INTO users (uid, email, phone, password_hash, role, name, profile_image_url, is_verified, is_active) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'rajesh.kumar@gmail.com', '+919876543210', '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890', 'patient', 'Rajesh Kumar', 'https://i.pravatar.cc/150?img=12', true, true),
('550e8400-e29b-41d4-a716-446655440002', 'priya.sharma@gmail.com', '+919876543211', '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890', 'patient', 'Priya Sharma', 'https://i.pravatar.cc/150?img=5', true, true),
('550e8400-e29b-41d4-a716-446655440003', 'amit.patel@yahoo.com', '+919876543212', '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890', 'patient', 'Amit Patel', 'https://i.pravatar.cc/150?img=33', true, true),
('550e8400-e29b-41d4-a716-446655440004', 'sneha.desai@hotmail.com', '+919876543213', '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890', 'patient', 'Sneha Desai', 'https://i.pravatar.cc/150?img=9', true, true),
('550e8400-e29b-41d4-a716-446655440005', 'vikram.singh@gmail.com', '+919876543214', '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890', 'patient', 'Vikram Singh', 'https://i.pravatar.cc/150?img=15', true, true),
('550e8400-e29b-41d4-a716-446655440006', 'meera.reddy@gmail.com', '+919876543215', '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890', 'patient', 'Meera Reddy', 'https://i.pravatar.cc/150?img=20', true, true),
('550e8400-e29b-41d4-a716-446655440007', 'arjun.mehta@gmail.com', '+919876543216', '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890', 'patient', 'Arjun Mehta', 'https://i.pravatar.cc/150?img=51', true, true),
('550e8400-e29b-41d4-a716-446655440008', 'kavita.joshi@yahoo.com', '+919876543217', '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890', 'patient', 'Kavita Joshi', 'https://i.pravatar.cc/150?img=25', true, true),
('550e8400-e29b-41d4-a716-446655440009', 'rohit.gupta@gmail.com', '+919876543218', '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890', 'patient', 'Rohit Gupta', 'https://i.pravatar.cc/150?img=68', true, true),
('550e8400-e29b-41d4-a716-446655440010', 'anita.verma@hotmail.com', '+919876543219', '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890', 'patient', 'Anita Verma', 'https://i.pravatar.cc/150?img=47', true, true);

-- Doctors (5 doctors with different specializations)
INSERT INTO users (uid, email, phone, password_hash, role, name, profile_image_url, is_verified, is_active) VALUES
('650e8400-e29b-41d4-a716-446655440001', 'dr.ashok.kumar@hospital.com', '+919123456789', '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890', 'doctor', 'Dr. Ashok Kumar', 'https://i.pravatar.cc/150?img=60', true, true),
('650e8400-e29b-41d4-a716-446655440002', 'dr.sunita.rao@clinic.com', '+919123456790', '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890', 'doctor', 'Dr. Sunita Rao', 'https://i.pravatar.cc/150?img=45', true, true),
('650e8400-e29b-41d4-a716-446655440003', 'dr.ramesh.iyer@ayurveda.com', '+919123456791', '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890', 'doctor', 'Dr. Ramesh Iyer', 'https://i.pravatar.cc/150?img=56', true, true),
('650e8400-e29b-41d4-a716-446655440004', 'dr.pooja.shah@dental.com', '+919123456792', '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890', 'doctor', 'Dr. Pooja Shah', 'https://i.pravatar.cc/150?img=38', true, true),
('650e8400-e29b-41d4-a716-446655440005', 'dr.sanjay.nair@cardiology.com', '+919123456793', '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890', 'doctor', 'Dr. Sanjay Nair', 'https://i.pravatar.cc/150?img=52', true, true);

-- Admin
INSERT INTO users (uid, email, phone, password_hash, role, name, profile_image_url, is_verified, is_active) VALUES
('750e8400-e29b-41d4-a716-446655440001', 'admin@ayursutram.com', '+919000000000', '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890', 'admin', 'System Admin', 'https://i.pravatar.cc/150?img=70', true, true);

-- ============================================
-- PATIENTS (Detailed profiles with variations)
-- ============================================

INSERT INTO patients (pid, uid, date_of_birth, gender, blood_group, allergies, current_medications, chronic_conditions, address_line1, city, state, postal_code, emergency_contact_name, emergency_contact_phone) VALUES
-- Young patient with no major issues
('450e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '1995-03-15', 'male', 'O+', ARRAY['Pollen'], ARRAY[]::TEXT[], ARRAY[]::TEXT[], '123 MG Road', 'Indore', 'Madhya Pradesh', '452001', 'Sunita Kumar', '+919876543220'),

-- Middle-aged with allergies and medications
('450e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', '1988-07-22', 'female', 'A+', ARRAY['Penicillin', 'Shellfish'], ARRAY['Levothyroxine 50mcg'], ARRAY['Hypothyroidism'], '45 Sapna Sangeeta Road', 'Indore', 'Madhya Pradesh', '452003', 'Rajiv Sharma', '+919876543221'),

-- Senior citizen with multiple conditions
('450e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', '1960-11-08', 'male', 'B+', ARRAY['Sulfa drugs'], ARRAY['Metformin 500mg', 'Amlodipine 5mg'], ARRAY['Type 2 Diabetes', 'Hypertension'], '78 Vijay Nagar', 'Indore', 'Madhya Pradesh', '452010', 'Neha Patel', '+919876543222'),

-- Young adult with chronic condition
('450e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', '1998-05-14', 'female', 'AB+', ARRAY['Dust mites'], ARRAY['Salbutamol inhaler'], ARRAY['Asthma'], '234 Rau', 'Indore', 'Madhya Pradesh', '452012', 'Kiran Desai', '+919876543223'),

-- Middle-aged, healthy
('450e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005', '1985-09-30', 'male', 'O-', ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY[]::TEXT[], '567 Palasia Square', 'Indore', 'Madhya Pradesh', '452001', 'Anjali Singh', '+919876543224'),

-- Young with food allergies
('450e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440006', '2000-12-25', 'female', 'A-', ARRAY['Peanuts', 'Eggs'], ARRAY[]::TEXT[], ARRAY[]::TEXT[], '89 South Tukoganj', 'Indore', 'Madhya Pradesh', '452007', 'Prakash Reddy', '+919876543225'),

-- Middle-aged with heart condition
('450e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440007', '1978-04-18', 'male', 'B-', ARRAY['Aspirin'], ARRAY['Atorvastatin 10mg', 'Clopidogrel 75mg'], ARRAY['Coronary Artery Disease'], '123 Tilak Nagar', 'Indore', 'Madhya Pradesh', '452018', 'Radha Mehta', '+919876543226'),

-- Senior with arthritis
('450e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440008', '1955-08-10', 'female', 'O+', ARRAY[]::TEXT[], ARRAY['Calcium supplements', 'Vitamin D'], ARRAY['Osteoarthritis'], '456 Scheme 78', 'Indore', 'Madhya Pradesh', '452010', 'Arun Joshi', '+919876543227'),

-- Young professional, healthy
('450e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440009', '1992-01-20', 'male', 'AB-', ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY[]::TEXT[], '789 Silicon City', 'Indore', 'Madhya Pradesh', '452016', 'Deepa Gupta', '+919876543228'),

-- Middle-aged with thyroid
('450e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440010', '1982-06-05', 'female', 'A+', ARRAY['Iodine'], ARRAY['Thyroxine 100mcg'], ARRAY['Hyperthyroidism'], '321 AB Road', 'Indore', 'Madhya Pradesh', '452008', 'Mahesh Verma', '+919876543229');

-- ============================================
-- DOCTORS (Different specializations & setups)
-- ============================================

INSERT INTO doctors (did, uid, specialization, qualification, registration_number, years_of_experience, consultation_fee, bio, clinic_name, address_line1, city, state, postal_code, languages, is_verified) VALUES
-- General Physician with clinic
('350e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 'General Physician', 'MBBS, MD (Medicine)', 'MCI-12345', 15, 500.00, 'Experienced general physician specializing in preventive care and chronic disease management.', 'Kumar Clinic', '45 Nehru Nagar', 'Indore', 'Madhya Pradesh', '452001', ARRAY['English', 'Hindi', 'Marathi'], true),

-- Gynecologist with hospital
('350e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440002', 'Gynecology & Obstetrics', 'MBBS, MS (OB-GYN)', 'MCI-23456', 12, 800.00, 'Specialist in women''s health, pregnancy care, and reproductive health.', 'Rao Women Care Center', '123 Scheme 54', 'Indore', 'Madhya Pradesh', '452010', ARRAY['English', 'Hindi', 'Telugu'], true),

-- Ayurveda specialist (no registration number - optional field)
('350e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440003', 'Ayurveda & Wellness', 'BAMS, MD (Ayurveda)', NULL, 20, 600.00, 'Traditional Ayurvedic practitioner focusing on holistic healing and wellness.', 'Ayur Wellness Center', '78 Rajendra Nagar', 'Indore', 'Madhya Pradesh', '452012', ARRAY['English', 'Hindi', 'Tamil'], true),

-- Dentist (no clinic address - home-based initially)
('350e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440004', 'Dental Surgery', 'BDS, MDS (Orthodontics)', 'DCI-34567', 8, 700.00, 'Expert in dental care, orthodontics, and cosmetic dentistry.', NULL, NULL, NULL, NULL, NULL, ARRAY['English', 'Hindi', 'Gujarati'], true),

-- Cardiologist with premium setup
('350e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440005', 'Cardiology', 'MBBS, MD, DM (Cardiology)', 'MCI-45678', 18, 1500.00, 'Senior cardiologist with expertise in interventional cardiology and heart diseases.', 'Nair Heart Care', '234 Race Course Road', 'Indore', 'Madhya Pradesh', '452003', ARRAY['English', 'Hindi', 'Malayalam'], true);

-- ============================================
-- APPOINTMENTS (Mix of online/offline, different statuses)
-- ============================================

INSERT INTO appointments (aid, pid, did, mode, status, scheduled_date, scheduled_time, start_time, end_time, duration_minutes, token_number, queue_position, meeting_link, meeting_id, chief_complaint, symptoms, doctor_notes) VALUES

-- COMPLETED APPOINTMENTS (Past)
('250e8400-e29b-41d4-a716-446655440001', '450e8400-e29b-41d4-a716-446655440001', '350e8400-e29b-41d4-a716-446655440001', 'offline', 'completed', '2024-12-10', '10:00:00', '2024-12-10 10:05:00', '2024-12-10 10:25:00', 20, 1, NULL, NULL, NULL, 'Fever and body ache for 3 days', ARRAY['Fever', 'Body ache', 'Headache'], 'Viral fever. Prescribed antipyretics and rest.'),

('250e8400-e29b-41d4-a716-446655440002', '450e8400-e29b-41d4-a716-446655440002', '350e8400-e29b-41d4-a716-446655440002', 'online', 'completed', '2024-12-11', '15:00:00', '2024-12-11 15:02:00', '2024-12-11 15:32:00', 30, NULL, NULL, 'https://meet.google.com/abc-defg-hij', 'abc-defg-hij', 'Routine pregnancy checkup - 2nd trimester', ARRAY['Fatigue', 'Morning sickness'], 'Normal pregnancy progression. Continue prenatal vitamins.'),

('250e8400-e29b-41d4-a716-446655440003', '450e8400-e29b-41d4-a716-446655440003', '350e8400-e29b-41d4-a716-446655440001', 'offline', 'completed', '2024-12-12', '11:30:00', '2024-12-12 11:35:00', '2024-12-12 12:00:00', 25, 5, NULL, NULL, NULL, 'Blood sugar fluctuations', ARRAY['High blood sugar readings', 'Increased thirst'], 'Adjusted diabetes medication dosage. Follow-up in 2 weeks.'),

-- SCHEDULED APPOINTMENTS (Upcoming)
('250e8400-e29b-41d4-a716-446655440004', '450e8400-e29b-41d4-a716-446655440004', '350e8400-e29b-41d4-a716-446655440001', 'offline', 'scheduled', '2024-12-18', '09:00:00', NULL, NULL, NULL, 1, 1, NULL, NULL, 'Asthma check-up and inhaler refill', ARRAY['Shortness of breath', 'Wheezing'], NULL),

('250e8400-e29b-41d4-a716-446655440005', '450e8400-e29b-41d4-a716-446655440005', '350e8400-e29b-41d4-a716-446655440003', 'online', 'scheduled', '2024-12-18', '14:00:00', NULL, NULL, NULL, NULL, NULL, 'https://meet.google.com/xyz-pqrs-tuv', 'xyz-pqrs-tuv', 'Ayurvedic consultation for stress management', ARRAY['Stress', 'Insomnia', 'Anxiety'], NULL),

('250e8400-e29b-41d4-a716-446655440006', '450e8400-e29b-41d4-a716-446655440006', '350e8400-e29b-41d4-a716-446655440004', 'offline', 'confirmed', '2024-12-19', '10:30:00', NULL, NULL, NULL, 3, 3, NULL, NULL, 'Dental cleaning and cavity check', ARRAY['Tooth sensitivity', 'Gum bleeding'], NULL),

('250e8400-e29b-41d4-a716-446655440007', '450e8400-e29b-41d4-a716-446655440007', '350e8400-e29b-41d4-a716-446655440005', 'online', 'scheduled', '2024-12-20', '16:00:00', NULL, NULL, NULL, NULL, NULL, 'https://meet.google.com/klm-nopq-rst', 'klm-nopq-rst', 'Follow-up after angioplasty', ARRAY['Chest discomfort', 'Fatigue'], NULL),

-- IN PROGRESS (Today)
('250e8400-e29b-41d4-a716-446655440008', '450e8400-e29b-41d4-a716-446655440008', '350e8400-e29b-41d4-a716-446655440001', 'offline', 'in_progress', CURRENT_DATE, '11:00:00', NOW() - INTERVAL '10 minutes', NULL, NULL, 2, NULL, NULL, NULL, 'Joint pain and stiffness', ARRAY['Joint pain', 'Stiffness', 'Swelling'], NULL),

-- CANCELLED
('250e8400-e29b-41d4-a716-446655440009', '450e8400-e29b-41d4-a716-446655440009', '350e8400-e29b-41d4-a716-446655440002', 'online', 'cancelled', '2024-12-15', '10:00:00', NULL, NULL, NULL, NULL, NULL, 'https://meet.google.com/def-ghij-klm', 'def-ghij-klm', 'General health consultation', ARRAY['General checkup'], NULL),

-- MORE SCHEDULED FOR QUEUE DEMO
('250e8400-e29b-41d4-a716-446655440010', '450e8400-e29b-41d4-a716-446655440010', '350e8400-e29b-41d4-a716-446655440001', 'offline', 'scheduled', '2024-12-18', '09:30:00', NULL, NULL, NULL, 2, 2, NULL, NULL, 'Thyroid check-up', ARRAY['Weight gain', 'Fatigue'], NULL);

-- ============================================
-- PRESCRIPTIONS (With AI-generated examples)
-- ============================================

INSERT INTO prescriptions (prescription_id, aid, pid, did, diagnosis, symptoms, medicines, instructions, diet_advice, follow_up_date, ai_generated, ai_suggestions, is_active) VALUES

-- Simple viral fever prescription
('150e8400-e29b-41d4-a716-446655440001', '250e8400-e29b-41d4-a716-446655440001', '450e8400-e29b-41d4-a716-446655440001', '350e8400-e29b-41d4-a716-446655440001', 
'Viral Fever', 
ARRAY['Fever', 'Body ache', 'Headache'],
'[
    {
        "name": "Paracetamol 500mg",
        "dosage": "1 tablet",
        "frequency": "Three times daily",
        "duration": "5 days",
        "instructions": "After meals"
    },
    {
        "name": "Cetirizine 10mg",
        "dosage": "1 tablet",
        "frequency": "Once daily at night",
        "duration": "3 days",
        "instructions": "Before sleep"
    }
]'::jsonb,
'Take adequate rest. Drink plenty of fluids. Steam inhalation twice daily.',
'Avoid cold drinks and foods. Consume warm liquids. Light diet recommended.',
'2024-12-17',
true,
'{"original_medicines": ["Paracetamol", "Cetirizine"], "confidence": 0.92}'::jsonb,
true),

-- Pregnancy care prescription
('150e8400-e29b-41d4-a716-446655440002', '250e8400-e29b-41d4-a716-446655440002', '450e8400-e29b-41d4-a716-446655440002', '350e8400-e29b-41d4-a716-446655440002',
'Normal Pregnancy - 2nd Trimester',
ARRAY['Fatigue', 'Morning sickness'],
'[
    {
        "name": "Folic Acid 5mg",
        "dosage": "1 tablet",
        "frequency": "Once daily",
        "duration": "Continue until delivery",
        "instructions": "Morning after breakfast"
    },
    {
        "name": "Calcium + Vitamin D3",
        "dosage": "1 tablet",
        "frequency": "Once daily",
        "duration": "Continue until delivery",
        "instructions": "Evening after dinner"
    },
    {
        "name": "Iron supplement",
        "dosage": "1 tablet",
        "frequency": "Once daily",
        "duration": "Continue until delivery",
        "instructions": "With vitamin C rich foods"
    }
]'::jsonb,
'Regular prenatal checkups. Moderate exercise like walking. Adequate sleep.',
'Balanced diet rich in proteins, calcium. Avoid junk food. Stay hydrated.',
'2025-01-15',
false,
NULL,
true),

-- Diabetes management prescription
('150e8400-e29b-41d4-a716-446655440003', '250e8400-e29b-41d4-a716-446655440003', '450e8400-e29b-41d4-a716-446655440003', '350e8400-e29b-41d4-a716-446655440001',
'Type 2 Diabetes Mellitus - Uncontrolled',
ARRAY['High blood sugar', 'Increased thirst'],
'[
    {
        "name": "Metformin 500mg",
        "dosage": "2 tablets",
        "frequency": "Twice daily",
        "duration": "30 days",
        "instructions": "After breakfast and dinner"
    },
    {
        "name": "Glimepiride 2mg",
        "dosage": "1 tablet",
        "frequency": "Once daily",
        "duration": "30 days",
        "instructions": "Before breakfast"
    },
    {
        "name": "Amlodipine 5mg",
        "dosage": "1 tablet",
        "frequency": "Once daily",
        "duration": "30 days",
        "instructions": "Morning"
    }
]'::jsonb,
'Monitor blood sugar daily. Regular exercise for 30 minutes. Check BP weekly.',
'Low sugar, low salt diet. Avoid refined carbs. Increase fiber intake. No sweet drinks.',
'2024-12-26',
true,
'{"adjusted_dosage": true, "reason": "Poor glycemic control"}'::jsonb,
true);

-- ============================================
-- MEDICATION ADHERENCE (Mix of taken/missed)
-- ============================================

INSERT INTO medication_adherence (adherence_id, prescription_id, pid, medicine_name, scheduled_date, scheduled_time, taken_at, is_taken, is_skipped, synced) VALUES

-- Paracetamol adherence (mostly taken)
('050e8400-e29b-41d4-a716-446655440001', '150e8400-e29b-41d4-a716-446655440001', '450e8400-e29b-41d4-a716-446655440001', 'Paracetamol 500mg', '2024-12-10', '09:00:00', '2024-12-10 09:15:00', true, false, true),
('050e8400-e29b-41d4-a716-446655440002', '150e8400-e29b-41d4-a716-446655440001', '450e8400-e29b-41d4-a716-446655440001', 'Paracetamol 500mg', '2024-12-10', '14:00:00', '2024-12-10 14:20:00', true, false, true),
('050e8400-e29b-41d4-a716-446655440003', '150e8400-e29b-41d4-a716-446655440001', '450e8400-e29b-41d4-a716-446655440001', 'Paracetamol 500mg', '2024-12-10', '21:00:00', NULL, false, true, true),
('050e8400-e29b-41d4-a716-446655440004', '150e8400-e29b-41d4-a716-446655440001', '450e8400-e29b-41d4-a716-446655440001', 'Paracetamol 500mg', '2024-12-11', '09:00:00', '2024-12-11 09:05:00', true, false, true),
('050e8400-e29b-41d4-a716-446655440005', '150e8400-e29b-41d4-a716-446655440001', '450e8400-e29b-41d4-a716-446655440001', 'Paracetamol 500mg', '2024-12-11', '14:00:00', '2024-12-11 14:30:00', true, false, true),

-- Diabetes medication adherence (some missed)
('050e8400-e29b-41d4-a716-446655440006', '150e8400-e29b-41d4-a716-446655440003', '450e8400-e29b-41d4-a716-446655440003', 'Metformin 500mg', '2024-12-12', '09:00:00', '2024-12-12 09:10:00', true, false, true),
('050e8400-e29b-41d4-a716-446655440007', '150e8400-e29b-41d4-a716-446655440003', '450e8400-e29b-41d4-a716-446655440003', 'Metformin 500mg', '2024-12-12', '21:00:00', NULL, false, true, true),
('050e8400-e29b-41d4-a716-446655440008', '150e8400-e29b-41d4-a716-446655440003', '450e8400-e29b-41d4-a716-446655440003', 'Glimepiride 2mg', '2024-12-12', '08:00:00', '2024-12-12 08:30:00', true, false, true),
('050e8400-e29b-41d4-a716-446655440009', '150e8400-e29b-41d4-a716-446655440003', '450e8400-e29b-41d4-a716-446655440003', 'Metformin 500mg', '2024-12-13', '09:00:00', '2024-12-13 09:00:00', true, false, true),
('050e8400-e29b-41d4-a716-446655440010', '150e8400-e29b-41d4-a716-446655440003', '450e8400-e29b-41d4-a716-446655440003', 'Metformin 500mg', '2024-12-13', '21:00:00', '2024-12-13 21:15:00', true, false, true);

-- ============================================
-- FINANCE TRANSACTIONS (Razorpay payments)
-- ============================================

INSERT INTO finance_transactions (transaction_id, aid, pid, did, transaction_type, amount, currency, status, razorpay_order_id, razorpay_payment_id, razorpay_signature, payment_method, initiated_at, paid_at) VALUES

-- Completed payments
('850e8400-e29b-41d4-a716-446655440001', '250e8400-e29b-41d4-a716-446655440001', '450e8400-e29b-41d4-a716-446655440001', '350e8400-e29b-41d4-a716-446655440001', 'consultation', 500.00, 'INR', 'paid', 'order_MkHG7xQ9P2v3zA', 'pay_MkHG9xQ9P2v3zB', 'a7b8c9d0e1f2g3h4i5j6k7l8m9n0o1p2', 'upi', '2024-12-10 09:45:00', '2024-12-10 09:45:30'),

('850e8400-e29b-41d4-a716-446655440002', '250e8400-e29b-41d4-a716-446655440002', '450e8400-e29b-41d4-a716-446655440002', '350e8400-e29b-41d4-a716-446655440002', 'consultation', 800.00, 'INR', 'paid', 'order_MkHG8xQ9P2v3zC', 'pay_MkHH0xQ9P2v3zD', 'b8c9d0e1f2g3h4i5j6k7l8m9n0o1p2q3', 'card', '2024-12-11 14:45:00', '2024-12-11 14:46:15'),

('850e8400-e29b-41d4-a716-446655440003', '250e8400-e29b-41d4-a716-446655440003', '450e8400-e29b-41d4-a716-446655440003', '350e8400-e29b-41d4-a716-446655440001', 'consultation', 500.00, 'INR', 'paid', 'order_MkHG9xQ9P2v3zE', 'pay_MkHH1xQ9P2v3zF', 'c9d0e1f2g3h4i5j6k7l8m9n0o1p2q3r4', 'netbanking', '2024-12-12 11:20:00', '2024-12-12 11:21:45'),

-- Pending payment
('850e8400-e29b-41d4-a716-446655440004', '250e8400-e29b-41d4-a716-446655440004', '450e8400-e29b-41d4-a716-446655440004', '350e8400-e29b-41d4-a716-446655440001', 'consultation', 500.00, 'INR', 'pending', 'order_MkHH2xQ9P2v3zG', NULL, NULL, NULL, '2024-12-17 08:45:00', NULL),

-- Failed payment
('850e8400-e29b-41d4-a716-446655440005', '250e8400-e29b-41d4-a716-446655440009', '450e8400-e29b-41d4-a716-446655440009', '350e8400-e29b-41d4-a716-446655440002', 'consultation', 800.00, 'INR', 'failed', 'order_MkHH3xQ9P2v3zH', NULL, NULL, NULL, '2024-12-15 09:30:00', NULL);

-- ============================================
-- RECEIPTS
-- ============================================

INSERT INTO receipts (receipt_id, transaction_id, receipt_number, receipt_date, pid, did, patient_name, doctor_name, consultation_fee, tax_amount, discount_amount, total_amount, payment_method, razorpay_payment_id) VALUES

('950e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', 'RCP-20241210-0001', '2024-12-10', '450e8400-e29b-41d4-a716-446655440001', '350e8400-e29b-41d4-a716-446655440001', 'Rajesh Kumar', 'Dr. Ashok Kumar', 500.00, 0.00, 0.00, 500.00, 'upi', 'pay_MkHG9xQ9P2v3zB'),

('950e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440002', 'RCP-20241211-0001', '2024-12-11', '450e8400-e29b-41d4-a716-446655440002', '350e8400-e29b-41d4-a716-446655440002', 'Priya Sharma', 'Dr. Sunita Rao', 800.00, 0.00, 0.00, 800.00, 'card', 'pay_MkHH0xQ9P2v3zD'),

('950e8400-e29b-41d4-a716-446655440003', '850e8400-e29b-41d4-a716-446655440003', 'RCP-20241212-0001', '2024-12-12', '450e8400-e29b-41d4-a716-446655440003', '350e8400-e29b-41d4-a716-446655440001', 'Amit Patel', 'Dr. Ashok Kumar', 500.00, 0.00, 0.00, 500.00, 'netbanking', 'pay_MkHH1xQ9P2v3zF');

-- ============================================
-- SYNC QUEUE (Offline data waiting to sync)
-- ============================================

INSERT INTO sync_queue (sync_id, user_id, entity_type, entity_id, operation, data, status, device_timestamp) VALUES

-- Pending adherence sync
('a50e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'adherence', '050e8400-e29b-41d4-a716-446655440003', 'update', 
'{"is_taken": false, "is_skipped": true, "skip_reason": "Forgot to carry medicine"}'::jsonb, 
'pending', '2024-12-10 21:30:00'),

-- Synced data
('a50e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', 'adherence', '050e8400-e29b-41d4-a716-446655440009', 'create',
'{"medicine_name": "Metformin 500mg", "scheduled_date": "2024-12-13", "is_taken": true}'::jsonb,
'synced', '2024-12-13 09:00:00');

-- ============================================
-- SUMMARY QUERIES (Run these to verify data)
-- ============================================

-- Total users by role
-- SELECT role, COUNT(*) as count FROM users GROUP BY role;

-- Appointments by status
-- SELECT status, COUNT(*) as count FROM appointments GROUP BY status;

-- Payment success rate
-- SELECT 
--   status, 
--   COUNT(*) as count,
--   SUM(amount) as total_amount
-- FROM finance_transactions 
-- GROUP BY status;

-- Adherence rate per prescription
-- SELECT * FROM adherence_progress;

-- Upcoming appointments
-- SELECT * FROM upcoming_appointments;

SELECT 'Demo data inserted successfully! 🎉' as message,
       'Users: ' || (SELECT COUNT(*) FROM users) as users_count,
       'Patients: ' || (SELECT COUNT(*) FROM patients) as patients_count,
       'Doctors: ' || (SELECT COUNT(*) FROM doctors) as doctors_count,
       'Appointments: ' || (SELECT COUNT(*) FROM appointments) as appointments_count,
       'Prescriptions: ' || (SELECT COUNT(*) FROM prescriptions) as prescriptions_count,
       'Transactions: ' || (SELECT COUNT(*) FROM finance_transactions) as transactions_count;