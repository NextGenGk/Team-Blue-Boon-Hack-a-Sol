-- =====================================================
-- HEALTHCARE PWA - COMPLETE DATABASE SCHEMA
-- Fresh schema with all tables, policies, functions, and seed data
-- Copy and paste this entire file into Supabase SQL Editor
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

-- Drop all existing tables for clean setup
DROP TABLE IF EXISTS public.progress_tracking CASCADE;
DROP TABLE IF EXISTS public.receipts CASCADE;
DROP TABLE IF EXISTS public.finance_log CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.ai_queries_log CASCADE;
DROP TABLE IF EXISTS public.diet_plans CASCADE;
DROP TABLE IF EXISTS public.prescriptions CASCADE;
DROP TABLE IF EXISTS public.appointments CASCADE;
DROP TABLE IF EXISTS public.caregivers CASCADE;
DROP TABLE IF EXISTS public.patients CASCADE;
DROP TABLE IF EXISTS public.centers CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Drop functions if they exist
DROP FUNCTION IF EXISTS public.search_caregivers_by_symptoms CASCADE;
DROP FUNCTION IF EXISTS public.set_updated_at CASCADE;

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Users table (auth integration)
CREATE TABLE public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id uuid UNIQUE,
  email text UNIQUE NOT NULL,
  phone text,
  first_name text NOT NULL,
  last_name text NOT NULL,
  avatar_url text,
  role text CHECK (role IN ('patient','caregiver','admin')) DEFAULT 'patient',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Centers (hospitals/clinics)
CREATE TABLE public.centers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  latitude double precision,
  longitude double precision,
  contact_phone text,
  created_at timestamptz DEFAULT now()
);

-- Patients
CREATE TABLE public.patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  date_of_birth date,
  gender text CHECK (gender IN ('male','female','other')),
  blood_group text,
  emergency_contact_name text,
  emergency_contact_phone text,
  medical_history_encrypted bytea,
  allergies text[],
  current_medications text[],
  prakriti_assessment jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Caregivers (doctors, nurses, therapists, maids)
CREATE TABLE public.caregivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  type text CHECK (type IN ('doctor','nurse','maid','therapist')) NOT NULL,
  specializations text[] DEFAULT '{}',
  qualifications text[] DEFAULT '{}',
  experience_years integer DEFAULT 0,
  languages text[] DEFAULT ARRAY['en'],
  bio_en text,
  bio_hi text,
  profile_image_url text,
  license_number text,
  rating numeric(3,2) DEFAULT 0,
  total_reviews integer DEFAULT 0,
  consultation_fee numeric(10,2),
  home_visit_fee numeric(10,2),
  available_for_home_visits boolean DEFAULT false,
  available_for_online boolean DEFAULT true,
  latitude double precision,
  longitude double precision,
  service_radius_km integer DEFAULT 10,
  center_id uuid REFERENCES public.centers(id),
  is_verified boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Appointments
CREATE TABLE public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES public.patients(id) ON DELETE CASCADE,
  caregiver_id uuid REFERENCES public.caregivers(id) ON DELETE CASCADE,
  center_id uuid REFERENCES public.centers(id),
  mode text CHECK (mode IN ('online','offline','home_visit')) NOT NULL,
  status text CHECK (status IN ('requested','confirmed','in_progress','completed','cancelled')) DEFAULT 'requested',
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  notes_encrypted bytea,
  symptoms text[],
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

-- Prescriptions
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

-- Diet Plans
CREATE TABLE public.diet_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES public.patients(id) ON DELETE CASCADE,
  caregiver_id uuid REFERENCES public.caregivers(id) ON DELETE CASCADE,
  prakriti_type text,
  plan_details jsonb NOT NULL,
  dietary_restrictions text[],
  recommended_foods text[],
  foods_to_avoid text[],
  meal_timings jsonb,
  herbal_suggestions text[],
  is_approved boolean DEFAULT false,
  approved_by uuid REFERENCES public.caregivers(id),
  approved_at timestamptz,
  ai_generated boolean DEFAULT false,
  ai_confidence_score numeric(3,2),
  valid_from date,
  valid_until date,
  created_at timestamptz DEFAULT now()
);

-- AI Queries Log (for search analytics)
CREATE TABLE public.ai_queries_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text,
  user_id uuid REFERENCES public.users(id),
  query_text text NOT NULL,
  user_lang text DEFAULT 'en' CHECK (user_lang IN ('en', 'hi')),
  extracted_symptoms text[],
  extracted_conditions text[],
  recommended_specializations text[],
  confidence_score numeric(3,2),
  results_returned integer,
  response_time_ms integer,
  created_at timestamptz DEFAULT now()
);

-- Notifications
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('appointment_confirm', 'appointment_reminder', 'payment_receipt', 'diet_approved', 'prescription_approved')),
  title text NOT NULL,
  message text NOT NULL,
  channels text[] DEFAULT ARRAY['in_app'],
  is_read boolean DEFAULT false,
  scheduled_for timestamptz,
  sent_at timestamptz,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Finance Log
CREATE TABLE public.finance_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  appointment_id uuid REFERENCES public.appointments(id),
  transaction_type text NOT NULL CHECK (transaction_type IN ('payment', 'refund', 'fee')),
  amount numeric(10,2) NOT NULL,
  currency text DEFAULT 'INR',
  razorpay_order_id text,
  razorpay_payment_id text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  description text,
  created_at timestamptz DEFAULT now()
);

-- Receipts
CREATE TABLE public.receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  finance_log_id uuid REFERENCES public.finance_log(id) ON DELETE CASCADE,
  receipt_number text UNIQUE NOT NULL,
  pdf_url text,
  pdf_data bytea,
  generated_at timestamptz DEFAULT now()
);

-- Progress Tracking
CREATE TABLE public.progress_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES public.patients(id) ON DELETE CASCADE,
  appointment_id uuid REFERENCES public.appointments(id),
  diet_plan_id uuid REFERENCES public.diet_plans(id),
  checklist_type text NOT NULL CHECK (checklist_type IN ('medication', 'diet', 'exercise', 'vitals')),
  checklist_items jsonb NOT NULL,
  completed_items jsonb DEFAULT '[]'::jsonb,
  completion_percentage numeric(5,2) DEFAULT 0,
  date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_caregivers_location ON public.caregivers (latitude, longitude);
CREATE INDEX idx_caregivers_specializations ON public.caregivers USING gin (specializations);
CREATE INDEX idx_caregivers_type ON public.caregivers (type);
CREATE INDEX idx_caregivers_active_verified ON public.caregivers (is_active, is_verified);
CREATE INDEX idx_appointments_patient_id ON public.appointments (patient_id);
CREATE INDEX idx_appointments_caregiver_id ON public.appointments (caregiver_id);
CREATE INDEX idx_appointments_start_time ON public.appointments (start_time);
CREATE INDEX idx_ai_queries_user_id ON public.ai_queries_log (user_id);
CREATE INDEX idx_ai_queries_created_at ON public.ai_queries_log (created_at);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_finance_log_user_id ON public.finance_log(user_id);
CREATE INDEX idx_progress_tracking_patient_id ON public.progress_tracking(patient_id);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Updated timestamp trigger function
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_patients_updated_at BEFORE UPDATE ON public.patients FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_caregivers_updated_at BEFORE UPDATE ON public.caregivers FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_progress_updated_at BEFORE UPDATE ON public.progress_tracking FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- AI-powered caregiver search function
CREATE OR REPLACE FUNCTION search_caregivers_by_symptoms(
  search_symptoms text[],
  user_latitude double precision DEFAULT NULL,
  user_longitude double precision DEFAULT NULL,
  max_distance_km integer DEFAULT 50,
  caregiver_type text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  type text,
  specializations text[],
  qualifications text[],
  experience_years integer,
  languages text[],
  bio_en text,
  bio_hi text,
  profile_image_url text,
  rating numeric,
  total_reviews integer,
  consultation_fee numeric,
  home_visit_fee numeric,
  available_for_home_visits boolean,
  available_for_online boolean,
  latitude double precision,
  longitude double precision,
  service_radius_km integer,
  center_id uuid,
  distance_km double precision,
  match_score integer,
  matched_specializations text[]
) AS $$
BEGIN
  RETURN QUERY
  WITH symptom_matches AS (
    SELECT 
      c.*,
      -- Calculate distance if coordinates provided
      CASE 
        WHEN user_latitude IS NOT NULL AND user_longitude IS NOT NULL 
        THEN ST_Distance(
          ST_Point(c.longitude, c.latitude)::geography,
          ST_Point(user_longitude, user_latitude)::geography
        ) / 1000.0
        ELSE 0
      END as calc_distance,
      
      -- Calculate match score based on specialization overlap
      (
        SELECT COUNT(*)::integer
        FROM unnest(c.specializations) spec
        WHERE EXISTS (
          SELECT 1 FROM unnest(search_symptoms) symptom
          WHERE LOWER(spec) LIKE '%' || LOWER(symptom) || '%'
             OR LOWER(symptom) LIKE '%' || LOWER(spec) || '%'
        )
      ) as calc_match_score,
      
      -- Get matched specializations
      ARRAY(
        SELECT spec
        FROM unnest(c.specializations) spec
        WHERE EXISTS (
          SELECT 1 FROM unnest(search_symptoms) symptom
          WHERE LOWER(spec) LIKE '%' || LOWER(symptom) || '%'
             OR LOWER(symptom) LIKE '%' || LOWER(spec) || '%'
        )
      ) as calc_matched_specs
      
    FROM public.caregivers c
    WHERE c.is_active = true 
      AND c.is_verified = true
      AND (caregiver_type IS NULL OR c.type = caregiver_type)
  )
  SELECT 
    sm.id,
    sm.user_id,
    sm.type,
    sm.specializations,
    sm.qualifications,
    sm.experience_years,
    sm.languages,
    sm.bio_en,
    sm.bio_hi,
    sm.profile_image_url,
    sm.rating,
    sm.total_reviews,
    sm.consultation_fee,
    sm.home_visit_fee,
    sm.available_for_home_visits,
    sm.available_for_online,
    sm.latitude,
    sm.longitude,
    sm.service_radius_km,
    sm.center_id,
    sm.calc_distance,
    sm.calc_match_score,
    sm.calc_matched_specs
  FROM symptom_matches sm
  WHERE (
    -- Include if has matching specializations
    sm.calc_match_score > 0
    -- Or if within distance and no specific symptoms matched (general search)
    OR (user_latitude IS NOT NULL AND sm.calc_distance <= max_distance_km AND array_length(search_symptoms, 1) IS NULL)
  )
  AND (user_latitude IS NULL OR sm.calc_distance <= max_distance_km)
  ORDER BY 
    sm.calc_match_score DESC,
    sm.rating DESC,
    sm.calc_distance ASC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION search_caregivers_by_symptoms TO anon, authenticated;

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Centers: public read
ALTER TABLE public.centers ENABLE ROW LEVEL SECURITY;
CREATE POLICY centers_public_read ON public.centers FOR SELECT USING (true);

-- Users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY users_select_own ON public.users FOR SELECT USING (auth.uid() IS NOT NULL AND auth.uid() = auth_id);
CREATE POLICY users_update_own ON public.users FOR UPDATE USING (auth.uid() IS NOT NULL AND auth.uid() = auth_id);
CREATE POLICY users_insert_own ON public.users FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = auth_id);

-- Patients
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
CREATE POLICY patients_select_own ON public.patients FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users u WHERE u.id = patients.user_id AND u.auth_id = auth.uid())
);
CREATE POLICY patients_insert_own ON public.patients FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.users u WHERE u.id = patients.user_id AND u.auth_id = auth.uid())
);
CREATE POLICY patients_update_own ON public.patients FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users u WHERE u.id = patients.user_id AND u.auth_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.users u WHERE u.id = patients.user_id AND u.auth_id = auth.uid())
);

-- Caregivers
ALTER TABLE public.caregivers ENABLE ROW LEVEL SECURITY;
CREATE POLICY caregivers_public_search ON public.caregivers FOR SELECT USING (is_active = true AND is_verified = true);
CREATE POLICY caregivers_select_own ON public.caregivers FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users u WHERE u.id = caregivers.user_id AND u.auth_id = auth.uid())
);
CREATE POLICY caregivers_insert_own ON public.caregivers FOR INSERT WITH CHECK (
  user_id IS NULL OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = caregivers.user_id AND u.auth_id = auth.uid())
);
CREATE POLICY caregivers_update_own ON public.caregivers FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users u WHERE u.id = caregivers.user_id AND u.auth_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.users u WHERE u.id = caregivers.user_id AND u.auth_id = auth.uid())
);

-- Appointments
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY appointments_access ON public.appointments FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.patients p JOIN public.users u ON p.user_id = u.id
    WHERE p.id = appointments.patient_id AND u.auth_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.caregivers c JOIN public.users u ON c.user_id = u.id
    WHERE c.id = appointments.caregiver_id AND u.auth_id = auth.uid()
  )
);

-- Prescriptions
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY prescriptions_access ON public.prescriptions FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.patients p JOIN public.users u ON p.user_id = u.id
    WHERE p.id = prescriptions.patient_id AND u.auth_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.caregivers c JOIN public.users u ON c.user_id = u.id
    WHERE c.id = prescriptions.caregiver_id AND u.auth_id = auth.uid()
  )
);

-- Diet Plans
ALTER TABLE public.diet_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY dietplans_access ON public.diet_plans FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.patients p JOIN public.users u ON p.user_id = u.id
    WHERE p.id = diet_plans.patient_id AND u.auth_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.caregivers c JOIN public.users u ON c.user_id = u.id
    WHERE c.id = diet_plans.caregiver_id AND u.auth_id = auth.uid()
  )
);

-- AI Queries Log
ALTER TABLE public.ai_queries_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY ai_queries_insert ON public.ai_queries_log FOR INSERT WITH CHECK (true);
CREATE POLICY ai_queries_select_owner ON public.ai_queries_log FOR SELECT USING (
  user_id IS NULL OR EXISTS (SELECT 1 FROM public.users u WHERE u.id = ai_queries_log.user_id AND u.auth_id = auth.uid())
);

-- Notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY notifications_access ON public.notifications FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users u WHERE u.id = notifications.user_id AND u.auth_id = auth.uid())
);

-- Finance Log
ALTER TABLE public.finance_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY finance_access ON public.finance_log FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users u WHERE u.id = finance_log.user_id AND u.auth_id = auth.uid())
);

-- Receipts
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
CREATE POLICY receipts_select ON public.receipts FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.finance_log fl JOIN public.users u ON fl.user_id = u.id
    WHERE fl.id = receipts.finance_log_id AND u.auth_id = auth.uid()
  )
);

-- Progress Tracking
ALTER TABLE public.progress_tracking ENABLE ROW LEVEL SECURITY;
CREATE POLICY progress_access ON public.progress_tracking FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.patients p JOIN public.users u ON p.user_id = u.id
    WHERE p.id = progress_tracking.patient_id AND u.auth_id = auth.uid()
  )
);

-- =====================================================
-- COMPREHENSIVE SEED DATA
-- =====================================================

-- Insert Centers (Medical Facilities)
INSERT INTO public.centers (name, address, latitude, longitude, contact_phone) VALUES
('AIIMS Delhi', 'Ansari Nagar, New Delhi', 28.5672, 77.2100, '+91-11-26588500'),
('Apollo Hospital Mumbai', 'Tardeo, Mumbai', 19.0176, 72.8562, '+91-22-26925858'),
('Fortis Hospital Bangalore', 'Bannerghatta Road, Bangalore', 12.9352, 77.6245, '+91-80-66214444'),
('Max Hospital Gurgaon', 'Sector 19, Gurgaon', 28.4595, 77.0266, '+91-124-4511111'),
('Manipal Hospital Pune', 'Kharadi, Pune', 18.5511, 73.9470, '+91-20-68882222'),
('Medanta Gurgaon', 'Sector 38, Gurgaon', 28.4289, 77.0428, '+91-124-4141414'),
('Narayana Health Bangalore', 'Bommasandra, Bangalore', 12.8056, 77.6803, '+91-80-71222222'),
('Ruby Hall Clinic Pune', 'Sassoon Road, Pune', 18.5314, 73.8446, '+91-20-26127100');

-- Insert Users (Healthcare Providers and Patients)
INSERT INTO public.users (auth_id, email, first_name, last_name, role) VALUES
-- Doctors
(gen_random_uuid(), 'dr.rajesh.cardio@hospital.com', 'Dr. Rajesh', 'Sharma', 'caregiver'),
(gen_random_uuid(), 'dr.priya.neuro@hospital.com', 'Dr. Priya', 'Patel', 'caregiver'),
(gen_random_uuid(), 'dr.amit.ortho@hospital.com', 'Dr. Amit', 'Singh', 'caregiver'),
(gen_random_uuid(), 'dr.sunita.pediatric@hospital.com', 'Dr. Sunita', 'Kumar', 'caregiver'),
(gen_random_uuid(), 'dr.vikram.gastro@hospital.com', 'Dr. Vikram', 'Gupta', 'caregiver'),
(gen_random_uuid(), 'dr.meera.derma@hospital.com', 'Dr. Meera', 'Joshi', 'caregiver'),
(gen_random_uuid(), 'dr.rohit.ent@hospital.com', 'Dr. Rohit', 'Verma', 'caregiver'),
(gen_random_uuid(), 'dr.kavita.gynec@hospital.com', 'Dr. Kavita', 'Tiwari', 'caregiver'),
(gen_random_uuid(), 'dr.arjun.psych@hospital.com', 'Dr. Arjun', 'Rao', 'caregiver'),
(gen_random_uuid(), 'dr.nisha.endo@hospital.com', 'Dr. Nisha', 'Agarwal', 'caregiver'),
-- Nurses
(gen_random_uuid(), 'nurse.anita@hospital.com', 'Anita', 'Sharma', 'caregiver'),
(gen_random_uuid(), 'nurse.pooja@hospital.com', 'Pooja', 'Singh', 'caregiver'),
(gen_random_uuid(), 'nurse.rekha@hospital.com', 'Rekha', 'Patel', 'caregiver'),
-- Therapists
(gen_random_uuid(), 'physio.ravi@hospital.com', 'Ravi', 'Kumar', 'caregiver'),
(gen_random_uuid(), 'physio.deepa@hospital.com', 'Deepa', 'Therapist', 'caregiver'),
-- Home Care Helpers
(gen_random_uuid(), 'helper.lata@homecare.com', 'Lata', 'Devi', 'caregiver'),
(gen_random_uuid(), 'helper.kamala@homecare.com', 'Kamala', 'Bai', 'caregiver'),
-- Patients
(gen_random_uuid(), 'patient.john@email.com', 'John', 'Doe', 'patient'),
(gen_random_uuid(), 'patient.jane@email.com', 'Jane', 'Smith', 'patient'),
(gen_random_uuid(), 'patient.raj@email.com', 'Raj', 'Kumar', 'patient'),
(gen_random_uuid(), 'patient.priya@email.com', 'Priya', 'Sharma', 'patient'),
(gen_random_uuid(), 'patient.amit@email.com', 'Amit', 'Patel', 'patient');

-- Insert Caregivers with Detailed Specializations for AI Matching
INSERT INTO public.caregivers (user_id, type, specializations, qualifications, experience_years, languages, bio_en, bio_hi, license_number, rating, total_reviews, consultation_fee, home_visit_fee, available_for_home_visits, available_for_online, latitude, longitude, service_radius_km, center_id, is_verified, is_active) VALUES

-- Cardiologist
((SELECT id FROM public.users WHERE email='dr.rajesh.cardio@hospital.com'), 'doctor', 
ARRAY['Cardiology', 'Heart Disease', 'Chest Pain', 'Heart Attack', 'Arrhythmia', 'Heart Failure', 'Hypertension', 'Cardiac Emergency'], 
ARRAY['MBBS', 'MD Cardiology', 'DM Cardiology'], 15, ARRAY['en','hi'], 
'Experienced cardiologist specializing in heart diseases, chest pain, hypertension, and cardiac emergencies. Expert in treating heart attacks, arrhythmias, and heart failure.',
'हृदय रोग, सीने में दर्द, उच्च रक्तचाप और हृदय आपातकाल में विशेषज्ञ अनुभवी हृदय रोग विशेषज्ञ।',
'DL/DOC/CARD/001', 4.8, 245, 1200.00, 1800.00, true, true, 28.5672, 77.2100, 25, 
(SELECT id FROM public.centers WHERE name='AIIMS Delhi'), true, true),

-- Neurologist
((SELECT id FROM public.users WHERE email='dr.priya.neuro@hospital.com'), 'doctor', 
ARRAY['Neurology', 'Headache', 'Migraine', 'Stroke', 'Epilepsy', 'Brain Tumor', 'Seizures', 'Memory Loss', 'Dizziness', 'Vertigo'], 
ARRAY['MBBS', 'MD Medicine', 'DM Neurology'], 12, ARRAY['en','hi'], 
'Neurologist specializing in headaches, migraines, stroke, epilepsy, and brain disorders. Expert in treating seizures, memory problems, and neurological emergencies.',
'सिरदर्द, माइग्रेन, स्ट्रोक, मिर्गी और मस्तिष्क विकारों में विशेषज्ञ न्यूरोलॉजिस्ट।',
'MH/DOC/NEURO/002', 4.9, 189, 1000.00, 1500.00, true, true, 19.0176, 72.8562, 30, 
(SELECT id FROM public.centers WHERE name='Apollo Hospital Mumbai'), true, true),

-- Orthopedic Surgeon
((SELECT id FROM public.users WHERE email='dr.amit.ortho@hospital.com'), 'doctor', 
ARRAY['Orthopedics', 'Bone Fracture', 'Joint Pain', 'Back Pain', 'Knee Pain', 'Arthritis', 'Sports Injury', 'Spine Surgery', 'Hip Replacement'], 
ARRAY['MBBS', 'MS Orthopedics'], 10, ARRAY['en','hi'], 
'Orthopedic surgeon specializing in bone fractures, joint pain, back pain, knee problems, arthritis, and sports injuries. Expert in spine surgery and joint replacement.',
'हड्डी के फ्रैक्चर, जोड़ों के दर्द, कमर दर्द, घुटने की समस्याओं में विशेषज्ञ आर्थोपेडिक सर्जन।',
'KA/DOC/ORTHO/003', 4.7, 156, 800.00, 1200.00, true, true, 12.9352, 77.6245, 20, 
(SELECT id FROM public.centers WHERE name='Fortis Hospital Bangalore'), true, true),

-- Pediatrician
((SELECT id FROM public.users WHERE email='dr.sunita.pediatric@hospital.com'), 'doctor', 
ARRAY['Pediatrics', 'Child Fever', 'Baby Care', 'Vaccination', 'Child Development', 'Infant Care', 'Child Cough', 'Child Cold', 'Growth Monitoring'], 
ARRAY['MBBS', 'MD Pediatrics'], 8, ARRAY['en','hi'], 
'Pediatrician specializing in child healthcare, fever management, vaccination, infant care, and child development. Expert in treating childhood illnesses and growth monitoring.',
'बच्चों की स्वास्थ्य देखभाल, बुखार प्रबंधन, टीकाकरण और बाल विकास में विशेषज्ञ बाल रोग विशेषज्ञ।',
'HR/DOC/PED/004', 4.8, 203, 600.00, 900.00, true, true, 28.4595, 77.0266, 15, 
(SELECT id FROM public.centers WHERE name='Max Hospital Gurgaon'), true, true),

-- Gastroenterologist
((SELECT id FROM public.users WHERE email='dr.vikram.gastro@hospital.com'), 'doctor', 
ARRAY['Gastroenterology', 'Stomach Pain', 'Acidity', 'Digestive Issues', 'Liver Disease', 'Constipation', 'Diarrhea', 'Food Poisoning', 'Ulcer'], 
ARRAY['MBBS', 'MD Medicine', 'DM Gastroenterology'], 14, ARRAY['en','hi'], 
'Gastroenterologist specializing in stomach pain, acidity, digestive problems, liver diseases, and gastrointestinal disorders. Expert in endoscopy and liver treatments.',
'पेट दर्द, एसिडिटी, पाचन संबंधी समस्याओं और यकृत रोगों में विशेषज्ञ गैस्ट्रोएंटेरोलॉजिस्ट।',
'MH/DOC/GASTRO/005', 4.6, 178, 900.00, 1300.00, true, true, 18.5511, 73.9470, 25, 
(SELECT id FROM public.centers WHERE name='Manipal Hospital Pune'), true, true),

-- Dermatologist
((SELECT id FROM public.users WHERE email='dr.meera.derma@hospital.com'), 'doctor', 
ARRAY['Dermatology', 'Skin Rash', 'Acne', 'Skin Allergy', 'Hair Loss', 'Eczema', 'Psoriasis', 'Skin Infection', 'Moles', 'Skin Cancer'], 
ARRAY['MBBS', 'MD Dermatology'], 9, ARRAY['en','hi'], 
'Dermatologist specializing in skin rashes, acne, allergies, hair loss, eczema, psoriasis, and skin infections. Expert in cosmetic dermatology and skin cancer screening.',
'त्वचा की चकत्ते, मुंहासे, एलर्जी, बालों का झड़ना और त्वचा संक्रमण में विशेषज्ञ त्वचा विशेषज्ञ।',
'HR/DOC/DERMA/006', 4.7, 134, 700.00, 1000.00, true, true, 28.4289, 77.0428, 20, 
(SELECT id FROM public.centers WHERE name='Medanta Gurgaon'), true, true),

-- ENT Specialist
((SELECT id FROM public.users WHERE email='dr.rohit.ent@hospital.com'), 'doctor', 
ARRAY['ENT', 'Ear Pain', 'Throat Pain', 'Nose Bleeding', 'Hearing Loss', 'Tonsillitis', 'Sinusitis', 'Voice Problems', 'Ear Infection'], 
ARRAY['MBBS', 'MS ENT'], 7, ARRAY['en','hi'], 
'ENT specialist treating ear pain, throat infections, nose problems, hearing loss, tonsillitis, sinusitis, and voice disorders. Expert in ear, nose, and throat surgeries.',
'कान दर्द, गले के संक्रमण, नाक की समस्याओं और सुनने की हानि में विशेषज्ञ ईएनटी विशेषज्ञ।',
'KA/DOC/ENT/007', 4.5, 98, 600.00, 800.00, true, true, 12.8056, 77.6803, 18, 
(SELECT id FROM public.centers WHERE name='Narayana Health Bangalore'), true, true),

-- Gynecologist
((SELECT id FROM public.users WHERE email='dr.kavita.gynec@hospital.com'), 'doctor', 
ARRAY['Gynecology', 'Pregnancy', 'Menstrual Problems', 'PCOS', 'Infertility', 'Delivery', 'Prenatal Care', 'Women Health', 'Contraception'], 
ARRAY['MBBS', 'MD Gynecology'], 11, ARRAY['en','hi'], 
'Gynecologist specializing in pregnancy care, menstrual disorders, PCOS, infertility treatment, delivery, and women health. Expert in high-risk pregnancies and reproductive health.',
'गर्भावस्था देखभाल, मासिक धर्म विकार, पीसीओएस और बांझपन उपचार में विशेषज्ञ स्त्री रोग विशेषज्ञ।',
'MH/DOC/GYNEC/008', 4.9, 267, 800.00, 1200.00, true, true, 18.5314, 73.8446, 22, 
(SELECT id FROM public.centers WHERE name='Ruby Hall Clinic Pune'), true, true),

-- Psychiatrist
((SELECT id FROM public.users WHERE email='dr.arjun.psych@hospital.com'), 'doctor', 
ARRAY['Psychiatry', 'Depression', 'Anxiety', 'Stress', 'Mental Health', 'Panic Attacks', 'Sleep Disorders', 'Counseling', 'Bipolar Disorder'], 
ARRAY['MBBS', 'MD Psychiatry'], 6, ARRAY['en','hi'], 
'Psychiatrist specializing in depression, anxiety, stress management, panic attacks, sleep disorders, and mental health counseling. Expert in therapy and psychiatric medications.',
'अवसाद, चिंता, तनाव प्रबंधन और मानसिक स्वास्थ्य परामर्श में विशेषज्ञ मनोचिकित्सक।',
'DL/DOC/PSYCH/009', 4.8, 145, 1000.00, 1400.00, true, true, 28.5672, 77.2100, 30, 
(SELECT id FROM public.centers WHERE name='AIIMS Delhi'), true, true),

-- Endocrinologist
((SELECT id FROM public.users WHERE email='dr.nisha.endo@hospital.com'), 'doctor', 
ARRAY['Endocrinology', 'Diabetes', 'Thyroid', 'Hormone Imbalance', 'Weight Gain', 'PCOS', 'Metabolic Disorders', 'Insulin Resistance'], 
ARRAY['MBBS', 'MD Medicine', 'DM Endocrinology'], 13, ARRAY['en','hi'], 
'Endocrinologist specializing in diabetes management, thyroid disorders, hormone imbalances, weight management, PCOS, and metabolic disorders. Expert in insulin therapy and hormone treatments.',
'मधुमेह प्रबंधन, थायराइड विकार, हार्मोन असंतुलन और वजन प्रबंधन में विशेषज्ञ एंडोक्रिनोलॉजिस्ट।',
'MH/DOC/ENDO/010', 4.7, 198, 900.00, 1300.00, true, true, 19.0176, 72.8562, 25, 
(SELECT id FROM public.centers WHERE name='Apollo Hospital Mumbai'), true, true),

-- Nurses
((SELECT id FROM public.users WHERE email='nurse.anita@hospital.com'), 'nurse', 
ARRAY['Critical Care', 'ICU Care', 'Post Surgery Care', 'Wound Dressing', 'Injection', 'IV Therapy', 'Patient Monitoring'], 
ARRAY['BSc Nursing', 'Critical Care Certification'], 8, ARRAY['hi','en'], 
'Experienced ICU nurse specializing in critical care, post-surgery care, wound dressing, injections, and IV therapy. Expert in patient monitoring and emergency care.',
'गंभीर देखभाल, सर्जरी के बाद की देखभाल, घाव की ड्रेसिंग में विशेषज्ञ अनुभवी आईसीयू नर्स।',
'DL/NUR/001', 4.6, 89, 0.00, 500.00, true, true, 28.5672, 77.2100, 15, 
(SELECT id FROM public.centers WHERE name='AIIMS Delhi'), true, true),

((SELECT id FROM public.users WHERE email='nurse.pooja@hospital.com'), 'nurse', 
ARRAY['Pediatric Care', 'Child Care', 'Vaccination', 'Newborn Care', 'Baby Massage', 'Infant Feeding'], 
ARRAY['BSc Nursing', 'Pediatric Nursing Certificate'], 6, ARRAY['hi','en'], 
'Pediatric nurse specializing in child care, vaccination, newborn care, baby massage, and infant health monitoring. Expert in handling children and family support.',
'बाल देखभाल, टीकाकरण, नवजात देखभाल और शिशु स्वास्थ्य निगरानी में विशेषज्ञ बाल चिकित्सा नर्स।',
'MH/NUR/002', 4.7, 76, 0.00, 450.00, true, true, 19.0176, 72.8562, 12, 
(SELECT id FROM public.centers WHERE name='Apollo Hospital Mumbai'), true, true),

((SELECT id FROM public.users WHERE email='nurse.rekha@hospital.com'), 'nurse', 
ARRAY['Home Nursing', 'Elder Care', 'Bedridden Patient Care', 'Medication Management', 'Physiotherapy Support', 'Chronic Care'], 
ARRAY['Diploma Nursing', 'Home Care Certificate'], 10, ARRAY['hi'], 
'Home care nurse specializing in elder care, bedridden patient care, medication management, and physiotherapy support. Expert in long-term care and family training.',
'बुजुर्ग देखभाल, बिस्तर पर पड़े मरीज़ों की देखभाल और दवा प्रबंधन में विशेषज्ञ होम केयर नर्स।',
'KA/NUR/003', 4.8, 112, 0.00, 600.00, true, true, 12.9352, 77.6245, 20, 
(SELECT id FROM public.centers WHERE name='Fortis Hospital Bangalore'), true, true),

-- Therapists
((SELECT id FROM public.users WHERE email='physio.ravi@hospital.com'), 'therapist', 
ARRAY['Physiotherapy', 'Back Pain', 'Neck Pain', 'Joint Pain', 'Sports Injury', 'Rehabilitation', 'Exercise Therapy', 'Muscle Strain'], 
ARRAY['BPT', 'MPT', 'Sports Physiotherapy Certificate'], 9, ARRAY['en','hi'], 
'Physiotherapist specializing in back pain, neck pain, joint pain, sports injuries, and rehabilitation. Expert in exercise therapy and post-surgery recovery.',
'कमर दर्द, गर्दन दर्द, जोड़ों के दर्द और खेल चोटों में विशेषज्ञ फिजियोथेरेपिस्ट।',
'HR/PHYSIO/001', 4.7, 134, 600.00, 800.00, true, true, 28.4595, 77.0266, 18, 
(SELECT id FROM public.centers WHERE name='Max Hospital Gurgaon'), true, true),

((SELECT id FROM public.users WHERE email='physio.deepa@hospital.com'), 'therapist', 
ARRAY['Physiotherapy', 'Women Health', 'Pregnancy Exercise', 'Post Delivery Care', 'Pelvic Floor Therapy', 'Prenatal Care'], 
ARRAY['BPT', 'Women Health Physiotherapy'], 7, ARRAY['hi','en'], 
'Women health physiotherapist specializing in pregnancy exercises, post-delivery care, pelvic floor therapy, and prenatal physiotherapy. Expert in women wellness and recovery.',
'गर्भावस्था व्यायाम, प्रसव के बाद की देखभाल और महिला स्वास्थ्य में विशेषज्ञ फिजियोथेरेपिस्ट।',
'MH/PHYSIO/002', 4.6, 87, 500.00, 700.00, true, true, 18.5511, 73.9470, 15, 
(SELECT id FROM public.centers WHERE name='Manipal Hospital Pune'), true, true),

-- Home Care Helpers
((SELECT id FROM public.users WHERE email='helper.lata@homecare.com'), 'maid', 
ARRAY['Elder Care', 'Home Care', 'Personal Care', 'Medication Reminder', 'Companionship', 'Daily Activities', 'Mobility Assistance'], 
ARRAY['Home Care Training', 'Elder Care Certificate'], 5, ARRAY['hi'], 
'Experienced home care helper specializing in elder care, personal care assistance, medication reminders, and companionship. Expert in daily living support and mobility assistance.',
'बुजुर्ग देखभाल, व्यक्तिगत देखभाल सहायता, दवा अनुस्मारक में विशेषज्ञ अनुभवी होम केयर सहायक।',
'DL/HELPER/001', 4.5, 67, 0.00, 300.00, true, false, 28.4289, 77.0428, 10, 
(SELECT id FROM public.centers WHERE name='Medanta Gurgaon'), true, true),

((SELECT id FROM public.users WHERE email='helper.kamala@homecare.com'), 'maid', 
ARRAY['Child Care', 'Baby Care', 'Infant Care', 'Feeding Assistance', 'Diaper Change', 'Baby Massage', 'Child Safety'], 
ARRAY['Child Care Training', 'Baby Care Certificate'], 8, ARRAY['hi'], 
'Experienced child care helper specializing in baby care, infant feeding, diaper changing, baby massage, and child safety. Expert in newborn care and child development support.',
'शिशु देखभाल, बच्चों का भोजन, डायपर बदलना और बच्चों की सुरक्षा में विशेषज्ञ अनुभवी चाइल्ड केयर सहायक।',
'KA/HELPER/002', 4.4, 54, 0.00, 250.00, true, false, 12.8056, 77.6803, 8, 
(SELECT id FROM public.centers WHERE name='Narayana Health Bangalore'), true, true);

-- Insert Sample Patients
INSERT INTO public.patients (user_id, date_of_birth, gender, blood_group, emergency_contact_name, emergency_contact_phone, allergies, current_medications) VALUES
((SELECT id FROM public.users WHERE email='patient.john@email.com'), '1985-06-15', 'male', 'O+', 'Mary Doe', '+91-9876543210', ARRAY['Penicillin'], ARRAY['Aspirin 75mg']),
((SELECT id FROM public.users WHERE email='patient.jane@email.com'), '1990-03-22', 'female', 'A+', 'Robert Smith', '+91-9876543211', ARRAY['Shellfish'], ARRAY['Vitamin D']),
((SELECT id FROM public.users WHERE email='patient.raj@email.com'), '1978-11-08', 'male', 'B+', 'Sunita Kumar', '+91-9876543212', ARRAY[]::text[], ARRAY['Metformin 500mg']),
((SELECT id FROM public.users WHERE email='patient.priya@email.com'), '1992-09-14', 'female', 'AB+', 'Amit Sharma', '+91-9876543213', ARRAY['Dust'], ARRAY['Iron tablets']),
((SELECT id FROM public.users WHERE email='patient.amit@email.com'), '1988-01-30', 'male', 'O-', 'Neha Patel', '+91-9876543214', ARRAY['Latex'], ARRAY['Multivitamin']);

-- Insert Sample Appointments
INSERT INTO public.appointments (patient_id, caregiver_id, center_id, mode, status, start_time, end_time, symptoms, payment_amount, payment_status) VALUES
((SELECT p.id FROM public.patients p JOIN public.users u ON p.user_id = u.id WHERE u.email='patient.john@email.com'),
 (SELECT c.id FROM public.caregivers c JOIN public.users u ON c.user_id = u.id WHERE u.email='dr.rajesh.cardio@hospital.com'),
 (SELECT id FROM public.centers WHERE name='AIIMS Delhi'),
 'offline', 'confirmed', 
 NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days' + INTERVAL '30 minutes',
 ARRAY['chest pain', 'shortness of breath'], 1200.00, 'paid'),

((SELECT p.id FROM public.patients p JOIN public.users u ON p.user_id = u.id WHERE u.email='patient.jane@email.com'),
 (SELECT c.id FROM public.caregivers c JOIN public.users u ON c.user_id = u.id WHERE u.email='dr.priya.neuro@hospital.com'),
 (SELECT id FROM public.centers WHERE name='Apollo Hospital Mumbai'),
 'online', 'requested',
 NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day' + INTERVAL '45 minutes',
 ARRAY['headache', 'dizziness'], 1000.00, 'pending');

-- Insert Sample Notifications
INSERT INTO public.notifications (user_id, type, title, message) VALUES
((SELECT id FROM public.users WHERE email='patient.john@email.com'), 'appointment_confirm', 'Appointment Confirmed', 'Your appointment with Dr. Rajesh Sharma has been confirmed for tomorrow at 2:00 PM'),
((SELECT id FROM public.users WHERE email='patient.jane@email.com'), 'appointment_reminder', 'Appointment Reminder', 'You have an upcoming appointment with Dr. Priya Patel in 2 hours');

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify data insertion
SELECT 'Centers' as table_name, COUNT(*) as count FROM public.centers
UNION ALL
SELECT 'Users', COUNT(*) FROM public.users
UNION ALL
SELECT 'Caregivers', COUNT(*) FROM public.caregivers
UNION ALL
SELECT 'Patients', COUNT(*) FROM public.patients
UNION ALL
SELECT 'Appointments', COUNT(*) FROM public.appointments
UNION ALL
SELECT 'Notifications', COUNT(*) FROM public.notifications;

-- Test caregiver search with specializations
SELECT 
  u.first_name || ' ' || u.last_name as name,
  c.type,
  c.specializations,
  c.rating,
  c.experience_years,
  c.is_active,
  c.is_verified
FROM public.caregivers c
JOIN public.users u ON c.user_id = u.id
WHERE c.is_active = true AND c.is_verified = true
ORDER BY c.rating DESC;

-- Test search function
SELECT * FROM search_caregivers_by_symptoms(
  ARRAY['chest pain', 'heart disease'], 
  28.5672, 
  77.2100, 
  50, 
  'doctor'
);

-- =====================================================
-- SETUP COMPLETE
-- =====================================================
-- Your healthcare database is now ready with:
-- ✅ All tables created
-- ✅ Indexes for performance
-- ✅ Row Level Security policies
-- ✅ AI search function
-- ✅ Comprehensive seed data (22 users, 17 caregivers, 8 centers)
-- ✅ Sample appointments and notifications
-- 
-- You can now test your API endpoints!
-- =====================================================
-- =
====================================================
