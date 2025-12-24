-- ============================================
-- AYURSUTRAM DEMO SEED DATA - HIGHLY VERSATILE
-- Real-world data with maximum variation
-- ============================================

-- Clear existing data
TRUNCATE TABLE sync_queue, app_translations, receipts, finance_transactions, 
    medication_adherence, prescriptions, appointments, doctors, patients, users 
RESTART IDENTITY CASCADE;

-- ============================================
-- USERS - 25 Total (15 Patients + 8 Doctors + 2 Admins)
-- ============================================

-- PATIENTS (15 diverse profiles)
INSERT INTO users (uid, email, phone, password_hash, role, name, profile_image_url, is_verified, is_active) VALUES
-- Young adults (20-30 years)
('550e8400-e29b-41d4-a716-446655440001', 'rajesh.kumar@gmail.com', '+919876543210', '$2b$10$EixZaYVK1fsbw1ZfbX3OXe/SBZUnVKpDw2rDw45GpK7O', 'patient', 'Rajesh Kumar', 'https://i.pravatar.cc/150?img=12', true, true),
('550e8400-e29b-41d4-a716-446655440002', 'ananya.sharma@outlook.com', '+919876543211', '$2b$10$EixZaYVK1fsbw1ZfbX3OXe/SBZUnVKpDw2rDw45GpK7O', 'patient', 'Ananya Sharma', 'https://i.pravatar.cc/150?img=5', true, true),
('550e8400-e29b-41d4-a716-446655440003', 'vikram.reddy@yahoo.com', '+919876543212', '$2b$10$EixZaYVK1fsbw1ZfbX3OXe/SBZUnVKpDw2rDw45GpK7O', 'patient', 'Vikram Reddy', 'https://i.pravatar.cc/150?img=15', true, true),

-- Middle-aged (30-50 years)
('550e8400-e29b-41d4-a716-446655440004', 'priya.patel@gmail.com', '+919876543213', '$2b$10$EixZaYVK1fsbw1ZfbX3OXe/SBZUnVKpDw2rDw45GpK7O', 'patient', 'Priya Patel', 'https://i.pravatar.cc/150?img=9', true, true),
('550e8400-e29b-41d4-a716-446655440005', 'amit.desai@hotmail.com', '+919876543214', '$2b$10$EixZaYVK1fsbw1ZfbX3OXe/SBZUnVKpDw2rDw45GpK7O', 'patient', 'Amit Desai', 'https://i.pravatar.cc/150?img=33', true, true),
('550e8400-e29b-41d4-a716-446655440006', 'sneha.iyer@gmail.com', '+919876543215', '$2b$10$EixZaYVK1fsbw1ZfbX3OXe/SBZUnVKpDw2rDw45GpK7O', 'patient', 'Sneha Iyer', 'https://i.pravatar.cc/150?img=20', true, true),
('550e8400-e29b-41d4-a716-446655440007', 'rahul.mehta@yahoo.com', '+919876543216', '$2b$10$EixZaYVK1fsbw1ZfbX3OXe/SBZUnVKpDw2rDw45GpK7O', 'patient', 'Rahul Mehta', 'https://i.pravatar.cc/150?img=51', true, true),
('550e8400-e29b-41d4-a716-446655440008', 'deepika.nair@gmail.com', '+919876543217', '$2b$10$EixZaYVK1fsbw1ZfbX3OXe/SBZUnVKpDw2rDw45GpK7O', 'patient', 'Deepika Nair', 'https://i.pravatar.cc/150?img=25', true, true),

-- Senior citizens (50-75 years)
('550e8400-e29b-41d4-a716-446655440009', 'kavita.joshi@hotmail.com', '+919876543218', '$2b$10$EixZaYVK1fsbw1ZfbX3OXe/SBZUnVKpDw2rDw45GpK7O', 'patient', 'Kavita Joshi', 'https://i.pravatar.cc/150?img=47', true, true),
('550e8400-e29b-41d4-a716-446655440010', 'suresh.gupta@gmail.com', '+919876543219', '$2b$10$EixZaYVK1fsbw1ZfbX3OXe/SBZUnVKpDw2rDw45GpK7O', 'patient', 'Suresh Gupta', 'https://i.pravatar.cc/150?img=68', true, true),
('550e8400-e29b-41d4-a716-446655440011', 'meera.verma@outlook.com', '+919876543220', '$2b$10$EixZaYVK1fsbw1ZfbX3OXe/SBZUnVKpDw2rDw45GpK7O', 'patient', 'Meera Verma', 'https://i.pravatar.cc/150?img=45', true, true),

-- Pediatric cases (parents booking for children)
('550e8400-e29b-41d4-a716-446655440012', 'aditya.singh@gmail.com', '+919876543221', '$2b$10$EixZaYVK1fsbw1ZfbX3OXe/SBZUnVKpDw2rDw45GpK7O', 'patient', 'Aditya Singh', 'https://i.pravatar.cc/150?img=60', true, true),
('550e8400-e29b-41d4-a716-446655440013', 'pooja.bhatt@yahoo.com', '+919876543222', '$2b$10$EixZaYVK1fsbw1ZfbX3OXe/SBZUnVKpDw2rDw45GpK7O', 'patient', 'Pooja Bhatt', 'https://i.pravatar.cc/150?img=38', true, true),

-- Pregnant women
('550e8400-e29b-41d4-a716-446655440014', 'ritu.malhotra@gmail.com', '+919876543223', '$2b$10$EixZaYVK1fsbw1ZfbX3OXe/SBZUnVKpDw2rDw45GpK7O', 'patient', 'Ritu Malhotra', 'https://i.pravatar.cc/150?img=44', true, true),
('550e8400-e29b-41d4-a716-446655440015', 'neha.kapoor@hotmail.com', '+919876543224', '$2b$10$EixZaYVK1fsbw1ZfbX3OXe/SBZUnVKpDw2rDw45GpK7O', 'patient', 'Neha Kapoor', 'https://i.pravatar.cc/150?img=26', true, true);

-- DOCTORS (8 specialists)
INSERT INTO users (uid, email, phone, password_hash, role, name, profile_image_url, is_verified, is_active) VALUES
('650e8400-e29b-41d4-a716-446655440001', 'dr.ashok.kumar@mediheal.com', '+919123456789', '$2b$10$EixZaYVK1fsbw1ZfbX3OXe/SBZUnVKpDw2rDw45GpK7O', 'doctor', 'Dr. Ashok Kumar', 'https://i.pravatar.cc/150?img=59', true, true),
('650e8400-e29b-41d4-a716-446655440002', 'dr.sunita.rao@womenscare.in', '+919123456790', '$2b$10$EixZaYVK1fsbw1ZfbX3OXe/SBZUnVKpDw2rDw45GpK7O', 'doctor', 'Dr. Sunita Rao', 'https://i.pravatar.cc/150?img=48', true, true),
('650e8400-e29b-41d4-a716-446655440003', 'dr.ramesh.iyer@ayurvedic.org', '+919123456791', '$2b$10$EixZaYVK1fsbw1ZfbX3OXe/SBZUnVKpDw2rDw45GpK7O', 'doctor', 'Dr. Ramesh Iyer', 'https://i.pravatar.cc/150?img=56', true, true),
('650e8400-e29b-41d4-a716-446655440004', 'dr.pooja.shah@dentalcare.com', '+919123456792', '$2b$10$EixZaYVK1fsbw1ZfbX3OXe/SBZUnVKpDw2rDw45GpK7O', 'doctor', 'Dr. Pooja Shah', 'https://i.pravatar.cc/150?img=41', true, true),
('650e8400-e29b-41d4-a716-446655440005', 'dr.sanjay.nair@heartcare.in', '+919123456793', '$2b$10$EixZaYVK1fsbw1ZfbX3OXe/SBZUnVKpDw2rDw45GpK7O', 'doctor', 'Dr. Sanjay Nair', 'https://i.pravatar.cc/150?img=52', true, true),
('650e8400-e29b-41d4-a716-446655440006', 'dr.anjali.deshmukh@pediatrics.com', '+919123456794', '$2b$10$EixZaYVK1fsbw1ZfbX3OXe/SBZUnVKpDw2rDw45GpK7O', 'doctor', 'Dr. Anjali Deshmukh', 'https://i.pravatar.cc/150?img=32', true, true),
('650e8400-e29b-41d4-a716-446655440007', 'dr.vikrant.bose@orthopedics.in', '+919123456795', '$2b$10$EixZaYVK1fsbw1ZfbX3OXe/SBZUnVKpDw2rDw45GpK7O', 'doctor', 'Dr. Vikrant Bose', 'https://i.pravatar.cc/150?img=67', true, true),
('650e8400-e29b-41d4-a716-446655440008', 'dr.swati.menon@dermatology.com', '+919123456796', '$2b$10$EixZaYVK1fsbw1ZfbX3OXe/SBZUnVKpDw2rDw45GpK7O', 'doctor', 'Dr. Swati Menon', 'https://i.pravatar.cc/150?img=29', true, true);

-- ADMINS
INSERT INTO users (uid, email, phone, password_hash, role, name, profile_image_url, is_verified, is_active) VALUES
('750e8400-e29b-41d4-a716-446655440001', 'admin@ayursutram.com', '+919000000001', '$2b$10$EixZaYVK1fsbw1ZfbX3OXe/SBZUnVKpDw2rDw45GpK7O', 'admin', 'System Admin', 'https://i.pravatar.cc/150?img=70', true, true),
('750e8400-e29b-41d4-a716-446655440002', 'support@ayursutram.com', '+919000000002', '$2b$10$EixZaYVK1fsbw1ZfbX3OXe/SBZUnVKpDw2rDw45GpK7O', 'admin', 'Support Admin', 'https://i.pravatar.cc/150?img=66', true, true);

-- ============================================
-- PATIENTS - Highly Versatile Medical Profiles
-- ============================================

INSERT INTO patients (pid, uid, date_of_birth, gender, blood_group, allergies, current_medications, chronic_conditions, address_line1, city, state, postal_code, emergency_contact_name, emergency_contact_phone) VALUES

-- 1. Young male, healthy, tech worker
('450e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '1998-03-15', 'male', 'O+', 
ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY[]::TEXT[],
'Flat 304, Tech Park Apartments, Scheme 78', 'Indore', 'Madhya Pradesh', '452010', 
'Ramesh Kumar', '+919876543230'),

-- 2. Young female, athlete with sports injury history
('450e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', '2000-07-22', 'female', 'A+',
ARRAY['Sulfa drugs'], ARRAY['Protein supplements'], ARRAY['Previous ACL injury'],
'B-205, Royal Residency, AB Road', 'Indore', 'Madhya Pradesh', '452001',
'Rajiv Sharma', '+919876543231'),

-- 3. Young male IT professional with sedentary lifestyle
('450e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', '1996-11-08', 'male', 'B+',
ARRAY['Pollen', 'Dust'], ARRAY['Vitamin D3 supplements'], ARRAY['Vitamin D deficiency', 'Cervical spondylosis'],
'401, Silicon Heights, Vijay Nagar', 'Indore', 'Madhya Pradesh', '452010',
'Neha Reddy', '+919876543232'),

-- 4. Middle-aged female with thyroid
('450e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', '1985-05-14', 'female', 'AB+',
ARRAY['Penicillin', 'Iodine'], ARRAY['Levothyroxine 75mcg', 'Calcium carbonate'], ARRAY['Hypothyroidism', 'Osteopenia'],
'House No. 89, Sapna Sangeeta Road', 'Indore', 'Madhya Pradesh', '452003',
'Kiran Patel', '+919876543233'),

-- 5. Middle-aged male with diabetes
('450e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440005', '1978-09-30', 'male', 'O-',
ARRAY[]::TEXT[], ARRAY['Metformin 1000mg', 'Atorvastatin 20mg'], ARRAY['Type 2 Diabetes', 'Dyslipidemia'],
'Plot 67, Annapurna Road', 'Indore', 'Madhya Pradesh', '452009',
'Anjali Desai', '+919876543234'),

-- 6. Middle-aged female teacher with hypertension
('450e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440006', '1982-12-25', 'female', 'A-',
ARRAY['Aspirin', 'NSAIDs'], ARRAY['Amlodipine 5mg', 'Losartan 50mg'], ARRAY['Hypertension', 'Migraine'],
'12/A, Teachers Colony, Tilak Nagar', 'Indore', 'Madhya Pradesh', '452018',
'Prakash Iyer', '+919876543235'),

-- 7. Middle-aged male with heart disease
('450e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440007', '1975-04-18', 'male', 'B-',
ARRAY['Shellfish'], ARRAY['Clopidogrel 75mg', 'Metoprolol 50mg', 'Atorvastatin 40mg'], ARRAY['Coronary Artery Disease', 'Post-angioplasty'],
'Villa 23, Green Park Extension', 'Indore', 'Madhya Pradesh', '452016',
'Radha Mehta', '+919876543236'),

-- 8. Middle-aged female with PCOS
('450e8400-e29b-41d4-a716-446655440008', '550e8400-e29b-41d4-a716-446655440008', '1988-08-10', 'female', 'O+',
ARRAY['Latex'], ARRAY['Metformin 500mg', 'Oral contraceptives'], ARRAY['PCOS', 'Insulin resistance'],
'Flat 102, Sunrise Apartments, Rau', 'Indore', 'Madhya Pradesh', '452012',
'Arun Nair', '+919876543237'),

-- 9. Senior male with multiple conditions
('450e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440009', '1955-01-20', 'male', 'AB-',
ARRAY['Sulfa drugs', 'Contrast dye'], ARRAY['Insulin glargine', 'Aspirin 75mg', 'Ramipril 5mg', 'Pantoprazole 40mg'], ARRAY['Type 2 Diabetes', 'Hypertension', 'CKD Stage 2', 'GERD'],
'Old House 45, Rajendra Nagar', 'Indore', 'Madhya Pradesh', '452012',
'Deepa Joshi', '+919876543238'),

-- 10. Senior female with arthritis
('450e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440010', '1958-06-05', 'female', 'A+',
ARRAY['Morphine', 'Codeine'], ARRAY['Hydroxychloroquine 200mg', 'Calcium+Vit D', 'Folic acid'], ARRAY['Rheumatoid Arthritis', 'Osteoporosis'],
'Bungalow 12, Scheme 54', 'Indore', 'Madhya Pradesh', '452010',
'Mahesh Gupta', '+919876543239'),

-- 11. Senior male with Parkinson's
('450e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440011', '1952-11-15', 'male', 'O+',
ARRAY[]::TEXT[], ARRAY['Levodopa+Carbidopa', 'Pramipexole', 'Donepezil'], ARRAY['Parkinson Disease', 'Mild Cognitive Impairment'],
'Senior Citizen Home, University Road', 'Indore', 'Madhya Pradesh', '452001',
'Dr. Meera Verma', '+919876543240'),

-- 12. Child (parent account) - Asthmatic
('450e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440012', '2015-04-10', 'male', 'B+',
ARRAY['Peanuts', 'Tree nuts', 'Eggs'], ARRAY['Salbutamol inhaler', 'Montelukast 4mg'], ARRAY['Bronchial Asthma', 'Allergic rhinitis'],
'204, Happy Homes, South Tukoganj', 'Indore', 'Madhya Pradesh', '452001',
'Priya Singh', '+919876543241'),

-- 13. Teenager with Type 1 Diabetes
('450e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440013', '2008-09-18', 'female', 'A+',
ARRAY[]::TEXT[], ARRAY['Insulin pump therapy', 'Continuous glucose monitor'], ARRAY['Type 1 Diabetes'],
'Flat 501, Orchid Towers, Palasia', 'Indore', 'Madhya Pradesh', '452001',
'Ramesh Bhatt', '+919876543242'),

-- 14. Pregnant woman - 1st trimester
('450e8400-e29b-41d4-a716-446655440014', '550e8400-e29b-41d4-a716-446655440014', '1990-02-14', 'female', 'O+',
ARRAY[]::TEXT[], ARRAY['Prenatal vitamins', 'Folic acid 5mg', 'Iron supplements'], ARRAY[]::TEXT[],
'A-303, Lake View Residency, AB Road', 'Indore', 'Madhya Pradesh', '452001',
'Amit Malhotra', '+919876543243'),

-- 15. Pregnant woman - 3rd trimester with gestational diabetes
('450e8400-e29b-41d4-a716-446655440015', '550e8400-e29b-41d4-a716-446655440015', '1987-12-08', 'female', 'B+',
ARRAY['Penicillin'], ARRAY['Insulin regular', 'Prenatal vitamins', 'Calcium'], ARRAY['Gestational Diabetes', 'Previous C-section'],
'House 78, New Palasia', 'Indore', 'Madhya Pradesh', '452001',
'Rajat Kapoor', '+919876543244');

-- ============================================
-- DOCTORS - Diverse Specializations & Setups
-- ============================================

INSERT INTO doctors (did, uid, specialization, qualification, registration_number, years_of_experience, consultation_fee, bio, clinic_name, address_line1, city, state, postal_code, languages, is_verified) VALUES

-- 1. General Physician - High volume practice
('350e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 'General Medicine & Family Physician', 
'MBBS, MD (Internal Medicine)', 'MCI/2009/MP/12345', 18, 500.00,
'Senior consultant with expertise in managing chronic diseases, preventive healthcare, and acute illnesses. Special interest in diabetes and hypertension management.',
'Kumar Multispecialty Clinic', '45-A, Nehru Stadium Road', 'Indore', 'Madhya Pradesh', '452001',
ARRAY['English', 'Hindi', 'Marathi'], true),

-- 2. Gynecologist & Obstetrician
('350e8400-e29b-41d4-a716-446655440002', '650e8400-e29b-41d4-a716-446655440002', 'Gynecology & Obstetrics',
'MBBS, MS (OB-GYN), Fellowship in High-Risk Pregnancy', 'MCI/2012/MP/23456', 12, 800.00,
'Specialist in high-risk pregnancies, infertility treatment, and minimally invasive gynecological surgeries. PCOS and endometriosis expert.',
'Rao Women''s Health Center', '123, Scheme 54, Near Brilliant Convention', 'Indore', 'Madhya Pradesh', '452010',
ARRAY['English', 'Hindi', 'Telugu', 'Marathi'], true),

-- 3. Ayurvedic Physician - No registration (optional field demo)
('350e8400-e29b-41d4-a716-446655440003', '650e8400-e29b-41d4-a716-446655440003', 'Ayurveda & Panchakarma Specialist',
'BAMS, MD (Ayurveda), PhD (Ayurvedic Medicine)', NULL, 22, 600.00,
'Traditional Ayurvedic practitioner specializing in Panchakarma therapies, chronic pain management, stress-related disorders, and lifestyle diseases.',
'Ayur Wellness & Panchakarma Center', '78, Rajendra Nagar, Near Devi Ahilya University', 'Indore', 'Madhya Pradesh', '452012',
ARRAY['English', 'Hindi', 'Sanskrit', 'Tamil'], true),

-- 4. Dentist - No clinic address (home-based/visiting)
('350e8400-e29b-41d4-a716-446655440004', '650e8400-e29b-41d4-a716-446655440004', 'Dental Surgery & Orthodontics',
'BDS, MDS (Orthodontics), Certificate in Cosmetic Dentistry', 'DCI/2015/MP/34567', 9, 700.00,
'Expert in braces, aligners, teeth whitening, root canal treatment, and cosmetic dental procedures. Modern painless dentistry techniques.',
NULL, NULL, NULL, NULL, NULL,
ARRAY['English', 'Hindi', 'Gujarati'], true),

-- 5. Cardiologist - Premium practice
('350e8400-e29b-41d4-a716-446655440005', '650e8400-e29b-41d4-a716-446655440005', 'Interventional Cardiology',
'MBBS, MD (Medicine), DM (Cardiology), FSCAI', 'MCI/2005/MP/45678', 20, 1500.00,
'Senior interventional cardiologist with expertise in angioplasty, pacemaker implantation, and management of complex cardiac conditions.',
'Nair Advanced Heart Care Institute', '234, Race Course Road, Near C21 Mall', 'Indore', 'Madhya Pradesh', '452003',
ARRAY['English', 'Hindi', 'Malayalam'], true),

-- 6. Pediatrician
('350e8400-e29b-41d4-a716-446655440006', '650e8400-e29b-41d4-a716-446655440006', 'Pediatrics & Neonatology',
'MBBS, MD (Pediatrics), Fellowship in Neonatology', 'MCI/2013/MP/56789', 11, 600.00,
'Child specialist with expertise in newborn care, childhood vaccinations, growth disorders, and pediatric emergencies. Child-friendly approach.',
'Little Angels Pediatric Clinic', '89, Treasure Island Mall Road', 'Indore', 'Madhya Pradesh', '452010',
ARRAY['English', 'Hindi', 'Marathi', 'Bengali'], true),

-- 7. Orthopedic Surgeon
('350e8400-e29b-41d4-a716-446655440007', '650e8400-e29b-41d4-a716-446655440007', 'Orthopedic Surgery & Sports Medicine',
'MBBS, MS (Orthopedics), DNB, Fellowship in Sports Medicine', 'MCI/2010/MP/67890', 14, 900.00,
'Specialist in joint replacement, arthroscopy, sports injuries, and spine surgery. Advanced minimally invasive techniques.',
'Bose Bone & Joint Clinic', 'Shop 12-13, Satya Sai Square, Vijay Nagar', 'Indore', 'Madhya Pradesh', '452010',
ARRAY['English', 'Hindi', 'Bengali'], true),

-- 8. Dermatologist
('350e8400-e29b-41d4-a716-446655440008', '650e8400-e29b-41d4-a716-446655440008', 'Dermatology, Venereology & Cosmetology',
'MBBS, MD (Dermatology), Fellowship in Aesthetic Dermatology', 'MCI/2014/MP/78901', 10, 800.00,
'Expert in skin diseases, hair fall treatment, acne management, laser procedures, and anti-aging treatments. Latest cosmetic dermatology techniques.',
'Menon Skin & Laser Clinic', '456, Bombay Hospital Road, Near Apollo Hospital', 'Indore', 'Madhya Pradesh', '452010',
ARRAY['English', 'Hindi', 'Malayalam', 'Tamil'], true);

-- ============================================
-- APPOINTMENTS - Realistic Mix (20 appointments)
-- ============================================

INSERT INTO appointments (aid, pid, did, mode, status, scheduled_date, scheduled_time, start_time, end_time, duration_minutes, token_number, queue_position, meeting_link, meeting_id, chief_complaint, symptoms, doctor_notes) VALUES

-- PAST COMPLETED APPOINTMENTS (8)
('250e8400-e29b-41d4-a716-446655440001', '450e8400-e29b-41d4-a716-446655440001', '350e8400-e29b-41d4-a716-446655440001', 
'offline', 'completed', '2024-12-05', '10:00:00', '2024-12-05 10:05:00', '2024-12-05 10:25:00', 20,
1, NULL, NULL, NULL,
'Viral fever and body ache for 3 days', ARRAY['Fever 101°F', 'Body ache', 'Headache', 'Fatigue'],
'Acute viral infection. Prescribed antipyretics and symptomatic treatment. Advised rest and fluids.'),

('250e8400-e29b-41d4-a716-446655440002', '450e8400-e29b-41d4-a716-446655440014', '350e8400-e29b-41d4-a716-446655440002',
'online', 'completed', '2024-12-06', '15:00:00', '2024-12-06 15:02:00', '2024-12-06 15:35:00', 33,
NULL, NULL, 'https://meet.google.com/abc-defg-ritu', 'abc-defg-ritu',
'First trimester checkup - 10 weeks pregnant', ARRAY['Mild nausea', 'Fatigue', 'Breast tenderness'],
'Normal early pregnancy. Continue prenatal vitamins. NT scan scheduled. Next visit at 14 weeks.'),

('250e8400-e29b-41d4-a716-446655440003', '450e8400-e29b-41d4-a716-446655440005', '350e8400-e29b-41d4-a716-446655440001',
'offline', 'completed', '2024-12-08', '11:00:00', '2024-12-08 11:10:00', '2024-12-08 11:35:00', 25,
3, NULL, NULL, NULL,
'Blood sugar levels high - running out of medicines', ARRAY['Fasting BS: 180 mg/dL', 'PP BS: 240 mg/dL', 'Increased thirst'],
'Poor glycemic control. Adjusted Metformin dose to 1000mg BD. Added Glimepiride. Dietary counseling done. HbA1c ordered.'),

('250e8400-e29b-41d4-a716-446655440004', '450e8400-e29b-41d4-a716-446655440012', '350e8400-e29b-41d4-a716-446655440006',
'offline', 'completed', '2024-12-09', '16:30:00', '2024-12-09 16:35:00', '2024-12-09 16:50:00', 15,
8, NULL, NULL, NULL,
'Persistent cough and wheezing for 5 days', ARRAY['Dry cough', 'Wheezing', 'Difficulty breathing at night'],
'Acute asthma exacerbation. Nebulization given. Adjusted inhaler technique. Added oral steroids for 3 days.'),

('250e8400-e29b-41d4-a716-446655440005', '450e8400-e29b-41d4-a716-446655440007', '350e8400-e29b-41d4-a716-446655440005',
'online', 'completed', '2024-12-10', '10:00:00', '2024-12-10 10:05:00', '2024-12-10 10:40:00', 35,
NULL, NULL, 'https://meet.google.com/heart-care-xyz', 'heart-care-xyz',
'Post-angioplasty follow-up after 3 months', ARRAY['Occasional chest discomfort', 'On exertion'],
'Stent patent. ECG and Echo normal. Continue dual antiplatelet therapy. Stress test scheduled. Cholesterol well controlled.'),

('250e8400-e29b-41d4-a716-446655440006', '450e8400-e29b-41d4-a716-446655440002', '350e8400-e29b-41d4-a716-446655440008',
'offline', 'completed', '2024-12-11', '14:00:00', '2024-12-11 14:05:00', '2024-12-11 14:25:00', 20,
2, NULL, NULL, NULL,
'Acne breakouts on face and back', ARRAY['Inflammatory acne', 'Pustules', 'Oily skin'],
'Moderate acne vulgaris. Prescribed topical retinoid and benzoyl peroxide. Oral antibiotics for 6 weeks. Skincare routine advised.'),

('250e8400-e29b-41d4-a716-446655440007', '450e8400-e29b-41d4-a716-446655440010', '350e8400-e29b-41d4-a716-446655440007',
'offline', 'completed', '2024-12-12', '09:30:00', '2024-12-12 09:35:00', '2024-12-12 10:00:00', 25,
1, NULL, NULL, NULL,
'Severe knee pain and stiffness - both knees', ARRAY['Joint pain', 'Morning stiffness', 'Swelling', 'Difficulty climbing stairs'],
'Osteoarthritis both knees - Grade 2. Started on NSAIDs, glucosamine. Physiotherapy advised. Weight reduction counseling. Consider intra-articular injection if no relief.'),

('250e8400-e29b-41d4-a716-446655440008', '450e8400-e29b-41d4-a716-446655440004', '350e8400-e29b-41d4-a716-446655440001',
'online', 'completed', '2024-12-13', '17:00:00', '2024-12-13 17:05:00', '2024-12-13 17:30:00', 25,
NULL, NULL, 'https://meet.google.com/thyroid-consult', 'thyroid-consult',
'Thyroid medication review - feeling tired', ARRAY['Fatigue', 'Weight gain 2kg', 'Hair fall'],
'TSH slightly elevated at 6.2. Increased Levothyroxine to 88mcg. Recheck TSH after 6 weeks. Continue calcium supplement.'),

-- TODAY'S APPOINTMENTS (2 in-progress, 2 scheduled)
('250e8400-e29b-41d4-a716-446655440009', '450e8400-e29b-41d4-a716-446655440003', '350e8400-e29b-41d4-a716-446655440001',
'offline', 'in_progress', CURRENT_DATE, '10:00:00', NOW() - INTERVAL '15 minutes', NULL, NULL,
1, NULL, NULL, NULL,
'Neck pain and headache - working from home', ARRAY['Neck stiffness', 'Headache', 'Shoulder pain'],
NULL),

('250e8400-e29b-41d4-a716-446655440010', '450e8400-e29b-41d4-a716-446655440006', '350e8400-e29b-41d4-a716-446655440001',
'offline', 'in_progress', CURRENT_DATE, '10:30:00', NOW() - INTERVAL '5 minutes', NULL, NULL,
2, NULL, NULL, NULL,
'High BP reading at home - 160/100', ARRAY['Headache', 'Dizziness', 'Nausea'],
NULL),

('250e8400-e29b-41d4-a716-446655440011', '450e8400-e29b-41d4-a716-446655440008', '350e8400-e29b-41d4-a716-446655440002',
'online', 'scheduled', CURRENT_DATE, '15:00:00', NULL, NULL, NULL,
NULL, NULL, 'https://meet.google.com/pcos-consult-today', 'pcos-consult-today',
'PCOS follow-up - irregular periods', ARRAY['Irregular cycles', 'Weight gain', 'Acne'],
NULL),

('250e8400-e29b-41d4-a716-446655440012', '450e8400-e29b-41d4-a716-446655440009', '350e8400-e29b-41d4-a716-446655440001',
'offline', 'scheduled', CURRENT_DATE, '11:00:00', NULL, NULL, NULL,
3, 3, NULL, NULL,
'Diabetes and BP checkup - routine visit', ARRAY['Feeling okay', 'Some weakness'],
NULL),

-- UPCOMING APPOINTMENTS (8)
('250e8400-e29b-41d4-a716-446655440013', '450e8400-e29b-41d4-a716-446655440013', '350e8400-e29b-41d4-a716-446655440006',
'offline', 'confirmed', CURRENT_DATE + 1, '16:00:00', NULL, NULL, NULL,
5, 5, NULL, NULL,
'Type 1 Diabetes review - insulin pump settings', ARRAY['Blood sugar fluctuations', 'Occasional hypoglycemia'],
NULL),

('250e8400-e29b-41d4-a716-446655440014', '450e8400-e29b-41d4-a716-446655440015', '350e8400-e29b-41d4-a716-446655440002',
'online', 'scheduled', CURRENT_DATE + 2, '11:00:00', NULL, NULL, NULL,
NULL, NULL, 'https://meet.google.com/pregnancy-36weeks', 'pregnancy-36weeks',
'36 weeks pregnancy checkup - gestational diabetes', ARRAY['Fatigue', 'Swelling in feet', 'Blood sugar managed'],
NULL),

('250e8400-e29b-41d4-a716-446655440015', '450e8400-e29b-41d4-a716-446655440011', '350e8400-e29b-41d4-a716-446655440001',
'offline', 'scheduled', CURRENT_DATE + 2, '14:00:00', NULL, NULL, NULL,
2, 2, NULL, NULL,
'Parkinson medication adjustment - tremors increased', ARRAY['Increased tremors', 'Balance issues', 'Sleep disturbances'],
NULL),

('250e8400-e29b-41d4-a716-446655440016', '450e8400-e29b-41d4-a716-446655440002', '350e8400-e29b-41d4-a716-446655440007',
'offline', 'confirmed', CURRENT_DATE + 3, '10:00:00', NULL, NULL, NULL,
1, 1, NULL, NULL,
'Sports injury - ankle sprain 2 weeks ago', ARRAY['Ankle pain', 'Swelling', 'Difficulty walking'],
NULL),

('250e8400-e29b-41d4-a716-446655440017', '450e8400-e29b-41d4-a716-446655440001', '350e8400-e29b-41d4-a716-446655440003',
'online', 'scheduled', CURRENT_DATE + 4, '09:00:00', NULL, NULL, NULL,
NULL, NULL, 'https://meet.google.com/ayurveda-stress', 'ayurveda-stress',
'Stress management and sleep issues', ARRAY['Work stress', 'Insomnia', 'Anxiety'],
NULL),

('250e8400-e29b-41d4-a716-446655440018', '450e8400-e29b-41d4-a716-446655440004', '350e8400-e29b-41d4-a716-446655440004',
'offline', 'scheduled', CURRENT_DATE + 5, '16:00:00', NULL, NULL, NULL,
4, 4, NULL, NULL,
'Dental cleaning and cavity filling', ARRAY['Tooth sensitivity', 'Cavity in molar'],
NULL),

('250e8400-e29b-41d4-a716-446655440019', '450e8400-e29b-41d4-a716-446655440007', '350e8400-e29b-41d4-a716-446655440005',
'online', 'confirmed', CURRENT_DATE + 7, '11:30:00', NULL, NULL, NULL,
NULL, NULL, 'https://meet.google.com/cardio-followup-6m', 'cardio-followup-6m',
'6-month post-angioplasty review', ARRAY['Doing well', 'No chest pain', 'Regular exercise'],
NULL),

('250e8400-e29b-41d4-a716-446655440020', '450e8400-e29b-41d4-a716-446655440012', '350e8400-e29b-41d4-a716-446655440006',
'offline', 'scheduled', CURRENT_DATE + 10, '17:00:00', NULL, NULL, NULL,
6, 6, NULL, NULL,
'Asthma review and vaccination due', ARRAY['Asthma controlled', 'Due for flu vaccine'],
NULL);

-- ============================================
-- PRESCRIPTIONS - Highly Versatile (10 prescriptions)
-- ============================================

INSERT INTO prescriptions (prescription_id, aid, pid, did, diagnosis, symptoms, medicines, instructions, diet_advice, follow_up_date, ai_generated, ai_suggestions, is_active) VALUES

-- 1. Viral Fever - AI Generated
('150e8400-e29b-41d4-a716-446655440001', '250e8400-e29b-41d4-a716-446655440001', '450e8400-e29b-41d4-a716-446655440001', '350e8400-e29b-41d4-a716-446655440001',
'Acute Viral Fever (Upper Respiratory Tract Infection)',
ARRAY['Fever 101°F', 'Body ache', 'Headache', 'Fatigue'],
'[
    {"name": "Paracetamol 650mg", "dosage": "1 tablet", "frequency": "Three times daily", "duration": "5 days", "instructions": "After meals with water"},
    {"name": "Cetirizine 10mg", "dosage": "1 tablet", "frequency": "Once daily at bedtime", "duration": "5 days", "instructions": "Before sleep"},
    {"name": "Vitamin C 500mg", "dosage": "1 tablet", "frequency": "Once daily", "duration": "7 days", "instructions": "After breakfast"}
]'::jsonb,
'Take adequate rest. Avoid going out. Steam inhalation 2-3 times daily. Gargle with warm salt water. Drink plenty of fluids (8-10 glasses/day).',
'Avoid cold foods and beverages. Consume warm soups, herbal tea. Light easily digestible food. Include citrus fruits for Vitamin C.',
CURRENT_DATE + 7,
true,
'{"model": "gemini-1.5-flash", "confidence": 0.94, "generated_at": "2024-12-05T10:20:00Z"}'::jsonb,
false),

-- 2. Pregnancy - 1st Trimester (Manual prescription)
('150e8400-e29b-41d4-a716-446655440002', '250e8400-e29b-41d4-a716-446655440002', '450e8400-e29b-41d4-a716-446655440014', '350e8400-e29b-41d4-a716-446655440002',
'Normal Pregnancy - First Trimester (10 weeks)',
ARRAY['Mild nausea', 'Fatigue', 'Breast tenderness'],
'[
    {"name": "Folic Acid 5mg", "dosage": "1 tablet", "frequency": "Once daily", "duration": "Throughout pregnancy", "instructions": "After breakfast"},
    {"name": "Calcium Carbonate 500mg + Vitamin D3 250IU", "dosage": "1 tablet", "frequency": "Twice daily", "duration": "Throughout pregnancy", "instructions": "Morning and evening after meals"},
    {"name": "Iron + Folic Acid", "dosage": "1 tablet", "frequency": "Once daily", "duration": "Throughout pregnancy", "instructions": "At bedtime with Vitamin C rich food"},
    {"name": "Doxylamine 10mg + Pyridoxine 10mg", "dosage": "1 tablet", "frequency": "Once daily as needed", "duration": "Till nausea subsides", "instructions": "At bedtime for nausea"}
]'::jsonb,
'Adequate rest essential. Avoid heavy lifting. Moderate walking recommended. Avoid stress. Attend all prenatal checkups.',
'Balanced diet with proteins, calcium, iron. Small frequent meals for nausea. Avoid raw/undercooked food. Stay well hydrated. Avoid junk food and caffeine.',
CURRENT_DATE + 28,
false,
NULL,
true),

-- 3. Diabetes - Uncontrolled (AI Generated with modifications)
('150e8400-e29b-41d4-a716-446655440003', '250e8400-e29b-41d4-a716-446655440003', '450e8400-e29b-41d4-a716-446655440005', '350e8400-e29b-41d4-a716-446655440001',
'Type 2 Diabetes Mellitus - Poorly Controlled',
ARRAY['Fasting BS: 180 mg/dL', 'PP BS: 240 mg/dL', 'Increased thirst'],
'[
    {"name": "Metformin 1000mg (SR)", "dosage": "1 tablet", "frequency": "Twice daily", "duration": "30 days", "instructions": "After breakfast and dinner"},
    {"name": "Glimepiride 2mg", "dosage": "1 tablet", "frequency": "Once daily", "duration": "30 days", "instructions": "Before breakfast"},
    {"name": "Atorvastatin 10mg", "dosage": "1 tablet", "frequency": "Once daily at bedtime", "duration": "30 days", "instructions": "After dinner"}
]'::jsonb,
'Monitor fasting and PP blood sugar daily. Maintain sugar diary. Exercise 30 mins daily (brisk walking). Regular foot care. Eye checkup due.',
'Strict diabetic diet - Low carb, high fiber. Avoid sugar, sweets, refined carbs. Small frequent meals. Include green leafy vegetables, whole grains. No aerated drinks.',
CURRENT_DATE + 14,
true,
'{"model": "gemini-1.5-flash", "original_medicines": ["Metformin 500mg BD", "Glimepiride 1mg"], "doctor_modifications": "Increased Metformin to 1000mg, Glimepiride to 2mg due to poor control", "confidence": 0.89}'::jsonb,
true),

-- 4. Pediatric Asthma Exacerbation
('150e8400-e29b-41d4-a716-446655440004', '250e8400-e29b-41d4-a716-446655440004', '450e8400-e29b-41d4-a716-446655440012', '350e8400-e29b-41d4-a716-446655440006',
'Acute Asthma Exacerbation',
ARRAY['Dry cough', 'Wheezing', 'Difficulty breathing at night'],
'[
    {"name": "Salbutamol Inhaler (100mcg)", "dosage": "2 puffs", "frequency": "Four times daily", "duration": "Continue", "instructions": "Use with spacer device"},
    {"name": "Budesonide Inhaler (200mcg)", "dosage": "1 puff", "frequency": "Twice daily", "duration": "Continue", "instructions": "Morning and night, rinse mouth after use"},
    {"name": "Prednisolone 10mg Oral", "dosage": "1 tablet", "frequency": "Once daily", "duration": "3 days", "instructions": "After breakfast"},
    {"name": "Montelukast 4mg", "dosage": "1 tablet", "frequency": "Once daily at bedtime", "duration": "Continue", "instructions": "Before sleep"}
]'::jsonb,
'Avoid allergen triggers - pollen, dust, pets. Keep home dust-free. Proper inhaler technique important - watch video demo. Peak flow monitoring daily.',
'Avoid cold drinks, ice cream. Warm fluids preferable. Include fruits rich in Vitamin C. Adequate hydration.',
CURRENT_DATE + 7,
false, NULL, true),

-- 5. Post-Angioplasty Follow-up
('150e8400-e29b-41d4-a716-446655440005', '250e8400-e29b-41d4-a716-446655440005', '450e8400-e29b-41d4-a716-446655440007', '350e8400-e29b-41d4-a716-446655440005',
'Post-Angioplasty Status - 3 Months',
ARRAY['Occasional chest discomfort', 'On exertion'],
'[
    {"name": "Clopidogrel 75mg", "dosage": "1 tablet", "frequency": "Once daily", "duration": "Continue", "instructions": "After breakfast - Do not stop"},
    {"name": "Aspirin 75mg", "dosage": "1 tablet", "frequency": "Once daily", "duration": "Continue", "instructions": "After dinner"},
    {"name": "Atorvastatin 40mg", "dosage": "1 tablet", "frequency": "Once daily at bedtime", "duration": "Continue", "instructions": "After dinner"},
    {"name": "Metoprolol 50mg", "dosage": "1 tablet", "frequency": "Twice daily", "duration": "Continue", "instructions": "Morning and evening"}
]'::jsonb,
'Continue medications religiously. Regular walking 30 mins daily. Avoid heavy exertion. Monitor BP daily. Stress test scheduled.',
'Heart-healthy diet - Low salt, low fat. Avoid fried foods, red meat. Include fish, nuts, olive oil. No smoking, alcohol.',
CURRENT_DATE + 90,
false, NULL, true);

-- Additional prescriptions (compact format for brevity)
INSERT INTO prescriptions (prescription_id, aid, pid, did, diagnosis, symptoms, medicines, instructions, diet_advice, follow_up_date, ai_generated, is_active) VALUES
('150e8400-e29b-41d4-a716-446655440006', '250e8400-e29b-41d4-a716-446655440006', '450e8400-e29b-41d4-a716-446655440002', '350e8400-e29b-41d4-a716-446655440008',
'Acne Vulgaris - Moderate', ARRAY['Inflammatory acne', 'Pustules', 'Oily skin'],
'[{"name": "Adapalene 0.1% Gel", "dosage": "Apply thin layer", "frequency": "Once daily at night", "duration": "12 weeks", "instructions": "On clean dry face, avoid sun"}, {"name": "Clindamycin 1% Gel", "dosage": "Apply", "frequency": "Twice daily", "duration": "8 weeks", "instructions": "Morning and evening"}, {"name": "Doxycycline 100mg", "dosage": "1 capsule", "frequency": "Once daily", "duration": "6 weeks", "instructions": "After food"}]'::jsonb,
'Gentle face washing twice daily. Oil-free moisturizer. Sunscreen mandatory. Avoid touching face.',
'Drink plenty of water. Avoid oily, spicy foods. Include fruits, vegetables. No junk food.',
CURRENT_DATE + 28, false, true),

('150e8400-e29b-41d4-a716-446655440007', '250e8400-e29b-41d4-a716-446655440007', '450e8400-e29b-41d4-a716-446655440010', '350e8400-e29b-41d4-a716-446655440007',
'Osteoarthritis Both Knees - Grade 2', ARRAY['Joint pain', 'Morning stiffness', 'Swelling'],
'[{"name": "Aceclofenac 100mg + Paracetamol 325mg", "dosage": "1 tablet", "frequency": "Twice daily", "duration": "10 days", "instructions": "After meals"}, {"name": "Glucosamine 750mg + Chondroitin 250mg", "dosage": "1 tablet", "frequency": "Twice daily", "duration": "3 months", "instructions": "After meals"}, {"name": "Calcium + Vitamin D3", "dosage": "1 tablet", "frequency": "Once daily", "duration": "Continue", "instructions": "After dinner"}]'::jsonb,
'Physiotherapy exercises essential. Hot fomentation. Avoid stairs, squatting. Weight reduction crucial.',
'Anti-inflammatory diet. Include turmeric, ginger. Calcium-rich foods. Maintain healthy weight.',
CURRENT_DATE + 14, true, true),

('150e8400-e29b-41d4-a716-446655440008', '250e8400-e29b-41d4-a716-446655440008', '450e8400-e29b-41d4-a716-446655440004', '350e8400-e29b-41d4-a716-446655440001',
'Hypothyroidism - Uncontrolled', ARRAY['Fatigue', 'Weight gain', 'Hair fall'],
'[{"name": "Levothyroxine 88mcg", "dosage": "1 tablet", "frequency": "Once daily", "duration": "Continue", "instructions": "Empty stomach, 30 mins before breakfast"}, {"name": "Calcium Carbonate 500mg", "dosage": "1 tablet", "frequency": "Once daily", "duration": "Continue", "instructions": "At bedtime - 4 hours gap from thyroid medicine"}]'::jsonb,
'Take thyroid medicine regularly on empty stomach. Recheck TSH after 6 weeks. Regular exercise helps.',
'Iodized salt. Avoid soy products, excessive cabbage. Balanced diet.',
CURRENT_DATE + 42, false, true);

-- ============================================
-- MEDICATION ADHERENCE - Mix of compliance
-- ============================================

INSERT INTO medication_adherence (adherence_id, prescription_id, pid, medicine_name, scheduled_date, scheduled_time, taken_at, is_taken, is_skipped, skip_reason, synced) VALUES
-- Good adherence - Paracetamol (Viral fever)
('050e8400-e29b-41d4-a716-446655440001', '150e8400-e29b-41d4-a716-446655440001', '450e8400-e29b-41d4-a716-446655440001', 'Paracetamol 650mg', '2024-12-05', '09:00:00', '2024-12-05 09:10:00', true, false, NULL, true),
('050e8400-e29b-41d4-a716-446655440002', '150e8400-e29b-41d4-a716-446655440001', '450e8400-e29b-41d4-a716-446655440001', 'Paracetamol 650mg', '2024-12-05', '14:00:00', '2024-12-05 14:15:00', true, false, NULL, true),
('050e8400-e29b-41d4-a716-446655440003', '150e8400-e29b-41d4-a716-446655440001', '450e8400-e29b-41d4-a716-446655440001', 'Paracetamol 650mg', '2024-12-05', '21:00:00', '2024-12-05 21:05:00', true, false, NULL, true),

-- Poor adherence - Diabetes medicines (missed doses)
('050e8400-e29b-41d4-a716-446655440004', '150e8400-e29b-41d4-a716-446655440003', '450e8400-e29b-41d4-a716-446655440005', 'Metformin 1000mg (SR)', '2024-12-08', '09:00:00', '2024-12-08 09:30:00', true, false, NULL, true),
('050e8400-e29b-41d4-a716-446655440005', '150e8400-e29b-41d4-a716-446655440003', '450e8400-e29b-41d4-a716-446655440005', 'Metformin 1000mg (SR)', '2024-12-08', '21:00:00', NULL, false, true, 'Forgot', true),
('050e8400-e29b-41d4-a716-446655440006', '150e8400-e29b-41d4-a716-446655440003', '450e8400-e29b-41d4-a716-446655440005', 'Glimepiride 2mg', '2024-12-09', '08:00:00', NULL, false, true, 'Ran out of medicine', true),
('050e8400-e29b-41d4-a716-446655440007', '150e8400-e29b-41d4-a716-446655440003', '450e8400-e29b-41d4-a716-446655440005', 'Metformin 1000mg (SR)', '2024-12-09', '09:00:00', '2024-12-09 09:00:00', true, false, NULL, true),

-- Excellent adherence - Heart medicines (critical)
('050e8400-e29b-41d4-a716-446655440008', '150e8400-e29b-41d4-a716-446655440005', '450e8400-e29b-41d4-a716-446655440007', 'Clopidogrel 75mg', '2024-12-10', '09:00:00', '2024-12-10 09:00:00', true, false, NULL, true),
('050e8400-e29b-41d4-a716-446655440009', '150e8400-e29b-41d4-a716-446655440005', '450e8400-e29b-41d4-a716-446655440007', 'Aspirin 75mg', '2024-12-10', '21:00:00', '2024-12-10 21:00:00', true, false, NULL, true),
('050e8400-e29b-41d4-a716-446655440010', '150e8400-e29b-41d4-a716-446655440005', '450e8400-e29b-41d4-a716-446655440007', 'Clopidogrel 75mg', '2024-12-11', '09:00:00', '2024-12-11 09:00:00', true, false, NULL, true);

-- ============================================
-- FINANCE TRANSACTIONS
-- ============================================

INSERT INTO finance_transactions (transaction_id, aid, pid, did, transaction_type, amount, status, razorpay_order_id, razorpay_payment_id, razorpay_signature, payment_method, initiated_at, paid_at) VALUES
-- Completed payments
('850e8400-e29b-41d4-a716-446655440001', '250e8400-e29b-41d4-a716-446655440001', '450e8400-e29b-41d4-a716-446655440001', '350e8400-e29b-41d4-a716-446655440001', 'consultation', 500.00, 'paid', 'order_NpX1K2vZfP4jBa', 'pay_NpX2M3wAgQ5kCb', 'abc123def456ghi789jkl012mno345pqr', 'upi', '2024-12-05 09:45:00', '2024-12-05 09:45:25'),
('850e8400-e29b-41d4-a716-446655440002', '250e8400-e29b-41d4-a716-446655440002', '450e8400-e29b-41d4-a716-446655440014', '350e8400-e29b-41d4-a716-446655440002', 'consultation', 800.00, 'paid', 'order_NpX3N4xBhR6lDc', 'pay_NpX4O5yChS7mEd', 'bcd234efg567hij890klm123nop456qrs', 'card', '2024-12-06 14:50:00', '2024-12-06 14:51:10'),
('850e8400-e29b-41d4-a716-446655440003', '250e8400-e29b-41d4-a716-446655440003', '450e8400-e29b-41d4-a716-446655440005', '350e8400-e29b-41d4-a716-446655440001', 'consultation', 500.00, 'paid', 'order_NpX5P6zDiT8nFe', 'pay_NpX6Q7ADjU9oGf', 'cde345fgh678ijk901lmn234opq567rst', 'netbanking', '2024-12-08 11:00:00', '2024-12-08 11:01:30'),
('850e8400-e29b-41d4-a716-446655440004', '250e8400-e29b-41d4-a716-446655440005', '450e8400-e29b-41d4-a716-446655440007', '350e8400-e29b-41d4-a716-446655440005', 'consultation', 1500.00, 'paid', 'order_NpX7R8BEkV0pH', 'pay_NpX8S9CFmW1qIi', 'def456ghi789jkl012mno345pqr678stu', 'upi', '2024-12-10 09:55:00', '2024-12-10 09:55:40'),

-- Pending payment
('850e8400-e29b-41d4-a716-446655440005', '250e8400-e29b-41d4-a716-446655440011', '450e8400-e29b-41d4-a716-446655440008', '350e8400-e29b-41d4-a716-446655440002', 'consultation', 800.00, 'pending', 'order_NpX9T0DGnX2rJj', NULL, NULL, NULL, CURRENT_TIMESTAMP - INTERVAL '1 hour', NULL),

-- Failed payment
('850e8400-e29b-41d4-a716-446655440006', '250e8400-e29b-41d4-a716-446655440018', '450e8400-e29b-41d4-a716-446655440004', '350e8400-e29b-41d4-a716-446655440004', 'consultation', 700.00, 'failed', 'order_NpY0U1EHoY3sKk', NULL, NULL, NULL, CURRENT_DATE + 5, NULL);

-- ============================================
-- RECEIPTS
-- ============================================

INSERT INTO receipts (receipt_id, transaction_id, receipt_number, receipt_date, pid, did, patient_name, doctor_name, consultation_fee, tax_amount, discount_amount, total_amount, payment_method, razorpay_payment_id) VALUES
('950e8400-e29b-41d4-a716-446655440001', '850e8400-e29b-41d4-a716-446655440001', 'RCP-20241205-0001', '2024-12-05', '450e8400-e29b-41d4-a716-446655440001', '350e8400-e29b-41d4-a716-446655440001', 'Rajesh Kumar', 'Dr. Ashok Kumar', 500.00, 0.00, 0.00, 500.00, 'upi', 'pay_NpX2M3wAgQ5kCb'),
('950e8400-e29b-41d4-a716-446655440002', '850e8400-e29b-41d4-a716-446655440002', 'RCP-20241206-0001', '2024-12-06', '450e8400-e29b-41d4-a716-446655440014', '350e8400-e29b-41d4-a716-446655440002', 'Ritu Malhotra', 'Dr. Sunita Rao', 800.00, 0.00, 0.00, 800.00, 'card', 'pay_NpX4O5yChS7mEd'),
('950e8400-e29b-41d4-a716-446655440003', '850e8400-e29b-41d4-a716-446655440003', 'RCP-20241208-0001', '2024-12-08', '450e8400-e29b-41d4-a716-446655440005', '350e8400-e29b-41d4-a716-446655440001', 'Amit Desai', 'Dr. Ashok Kumar', 500.00, 0.00, 0.00, 500.00, 'netbanking', 'pay_NpX6Q7ADjU9oGf'),
('950e8400-e29b-41d4-a716-446655440004', '850e8400-e29b-41d4-a716-446655440004', 'RCP-20241210-0001', '2024-12-10', '450e8400-e29b-41d4-a716-446655440007', '350e8400-e29b-41d4-a716-446655440005', 'Rahul Mehta', 'Dr. Sanjay Nair', 1500.00, 0.00, 0.00, 1500.00, 'upi', 'pay_NpX8S9CFmW1qIi');

-- ============================================
-- SYNC QUEUE
-- ============================================

INSERT INTO sync_queue (sync_id, user_id, entity_type, entity_id, operation, data, status, device_timestamp) VALUES
('a50e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440005', 'adherence', '050e8400-e29b-41d4-a716-446655440005', 'update',
'{"is_taken": false, "is_skipped": true, "skip_reason": "Forgot to take medicine"}'::jsonb,
'pending', '2024-12-08 21:30:00'),

('a50e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440007', 'adherence', '050e8400-e29b-41d4-a716-446655440008', 'create',
'{"medicine_name": "Clopidogrel 75mg", "scheduled_date": "2024-12-10", "is_taken": true}'::jsonb,
'synced', '2024-12-10 09:00:00');

-- ============================================
-- VERIFICATION SUMMARY
-- ============================================

SELECT 
    '✅ Demo Data Loaded Successfully!' as status,
    '👥 Users: ' || (SELECT COUNT(*) FROM users) as users,
    '🏥 Doctors: ' || (SELECT COUNT(*) FROM doctors) as doctors,
    '🙋 Patients: ' || (SELECT COUNT(*) FROM patients) as patients,
    '📅 Appointments: ' || (SELECT COUNT(*) FROM appointments) as appointments,
    '💊 Prescriptions: ' || (SELECT COUNT(*) FROM prescriptions) as prescriptions,
    '✓ Adherence Records: ' || (SELECT COUNT(*) FROM medication_adherence) as adherence,
    '💳 Transactions: ' || (SELECT COUNT(*) FROM finance_transactions) as transactions,
    '🧾 Receipts: ' || (SELECT COUNT(*) FROM receipts) as receipts;