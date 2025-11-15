-- =====================================================
-- HealthPWA: Clean Schema + Seeds + RLS + Triggers
-- Flow: DROP -> CREATE -> SEED (20+ rows each) -> RLS & TRIGGERS
-- Notes:
--  - caregivers are only nurses (type = 'nurse') who can act as doctors too
--  - patients have assigned_nurse_id (1 nurse -> many patients)
--  - removed center_id and license_number as requested
--  - seeds use gen_random_uuid() for stable sample rows
-- =====================================================

-- -------------------------
-- 0. Safe drop (in correct order)
-- -------------------------
DROP TABLE IF EXISTS public.receipts CASCADE;
DROP TABLE IF EXISTS public.finance_log CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.ai_queries_log CASCADE;
DROP TABLE IF EXISTS public.progress_tracking CASCADE;
DROP TABLE IF EXISTS public.prescriptions CASCADE;
DROP TABLE IF EXISTS public.appointments CASCADE;
DROP TABLE IF EXISTS public.patients CASCADE;
DROP TABLE IF EXISTS public.caregivers CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- -------------------------
-- 1. Extensions
-- -------------------------
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- -------------------------
-- 2. USERS
-- -------------------------
CREATE TABLE public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id uuid UNIQUE, -- set to auth.uid() when user signs up (nullable in seeds)
  clerk_id text UNIQUE, -- optional Clerk id
  email text UNIQUE,
  phone text,
  first_name text,
  last_name text,
  image_url text,
  role text CHECK (role IN ('patient','caregiver','admin')) DEFAULT 'patient',
  password_hash text NULL, -- for internal admin/testing only (do not use in production)
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- -------------------------
-- 3. CAREGIVERS (NURSES only)
-- -------------------------
CREATE TABLE public.caregivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  first_name text,
  last_name text,
  image_url text,
  type text CHECK (type = 'nurse') DEFAULT 'nurse',
  specializations text[] DEFAULT '{}'::text[],
  qualifications text[] DEFAULT '{}'::text[],
  experience_years integer DEFAULT 0,
  languages text[] DEFAULT ARRAY['en'::text],
  bio text,
  consultation_fee numeric(10,2) DEFAULT 0,
  home_visit_fee numeric(10,2) DEFAULT 0,
  available_for_home_visits boolean DEFAULT true,
  available_for_online boolean DEFAULT true,
  latitude double precision,
  longitude double precision,
  service_radius_km integer DEFAULT 10,
  is_verified boolean DEFAULT true,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_caregivers_loc ON public.caregivers USING btree(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_caregivers_special ON public.caregivers USING gin(specializations);

-- -------------------------
-- 4. PATIENTS
-- -------------------------
CREATE TABLE public.patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  assigned_nurse_id uuid REFERENCES public.caregivers(id) ON DELETE SET NULL,
  date_of_birth date,
  gender text CHECK (gender IN ('male','female','other')),
  blood_group text,
  emergency_contact_name text,
  emergency_contact_phone text,
  medical_history_encrypted bytea,
  allergies text[] DEFAULT '{}'::text[],
  current_medications text[] DEFAULT '{}'::text[],
  prakriti_assessment jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_patients_user_id ON public.patients(user_id);
CREATE INDEX IF NOT EXISTS idx_patients_nurse ON public.patients(assigned_nurse_id);

-- -------------------------
-- 5. APPOINTMENTS
-- -------------------------
CREATE TABLE public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES public.patients(id) ON DELETE CASCADE,
  caregiver_id uuid REFERENCES public.caregivers(id) ON DELETE CASCADE,
  mode text CHECK (mode IN ('online','home_visit','offline')) NOT NULL DEFAULT 'online',
  status text CHECK (status IN ('requested','confirmed','in_progress','completed','cancelled')) DEFAULT 'requested',
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  notes_encrypted bytea,
  symptoms text[] DEFAULT '{}'::text[],
  home_visit_address text,
  home_visit_latitude double precision,
  home_visit_longitude double precision,
  payment_required boolean DEFAULT true,
  payment_amount numeric(10,2),
  payment_status text CHECK (payment_status IN ('pending','paid','failed','refunded')) DEFAULT 'pending',
  razorpay_order_id text,
  razorpay_payment_id text,
  zego_room_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_appointments_patient ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_caregiver ON public.appointments(caregiver_id);
CREATE INDEX IF NOT EXISTS idx_appointments_start ON public.appointments(start_time);

-- -------------------------
-- 6. PRESCRIPTIONS
-- -------------------------
CREATE TABLE public.prescriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid REFERENCES public.appointments(id) ON DELETE CASCADE,
  caregiver_id uuid REFERENCES public.caregivers(id) ON DELETE CASCADE,
  patient_id uuid REFERENCES public.patients(id) ON DELETE CASCADE,
  items jsonb NOT NULL,
  instructions_encrypted bytea,
  is_approved boolean DEFAULT false,
  approved_by uuid REFERENCES public.caregivers(id),
  approved_at timestamptz,
  ai_generated boolean DEFAULT false,
  ai_confidence_score numeric(3,2),
  created_at timestamptz DEFAULT now()
);

-- -------------------------
-- 7. PROGRESS TRACKING
-- -------------------------
CREATE TABLE public.progress_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES public.patients(id) ON DELETE CASCADE,
  appointment_id uuid REFERENCES public.appointments(id),
  checklist_type text CHECK (checklist_type IN ('medication','diet','exercise','vitals')) NOT NULL,
  checklist_items jsonb NOT NULL,
  completed_items jsonb DEFAULT '[]'::jsonb,
  completion_percentage numeric(5,2) DEFAULT 0,
  date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_progress_patient ON public.progress_tracking(patient_id);

-- -------------------------
-- 8. FINANCE LOG
-- -------------------------
CREATE TABLE public.finance_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  appointment_id uuid REFERENCES public.appointments(id),
  transaction_type text CHECK (transaction_type IN ('payment','refund','fee')) NOT NULL,
  amount numeric(10,2) NOT NULL,
  currency text DEFAULT 'INR',
  razorpay_order_id text,
  razorpay_payment_id text,
  status text CHECK (status IN ('pending','completed','failed')) DEFAULT 'pending',
  description text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_finance_user ON public.finance_log(user_id);

-- -------------------------
-- 9. RECEIPTS
-- -------------------------
CREATE TABLE public.receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  finance_log_id uuid REFERENCES public.finance_log(id) ON DELETE CASCADE,
  receipt_number text UNIQUE NOT NULL,
  pdf_url text,
  pdf_data bytea,
  generated_at timestamptz DEFAULT now()
);

-- -------------------------
-- 10. NOTIFICATIONS
-- -------------------------
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  type text CHECK (type IN ('appointment_confirm','appointment_reminder','payment_receipt','diet_approved','prescription_approved')) NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  channels text[] DEFAULT ARRAY['in_app'::text],
  is_read boolean DEFAULT false,
  scheduled_for timestamptz,
  sent_at timestamptz,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);

-- -------------------------
-- 11. AI QUERIES LOG
-- -------------------------
CREATE TABLE public.ai_queries_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text,
  user_id uuid REFERENCES public.users(id),
  query_text text NOT NULL,
  user_lang text CHECK (user_lang IN ('en','hi')) DEFAULT 'en',
  extracted_symptoms text[] DEFAULT '{}'::text[],
  extracted_conditions text[] DEFAULT '{}'::text[],
  recommended_specializations text[] DEFAULT '{}'::text[],
  confidence_score numeric(3,2),
  results_returned integer,
  response_time_ms integer,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_user ON public.ai_queries_log(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_created ON public.ai_queries_log(created_at);

-- -------------------------
-- 12. Utility trigger: set_updated_at
-- -------------------------
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_caregivers_updated_at BEFORE UPDATE ON public.caregivers FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_patients_updated_at BEFORE UPDATE ON public.patients FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_progress_updated_at BEFORE UPDATE ON public.progress_tracking FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- -------------------------
-- 13. SEARCH: tsvector on caregivers
-- -------------------------
ALTER TABLE public.caregivers ADD COLUMN IF NOT EXISTS searchable tsvector;
CREATE OR REPLACE FUNCTION caregivers_search_vector() RETURNS trigger AS $$
BEGIN
  NEW.searchable :=
    to_tsvector('english', coalesce(array_to_string(NEW.specializations, ' '), ''))
    || to_tsvector('english', coalesce(NEW.bio, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_caregivers_search ON public.caregivers;
CREATE TRIGGER trg_caregivers_search BEFORE INSERT OR UPDATE ON public.caregivers FOR EACH ROW EXECUTE FUNCTION caregivers_search_vector();
CREATE INDEX IF NOT EXISTS idx_caregivers_search ON public.caregivers USING gin(searchable);

-- -------------------------
-- 14. SEED DATA (20+ rows per table)
-- -------------------------
-- NOTE: seed users (nurses + patients + admin)

-- 14.1 USERS (50 -> we will create 45: 20 nurses, 20 patients, 1 admin, 4 extras)
INSERT INTO public.users (auth_id, clerk_id, email, phone, first_name, last_name, role, password_hash)
VALUES
-- Nurses (20)
(gen_random_uuid(),'nurse_ck_01','nurse01@example.com','9001000001','Manju','Nair','caregiver', NULL),
(gen_random_uuid(),'nurse_ck_02','nurse02@example.com','9001000002','Priya','Kumar','caregiver', NULL),
(gen_random_uuid(),'nurse_ck_03','nurse03@example.com','9001000003','Reena','Sharma','caregiver', NULL),
(gen_random_uuid(),'nurse_ck_04','nurse04@example.com','9001000004','Tanuja','Verma','caregiver', NULL),
(gen_random_uuid(),'nurse_ck_05','nurse05@example.com','9001000005','Shalini','Patel','caregiver', NULL),
(gen_random_uuid(),'nurse_ck_06','nurse06@example.com','9001000006','Alka','Gupta','caregiver', NULL),
(gen_random_uuid(),'nurse_ck_07','nurse07@example.com','9001000007','Meera','Singh','caregiver', NULL),
(gen_random_uuid(),'nurse_ck_08','nurse08@example.com','9001000008','Suman','Rao','caregiver', NULL),
(gen_random_uuid(),'nurse_ck_09','nurse09@example.com','9001000009','Kavita','Tiwari','caregiver', NULL),
(gen_random_uuid(),'nurse_ck_10','nurse10@example.com','9001000010','Naveen','Kumar','caregiver', NULL),
(gen_random_uuid(),'nurse_ck_11','nurse11@example.com','9001000011','Ruchi','Verma','caregiver', NULL),
(gen_random_uuid(),'nurse_ck_12','nurse12@example.com','9001000012','Sushma','Singh','caregiver', NULL),
(gen_random_uuid(),'nurse_ck_13','nurse13@example.com','9001000013','Anjali','Sahu','caregiver', NULL),
(gen_random_uuid(),'nurse_ck_14','nurse14@example.com','9001000014','Sameer','Lal','caregiver', NULL),
(gen_random_uuid(),'nurse_ck_15','nurse15@example.com','9001000015','Rohit','Sharma','caregiver', NULL),
(gen_random_uuid(),'nurse_ck_16','nurse16@example.com','9001000016','Kartik','Joshi','caregiver', NULL),
(gen_random_uuid(),'nurse_ck_17','nurse17@example.com','9001000017','Deepa','Kohli','caregiver', NULL),
(gen_random_uuid(),'nurse_ck_18','nurse18@example.com','9001000018','Alisha','Bhatia','caregiver', NULL),
(gen_random_uuid(),'nurse_ck_19','nurse19@example.com','9001000019','Pooja','Agarwal','caregiver', NULL),
(gen_random_uuid(),'nurse_ck_20','nurse20@example.com','9001000020','Manish','Kapur','caregiver', NULL),
-- Patients (20)
(gen_random_uuid(),'pat_ck_01','patient01@example.com','9002000001','Gaurav','Kumar','patient', NULL),
(gen_random_uuid(),'pat_ck_02','patient02@example.com','9002000002','Priya','Verma','patient', NULL),
(gen_random_uuid(),'pat_ck_03','patient03@example.com','9002000003','Amit','Singh','patient', NULL),
(gen_random_uuid(),'pat_ck_04','patient04@example.com','9002000004','Neha','Sharma','patient', NULL),
(gen_random_uuid(),'pat_ck_05','patient05@example.com','9002000005','Ritu','Das','patient', NULL),
(gen_random_uuid(),'pat_ck_06','patient06@example.com','9002000006','Rakesh','Yadav','patient', NULL),
(gen_random_uuid(),'pat_ck_07','patient07@example.com','9002000007','Sunita','Kashyap','patient', NULL),
(gen_random_uuid(),'pat_ck_08','patient08@example.com','9002000008','Vikram','Gupta','patient', NULL),
(gen_random_uuid(),'pat_ck_09','patient09@example.com','9002000009','Meena','Rao','patient', NULL),
(gen_random_uuid(),'pat_ck_10','patient10@example.com','9002000010','Sandeep','Patel','patient', NULL),
(gen_random_uuid(),'pat_ck_11','patient11@example.com','9002000011','Kiran','Singh','patient', NULL),
(gen_random_uuid(),'pat_ck_12','patient12@example.com','9002000012','Asha','Nair','patient', NULL),
(gen_random_uuid(),'pat_ck_13','patient13@example.com','9002000013','Ishan','Bose','patient', NULL),
(gen_random_uuid(),'pat_ck_14','patient14@example.com','9002000014','Divya','Shah','patient', NULL),
(gen_random_uuid(),'pat_ck_15','patient15@example.com','9002000015','Rajesh','Kumar','patient', NULL),
(gen_random_uuid(),'pat_ck_16','patient16@example.com','9002000016','Bhavna','Verma','patient', NULL),
(gen_random_uuid(),'pat_ck_17','patient17@example.com','9002000017','Anil','Mehra','patient', NULL),
(gen_random_uuid(),'pat_ck_18','patient18@example.com','9002000018','Sonal','Jain','patient', NULL),
(gen_random_uuid(),'pat_ck_19','patient19@example.com','9002000019','Tarun','Kohli','patient', NULL),
(gen_random_uuid(),'pat_ck_20','patient20@example.com','9002000020','Kavya','Desai','patient', NULL),
-- Admin
(gen_random_uuid(),'admin_ck','admin@system.com','9000000000','System','Admin','admin', crypt('admin','md5'));

-- 14.2 CAREGIVERS (25) - Enhanced realistic profiles with better data
INSERT INTO public.caregivers (user_id, first_name, last_name, image_url, specializations, qualifications, experience_years, languages, bio, consultation_fee, home_visit_fee, available_for_home_visits, available_for_online, latitude, longitude, service_radius_km, is_verified, is_active)
VALUES
-- Pregnancy & Maternity Specialists
((SELECT id FROM public.users WHERE email='nurse01@example.com'), 'Dr. Priya', 'Sharma', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400', ARRAY['Pregnancy Care','ANC Care','Postnatal Care'], ARRAY['MBBS','MD Obstetrics'], 12, ARRAY['hi','en'], 'Experienced obstetrician specializing in high-risk pregnancies and prenatal care. Available for home consultations and emergency deliveries.', 1200, 800, true, true, 28.6139,77.2090,15,true,true),
((SELECT id FROM public.users WHERE email='nurse02@example.com'), 'Dr. Anjali', 'Verma', 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400', ARRAY['Pregnancy Care','Postnatal Care','Lactation Support'], ARRAY['MBBS','DGO'], 8, ARRAY['hi','en'], 'Specialist in maternal health with expertise in breastfeeding support and postpartum care. Certified lactation consultant.', 1000, 700, true, true, 28.5355,77.3910,12,true,true),
((SELECT id FROM public.users WHERE email='nurse03@example.com'), 'Nurse Sunita', 'Nair', 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400', ARRAY['ANC Care','Pregnancy Support','Home Delivery'], ARRAY['BSc Nursing','Midwifery'], 15, ARRAY['hi','en'], 'Certified midwife with 15+ years experience in home deliveries and antenatal care. Trusted by 500+ families.', 800, 600, true, true, 28.4595,77.0266,20,true,true),

-- Mental Health Specialists  
((SELECT id FROM public.users WHERE email='nurse04@example.com'), 'Dr. Meera', 'Singh', 'https://images.unsplash.com/photo-1594824804732-ca8db7d1457c?w=400', ARRAY['Mental Health Support','Anxiety Treatment','Depression Care'], ARRAY['MBBS','MD Psychiatry'], 10, ARRAY['hi','en'], 'Psychiatrist specializing in anxiety, depression, and stress management. Offers both online and in-person counseling sessions.', 1500, 1200, true, true, 28.6692,77.4538,18,true,true),
((SELECT id FROM public.users WHERE email='nurse05@example.com'), 'Dr. Kavita', 'Gupta', 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=400', ARRAY['Mental Health Support','Counseling','Therapy'], ARRAY['MA Psychology','PhD'], 7, ARRAY['hi','en'], 'Clinical psychologist with expertise in cognitive behavioral therapy and family counseling. Specializes in women\'s mental health.', 1200, 1000, true, true, 28.7041,77.1025,14,true,true),

-- Diabetes & Chronic Care
((SELECT id FROM public.users WHERE email='nurse06@example.com'), 'Dr. Rajesh', 'Kumar', 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400', ARRAY['Diabetes Care','Hypertension','Chronic Disease Management'], ARRAY['MBBS','MD Internal Medicine'], 14, ARRAY['hi','en'], 'Internal medicine specialist with focus on diabetes management and lifestyle diseases. Provides comprehensive care plans.', 1100, 800, true, true, 28.6304,77.2177,16,true,true),
((SELECT id FROM public.users WHERE email='nurse07@example.com'), 'Nurse Kiran', 'Patel', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400', ARRAY['Diabetes Care','Diet Counseling','Blood Sugar Monitoring'], ARRAY['BSc Nursing','Diabetes Educator'], 9, ARRAY['hi','en'], 'Certified diabetes educator providing home-based glucose monitoring, diet planning, and medication management.', 600, 400, true, true, 28.5706,77.3272,12,true,true),

-- Elder Care Specialists
((SELECT id FROM public.users WHERE email='nurse08@example.com'), 'Nurse Geeta', 'Rao', 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400', ARRAY['Elder Care','Geriatric Care','Physiotherapy Support'], ARRAY['BSc Nursing','Geriatric Care'], 11, ARRAY['hi','en'], 'Geriatric care specialist providing comprehensive elderly care including mobility assistance and medication management.', 700, 500, true, true, 28.6517,77.2219,13,true,true),
((SELECT id FROM public.users WHERE email='nurse09@example.com'), 'Dr. Sushma', 'Tiwari', 'https://images.unsplash.com/photo-1594824804732-ca8db7d1457c?w=400', ARRAY['Elder Care','Palliative Care','Pain Management'], ARRAY['MBBS','Geriatrics'], 16, ARRAY['hi','en'], 'Geriatrician with expertise in palliative care and pain management for elderly patients. Compassionate end-of-life care.', 1300, 900, true, true, 28.6448,77.2167,15,true,true),

-- Wound Care & Surgery Support
((SELECT id FROM public.users WHERE email='nurse10@example.com'), 'Nurse Reena', 'Sharma', 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=400', ARRAY['Wound Care','Post-Surgery Care','Dressing'], ARRAY['BSc Nursing','Wound Care Specialist'], 8, ARRAY['hi','en'], 'Wound care specialist providing post-surgical care, diabetic wound management, and advanced dressing techniques.', 650, 450, true, true, 28.6289,77.2065,11,true,true),
((SELECT id FROM public.users WHERE email='nurse11@example.com'), 'Dr. Alka', 'Joshi', 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400', ARRAY['Wound Care','Plastic Surgery','Burn Care'], ARRAY['MBBS','MS Surgery'], 13, ARRAY['hi','en'], 'Plastic surgeon specializing in wound healing, burn care, and reconstructive procedures. Expert in scar management.', 1800, 1400, true, true, 28.6562,77.2410,17,true,true),

-- Childcare & Pediatrics
((SELECT id FROM public.users WHERE email='nurse12@example.com'), 'Dr. Naveen', 'Kumar', 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400', ARRAY['Childcare','Pediatrics','Vaccination'], ARRAY['MBBS','MD Pediatrics'], 9, ARRAY['hi','en'], 'Pediatrician with expertise in child development, vaccination schedules, and common childhood illnesses. Child-friendly approach.', 1000, 700, true, true, 28.6139,77.2090,14,true,true),
((SELECT id FROM public.users WHERE email='nurse13@example.com'), 'Nurse Sarita', 'Verma', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400', ARRAY['Childcare','Newborn Care','Vaccination Support'], ARRAY['BSc Nursing','Pediatric Nursing'], 6, ARRAY['hi','en'], 'Pediatric nurse specializing in newborn care, vaccination support, and child health monitoring. Gentle with children.', 550, 400, true, true, 28.5355,77.3910,10,true,true),

-- ICU & Critical Care
((SELECT id FROM public.users WHERE email='nurse14@example.com'), 'Dr. Sameer', 'Lal', 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400', ARRAY['ICU Support','Critical Care','Emergency Medicine'], ARRAY['MBBS','MD Critical Care'], 12, ARRAY['hi','en'], 'Critical care specialist with ICU experience. Available for emergency consultations and critical patient monitoring.', 2000, 0, false, true, 28.6692,77.4538,25,true,true),
((SELECT id FROM public.users WHERE email='nurse15@example.com'), 'Nurse Lata', 'Singh', 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400', ARRAY['ICU Support','IV Therapy','Monitoring'], ARRAY['BSc Nursing','Critical Care'], 10, ARRAY['hi','en'], 'ICU trained nurse providing intensive monitoring, IV therapy, and critical care support at home when possible.', 800, 600, true, true, 28.7041,77.1025,12,true,true),

-- General & Family Medicine
((SELECT id FROM public.users WHERE email='nurse16@example.com'), 'Dr. Rohit', 'Sharma', 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400', ARRAY['General Care','Family Medicine','Preventive Care'], ARRAY['MBBS','MD Family Medicine'], 11, ARRAY['hi','en'], 'Family physician providing comprehensive healthcare for all ages. Focus on preventive care and health education.', 900, 600, true, true, 28.6304,77.2177,13,true,true),
((SELECT id FROM public.users WHERE email='nurse17@example.com'), 'Nurse Deepa', 'Kohli', 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=400', ARRAY['General Care','Health Monitoring','Medication Management'], ARRAY['BSc Nursing','General Nursing'], 7, ARRAY['hi','en'], 'General nurse providing routine health monitoring, medication administration, and basic healthcare services at home.', 500, 350, true, true, 28.5706,77.3272,9,true,true),

-- Physiotherapy & Rehabilitation
((SELECT id FROM public.users WHERE email='nurse18@example.com'), 'Dr. Kartik', 'Joshi', 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400', ARRAY['Physiotherapy','Rehabilitation','Sports Medicine'], ARRAY['BPT','MPT'], 8, ARRAY['hi','en'], 'Physiotherapist specializing in post-injury rehabilitation, sports medicine, and mobility restoration. Home exercise programs.', 800, 600, true, true, 28.6517,77.2219,12,true,true),
((SELECT id FROM public.users WHERE email='nurse19@example.com'), 'Nurse Pooja', 'Agarwal', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400', ARRAY['Physiotherapy Support','Exercise Therapy','Mobility Assistance'], ARRAY['BSc Nursing','Physio Assistant'], 5, ARRAY['hi','en'], 'Physiotherapy assistant helping with exercise routines, mobility training, and rehabilitation support at home.', 400, 300, true, true, 28.6448,77.2167,8,true,true),

-- Specialized Care
((SELECT id FROM public.users WHERE email='nurse20@example.com'), 'Dr. Manish', 'Kapur', 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400', ARRAY['Vaccination','Immunization','Travel Medicine'], ARRAY['MBBS','Travel Medicine'], 6, ARRAY['hi','en'], 'Vaccination specialist providing immunization services, travel medicine consultations, and preventive healthcare.', 700, 500, true, true, 28.6289,77.2065,11,true,true),

-- Add 5 more diverse specialists
((SELECT id FROM public.users WHERE email='admin@system.com'), 'Dr. Radha', 'Mishra', 'https://images.unsplash.com/photo-1594824804732-ca8db7d1457c?w=400', ARRAY['Ayurvedic Medicine','Herbal Treatment','Holistic Care'], ARRAY['BAMS','MD Ayurveda'], 20, ARRAY['hi','en'], 'Senior Ayurvedic physician with 20+ years experience in traditional medicine, herbal treatments, and holistic wellness approaches.', 1500, 1000, true, true, 28.6562,77.2410,20,true,true),
(gen_random_uuid(), 'Nurse Rekha', 'Das', 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400', ARRAY['Home Nursing','Patient Care','Medication Administration'], ARRAY['GNM','Home Care'], 12, ARRAY['hi','en'], 'Experienced home care nurse providing 24/7 patient care, medication management, and family support services.', 600, 450, true, false, 28.6139,77.2090,15,true,true),
(gen_random_uuid(), 'Dr. Nandita', 'Bose', 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=400', ARRAY['Dermatology','Skin Care','Cosmetic Treatment'], ARRAY['MBBS','MD Dermatology'], 9, ARRAY['hi','en'], 'Dermatologist specializing in skin disorders, acne treatment, and cosmetic procedures. Expert in anti-aging treatments.', 1400, 1100, true, true, 28.5355,77.3910,16,true,true),
(gen_random_uuid(), 'Dr. Vikram', 'Gupta', 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400', ARRAY['Cardiology','Heart Care','Hypertension'], ARRAY['MBBS','DM Cardiology'], 15, ARRAY['hi','en'], 'Cardiologist with expertise in heart disease management, hypertension control, and cardiac rehabilitation programs.', 2200, 1800, true, true, 28.4595,77.0266,22,true,true),
(gen_random_uuid(), 'Nurse Kavya', 'Desai', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400', ARRAY['Oncology Support','Cancer Care','Palliative Care'], ARRAY['BSc Nursing','Oncology Nursing'], 8, ARRAY['hi','en'], 'Oncology nurse providing compassionate cancer care, chemotherapy support, and palliative care services for patients and families.', 900, 700, true, true, 28.6692,77.4538,14,true,true);

-- 14.3 PATIENTS (20) - assign them to nurses in round-robin
INSERT INTO public.patients (user_id, assigned_nurse_id, date_of_birth, gender, blood_group, allergies, current_medications, prakriti_assessment)
SELECT u.id,
       (SELECT c.id FROM public.caregivers c JOIN public.users uu ON c.user_id=uu.id WHERE uu.email = (
         SELECT email FROM public.users WHERE role='caregiver' ORDER BY random() LIMIT 1
       ) LIMIT 1),
       (date '1985-01-01' + (random()*10000)::int)::date,
       (array['male','female','other']::text[])[floor(random()*3 + 1)],
       (array['A+','B+','O+','AB+','A-']::text[])[floor(random()*5 + 1)],
       ARRAY['dust'], ARRAY['none'], jsonb_build_object('vata',30,'pitta',40,'kapha',30)
FROM (SELECT id FROM public.users WHERE role='patient' LIMIT 20) u;

-- 14.4 APPOINTMENTS (20)
-- create 20 appointments distributed across patients and nurses
INSERT INTO public.appointments (patient_id, caregiver_id, mode, status, start_time, end_time, symptoms, payment_required, payment_amount, payment_status)
SELECT p.id,
       (SELECT id FROM public.caregivers ORDER BY random() LIMIT 1),
       (array['online','home_visit','offline']::text[])[floor(random()*3 + 1)],
       'requested',
       now() + (floor(random()*20) || ' days')::interval,
       now() + (floor(random()*20) || ' days')::interval + '30 minutes',
       ARRAY[ (array['fever','headache','anxiety','pregnancy-fatigue','skin_rash']) [floor(random()*5 + 1)] ],
       true,
       (select (100 + floor(random()*150))::numeric),
       'pending'
FROM (SELECT id FROM public.patients LIMIT 20) p;

-- 14.5 PRESCRIPTIONS (20)
INSERT INTO public.prescriptions (appointment_id, caregiver_id, patient_id, items, is_approved, ai_generated, ai_confidence_score)
SELECT a.id, a.caregiver_id, a.patient_id, jsonb_build_array(jsonb_build_object('name','Med-'||floor(random()*100)::text,'dose','1 tab')), false, false, null
FROM (SELECT id, caregiver_id, patient_id FROM public.appointments LIMIT 20) a;

-- 14.6 PROGRESS TRACKING (20)
INSERT INTO public.progress_tracking (patient_id, appointment_id, checklist_type, checklist_items, completed_items, completion_percentage)
SELECT p.id, a.id, 'medication', jsonb_build_array(jsonb_build_object('item','Medicine A','time','morning')), jsonb_build_array(), 0
FROM (SELECT id FROM public.patients LIMIT 20) p
LEFT JOIN (SELECT id FROM public.appointments LIMIT 20) a ON true
LIMIT 20;

-- 14.7 FINANCE LOG (20)
INSERT INTO public.finance_log (user_id, appointment_id, transaction_type, amount, currency, razorpay_order_id, razorpay_payment_id, status, description)
SELECT u.id, a.id, 'payment', (100 + floor(random()*900))::numeric, 'INR', 'rzp_order_'||floor(random()*10000)::text, 'rzp_pay_'||floor(random()*10000)::text, 'completed', 'Payment for appointment'
FROM (SELECT id FROM public.users WHERE role='patient' LIMIT 20) u
JOIN (SELECT id FROM public.appointments LIMIT 20) a ON true
LIMIT 20;

-- 14.8 RECEIPTS (20)
INSERT INTO public.receipts (finance_log_id, receipt_number, pdf_url)
SELECT fl.id, 'RCT-'||to_char(now(), 'YYMMDD')||'-'|| (row_number() OVER (ORDER BY fl.id))::text, 'https://example.com/receipt/'||(row_number() OVER (ORDER BY fl.id))::text || '.pdf'
FROM (SELECT id FROM public.finance_log LIMIT 20) fl;

-- 14.9 NOTIFICATIONS (20)
INSERT INTO public.notifications (user_id, type, title, message)
SELECT u.id, 'appointment_confirm', 'Appointment scheduled', 'Your appointment has been scheduled. Please complete payment.'
FROM (SELECT id FROM public.users WHERE role='patient' LIMIT 20) u;

-- 14.10 AI QUERIES LOG (20)
INSERT INTO public.ai_queries_log (session_id, user_id, query_text, extracted_symptoms, recommended_specializations, confidence_score, results_returned)
SELECT md5(random()::text), u.id, (array['i have headache','i am pregnant feel tired','skin rash on face','i feel anxious','back pain']) [floor(random()*5 + 1)], ARRAY[(array['headache','pregnancy','skin_rash','anxiety','back_pain'])[floor(random()*5 + 1)]], ARRAY[(array['Pregnancy Care','Neurology','Dermatology','Mental Health','Orthopedics'])[floor(random()*5 + 1)]], round((random()*0.9+0.1)::numeric,2), 5
FROM (SELECT id FROM public.users WHERE role='patient' LIMIT 20) u;

-- -------------------------
-- 15. RLS POLICIES (basic rules)
-- -------------------------
-- enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.caregivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_queries_log ENABLE ROW LEVEL SECURITY;

-- USERS: users can read/modify their own row; admin access handled separately
CREATE POLICY users_select_own ON public.users FOR SELECT USING (auth.uid() = auth_id);
CREATE POLICY users_update_own ON public.users FOR UPDATE USING (auth.uid() = auth_id);
CREATE POLICY users_insert_own ON public.users FOR INSERT WITH CHECK (auth.uid() = auth_id);

-- CAREGIVERS: public can SELECT (for directory); caregiver can modify own data
CREATE POLICY caregivers_public_read ON public.caregivers FOR SELECT USING (is_active = true);
CREATE POLICY caregivers_update_own ON public.caregivers FOR UPDATE USING ( EXISTS (SELECT 1 FROM public.users u WHERE u.id = public.caregivers.user_id AND u.auth_id = auth.uid()));

-- PATIENTS: patient can see own; assigned nurse can see their patients; admin (auth match) can see
CREATE POLICY patients_select ON public.patients FOR SELECT USING (
  user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
  OR assigned_nurse_id IN (SELECT id FROM public.caregivers WHERE user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()))
);
CREATE POLICY patients_update ON public.patients FOR UPDATE USING (
  user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
);
CREATE POLICY patients_insert ON public.patients FOR INSERT WITH CHECK (
  user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
);

-- APPOINTMENTS: patient, assigned nurse (caregiver), or admin can access
CREATE POLICY appointments_select ON public.appointments FOR SELECT USING (
  patient_id IN (SELECT p.id FROM public.patients p JOIN public.users u ON p.user_id = u.id WHERE u.auth_id = auth.uid())
  OR caregiver_id IN (SELECT c.id FROM public.caregivers c JOIN public.users u ON c.user_id = u.id WHERE u.auth_id = auth.uid())
);
CREATE POLICY appointments_insert ON public.appointments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY appointments_update ON public.appointments FOR UPDATE USING (
  patient_id IN (SELECT p.id FROM public.patients p JOIN public.users u ON p.user_id = u.id WHERE u.auth_id = auth.uid())
  OR caregiver_id IN (SELECT c.id FROM public.caregivers c JOIN public.users u ON c.user_id = u.id WHERE u.auth_id = auth.uid())
);

-- PRESCRIPTIONS: patient or caregiver can read
CREATE POLICY prescriptions_select ON public.prescriptions FOR SELECT USING (
  patient_id IN (SELECT p.id FROM public.patients p JOIN public.users u ON p.user_id = u.id WHERE u.auth_id = auth.uid())
  OR caregiver_id IN (SELECT c.id FROM public.caregivers c JOIN public.users u ON c.user_id = u.id WHERE u.auth_id = auth.uid())
);
CREATE POLICY prescriptions_insert ON public.prescriptions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY prescriptions_update ON public.prescriptions FOR UPDATE USING (
  caregiver_id IN (SELECT c.id FROM public.caregivers c JOIN public.users u ON c.user_id = u.id WHERE u.auth_id = auth.uid())
);

-- PROGRESS TRACKING: patient and assigned nurse
CREATE POLICY progress_select ON public.progress_tracking FOR SELECT USING (
  patient_id IN (SELECT p.id FROM public.patients p JOIN public.users u ON p.user_id = u.id WHERE u.auth_id = auth.uid())
  OR patient_id IN (SELECT p.id FROM public.patients p WHERE p.assigned_nurse_id IN (SELECT c.id FROM public.caregivers c JOIN public.users u ON c.user_id = u.id WHERE u.auth_id = auth.uid()))
);
CREATE POLICY progress_insert ON public.progress_tracking FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- FINANCE: user sees own transactions
CREATE POLICY finance_select ON public.finance_log FOR SELECT USING (
  user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
);
CREATE POLICY finance_insert ON public.finance_log FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- RECEIPTS: visible if owner of finance_log
CREATE POLICY receipts_select ON public.receipts FOR SELECT USING (
  finance_log_id IN (SELECT fl.id FROM public.finance_log fl JOIN public.users u ON fl.user_id = u.id WHERE u.auth_id = auth.uid())
);

-- NOTIFICATIONS: user sees own notifications
CREATE POLICY notifications_select ON public.notifications FOR SELECT USING (
  user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
);
CREATE POLICY notifications_insert ON public.notifications FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- AI QUERIES: allow public inserts, owners can read
CREATE POLICY ai_insert ON public.ai_queries_log FOR INSERT WITH CHECK (true);
CREATE POLICY ai_select ON public.ai_queries_log FOR SELECT USING (user_id IS NULL OR user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()));

-- -------------------------
-- 16. Helpful utility views & functions
-- -------------------------
-- Search function: find nurses by keyword + optional symptom mapping
CREATE OR REPLACE FUNCTION public.search_nurses(q text)
RETURNS TABLE(caregiver_id uuid, name text, specializations text[], experience integer, score real) AS $$
BEGIN
  RETURN QUERY
  SELECT c.id, u.first_name || ' ' || u.last_name AS name, c.specializations, c.experience_years,
         similarity(array_to_string(c.specializations, ' '), q) + (CASE WHEN c.bio ILIKE ('%'||q||'%') THEN 0.4 ELSE 0 END) AS score
  FROM public.caregivers c
  JOIN public.users u ON c.user_id = u.id
  WHERE c.is_active = true
  ORDER BY score DESC
  LIMIT 10;
END; $$ LANGUAGE plpgsql;

-- -------------------------
-- AI SEARCH FUNCTION FOR APPOINTMENT SERVICE
-- -------------------------
CREATE OR REPLACE FUNCTION public.search_caregivers_ai_enhanced(
    symptoms_input text[] DEFAULT '{}',
    query_text text DEFAULT '',
    user_latitude double precision DEFAULT NULL,
    user_longitude double precision DEFAULT NULL,
    max_results integer DEFAULT 10,
    user_id_input uuid DEFAULT NULL
)
RETURNS TABLE (
    caregiver_id uuid,
    nurse_name text,
    first_name text,
    last_name text,
    image_url text,
    specializations text[],
    experience_years integer,
    consultation_fee numeric,
    home_visit_fee numeric,
    available_for_home_visits boolean,
    available_for_online boolean,
    bio text,
    distance_km numeric,
    match_score numeric,
    recommended_reason text,
    phone text,
    email text
) 
LANGUAGE plpgsql
AS $$
DECLARE
    search_terms text[];
    symptom_text text;
BEGIN
    -- Log the AI query
    IF user_id_input IS NOT NULL THEN
        INSERT INTO public.ai_queries_log (
            session_id, user_id, query_text, extracted_symptoms, 
            recommended_specializations, confidence_score, results_returned
        ) VALUES (
            md5(random()::text), user_id_input, query_text, symptoms_input,
            ARRAY[]::text[], 0.8, max_results
        );
    END IF;

    -- Combine symptoms and query text for search
    symptom_text := array_to_string(symptoms_input, ' ') || ' ' || COALESCE(query_text, '');
    
    -- Extract search terms (simple keyword matching) - filter out empty terms
    search_terms := array_remove(string_to_array(lower(trim(symptom_text)), ' '), '');
    
    RETURN QUERY
    SELECT 
        c.id as caregiver_id,
        (COALESCE(u.first_name, '') || ' ' || COALESCE(u.last_name, ''))::text as nurse_name,
        u.first_name,
        u.last_name,
        u.image_url,
        c.specializations,
        c.experience_years,
        c.consultation_fee,
        c.home_visit_fee,
        c.available_for_home_visits,
        c.available_for_online,
        c.bio,
        -- Calculate distance if coordinates provided
        CASE 
            WHEN user_latitude IS NOT NULL AND user_longitude IS NOT NULL 
                 AND c.latitude IS NOT NULL AND c.longitude IS NOT NULL THEN
                ROUND(
                    (6371 * acos(
                        cos(radians(user_latitude)) * cos(radians(c.latitude)) * 
                        cos(radians(c.longitude) - radians(user_longitude)) + 
                        sin(radians(user_latitude)) * sin(radians(c.latitude))
                    ))::numeric, 2
                )
            ELSE NULL
        END as distance_km,
        -- Enhanced scoring based on specialization matches and keywords
        CASE 
            -- Direct specialization matches (highest priority) - matching your actual data
            WHEN ('pregnancy' = ANY(search_terms) OR 'pregnant' = ANY(search_terms)) AND 'women health' = ANY(c.specializations) THEN 0.95
            WHEN ('newborn' = ANY(search_terms) OR 'postnatal' = ANY(search_terms)) AND 'newborn care' = ANY(c.specializations) THEN 0.95
            WHEN 'wound' = ANY(search_terms) AND ('wound care' = ANY(c.specializations) OR 'wound dressing' = ANY(c.specializations)) THEN 0.95
            WHEN ('diabetes' = ANY(search_terms) OR 'diabetic' = ANY(search_terms)) AND ('diabetic care' = ANY(c.specializations) OR 'diabetic support' = ANY(c.specializations)) THEN 0.95
            WHEN ('child' = ANY(search_terms) OR 'pediatric' = ANY(search_terms)) AND ('pediatric care' = ANY(c.specializations) OR 'pediatric' = ANY(c.specializations)) THEN 0.95
            WHEN ('elder' = ANY(search_terms) OR 'elderly' = ANY(search_terms) OR 'senior' = ANY(search_terms)) AND ('elderly care' = ANY(c.specializations) OR 'senior care' = ANY(c.specializations)) THEN 0.95
            WHEN 'iv' = ANY(search_terms) AND 'IV therapy' = ANY(c.specializations) THEN 0.95
            WHEN ('surgery' = ANY(search_terms) OR 'post-surgery' = ANY(search_terms)) AND ('post-surgery' = ANY(c.specializations) OR 'post-surgery care' = ANY(c.specializations)) THEN 0.95
            WHEN 'palliative' = ANY(search_terms) AND 'palliative care' = ANY(c.specializations) THEN 0.95
            -- Fuzzy specialization matches
            WHEN array_length(search_terms, 1) > 0 AND EXISTS (
                SELECT 1 FROM unnest(c.specializations) spec 
                WHERE EXISTS (
                    SELECT 1 FROM unnest(search_terms) term 
                    WHERE length(term) > 2 AND lower(spec) LIKE '%' || term || '%'
                )
            ) THEN 0.85
            -- Bio matches
            WHEN array_length(search_terms, 1) > 0 AND c.bio IS NOT NULL AND EXISTS (
                SELECT 1 FROM unnest(search_terms) term 
                WHERE length(term) > 2 AND lower(c.bio) LIKE '%' || term || '%'
            ) THEN 0.75
            -- Default score for all active caregivers
            ELSE 0.6
        END as match_score,
        -- Generate smart recommendation reason
        CASE 
            WHEN 'pregnancy' = ANY(search_terms) OR 'pregnant' = ANY(search_terms) THEN 
                'Specializes in women''s health and maternal care - ' || c.experience_years || ' years experience'
            WHEN 'newborn' = ANY(search_terms) OR 'postnatal' = ANY(search_terms) THEN 
                'Expert in newborn and post-delivery care - ' || c.experience_years || ' years experience'
            WHEN 'wound' = ANY(search_terms) OR 'dressing' = ANY(search_terms) THEN 
                'Expert in wound care and dressing - Available for home visits'
            WHEN 'diabetes' = ANY(search_terms) OR 'diabetic' = ANY(search_terms) THEN 
                'Diabetic care specialist - Monitoring and education'
            WHEN 'child' = ANY(search_terms) OR 'pediatric' = ANY(search_terms) THEN 
                'Pediatric care expert - Child-friendly approach'
            WHEN 'elder' = ANY(search_terms) OR 'elderly' = ANY(search_terms) OR 'senior' = ANY(search_terms) THEN 
                'Elder care specialist - Compassionate senior care'
            WHEN 'iv' = ANY(search_terms) OR 'injection' = ANY(search_terms) THEN 
                'IV therapy and injection specialist'
            WHEN 'surgery' = ANY(search_terms) OR 'post-surgery' = ANY(search_terms) THEN 
                'Post-surgery care specialist - Recovery support'
            WHEN 'palliative' = ANY(search_terms) THEN 
                'Palliative care specialist - End-of-life support'
            ELSE 'Experienced healthcare provider - ' || array_to_string(c.specializations, ', ')
        END as recommended_reason,
        u.phone,
        u.email
    FROM public.caregivers c
    JOIN public.users u ON c.user_id = u.id
    WHERE c.is_active = true 
      AND c.is_verified = true
      AND u.role = 'caregiver'
    ORDER BY 
        -- Priority scoring: specialization match > experience > distance > fee
        CASE 
            -- Direct specialization matches first - matching your actual data
            WHEN ('pregnancy' = ANY(search_terms) OR 'pregnant' = ANY(search_terms)) AND 'women health' = ANY(c.specializations) THEN 1
            WHEN ('newborn' = ANY(search_terms) OR 'postnatal' = ANY(search_terms)) AND 'newborn care' = ANY(c.specializations) THEN 1
            WHEN 'wound' = ANY(search_terms) AND ('wound care' = ANY(c.specializations) OR 'wound dressing' = ANY(c.specializations)) THEN 1
            WHEN array_length(search_terms, 1) > 0 AND EXISTS (
                SELECT 1 FROM unnest(c.specializations) spec 
                WHERE EXISTS (
                    SELECT 1 FROM unnest(search_terms) term 
                    WHERE length(term) > 2 AND lower(spec) LIKE '%' || term || '%'
                )
            ) THEN 2
            ELSE 3
        END,
        c.experience_years DESC,
        CASE 
            WHEN user_latitude IS NOT NULL AND user_longitude IS NOT NULL 
                 AND c.latitude IS NOT NULL AND c.longitude IS NOT NULL THEN
                (6371 * acos(
                    cos(radians(user_latitude)) * cos(radians(c.latitude)) * 
                    cos(radians(c.longitude) - radians(user_longitude)) + 
                    sin(radians(user_latitude)) * sin(radians(c.latitude))
                ))
            ELSE 999999
        END ASC,
        c.consultation_fee ASC NULLS LAST
    LIMIT max_results;
END;
$$;

-- -------------------------
-- APPOINTMENT BOOKING HELPER FUNCTION
-- -------------------------
CREATE OR REPLACE FUNCTION public.create_appointment_request(
    patient_user_id uuid,
    caregiver_id_input uuid,
    appointment_mode text DEFAULT 'online',
    start_time_input timestamptz DEFAULT NULL,
    symptoms_input text[] DEFAULT '{}',
    home_address text DEFAULT NULL,
    home_lat double precision DEFAULT NULL,
    home_lng double precision DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
    patient_id_found uuid;
    appointment_id uuid;
    caregiver_fee numeric;
BEGIN
    -- Get patient ID from user ID
    SELECT id INTO patient_id_found 
    FROM public.patients 
    WHERE user_id = patient_user_id;
    
    IF patient_id_found IS NULL THEN
        RAISE EXCEPTION 'Patient not found for user ID: %', patient_user_id;
    END IF;
    
    -- Get caregiver fee based on mode
    SELECT 
        CASE 
            WHEN appointment_mode = 'home_visit' THEN home_visit_fee
            ELSE consultation_fee
        END INTO caregiver_fee
    FROM public.caregivers 
    WHERE id = caregiver_id_input;
    
    -- Create appointment
    INSERT INTO public.appointments (
        patient_id, caregiver_id, mode, status, start_time, end_time,
        symptoms, home_visit_address, home_visit_latitude, home_visit_longitude,
        payment_required, payment_amount, payment_status
    ) VALUES (
        patient_id_found, caregiver_id_input, appointment_mode, 'requested',
        COALESCE(start_time_input, now() + interval '1 day'),
        COALESCE(start_time_input, now() + interval '1 day') + interval '30 minutes',
        symptoms_input, home_address, home_lat, home_lng,
        true, COALESCE(caregiver_fee, 500), 'pending'
    ) RETURNING id INTO appointment_id;
    
    RETURN appointment_id;
END;
$$;

-- -------------------------
-- Done.
-- Paste this entire SQL into Supabase SQL Editor and run once.
-- After running: set real auth_id values by mapping Supabase auth users to public.users.auth_id.
-- =====================================================