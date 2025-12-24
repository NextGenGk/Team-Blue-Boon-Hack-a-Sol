-- AyurSutram Database Schema v1.0 - Simplified & Clean
-- PostgreSQL 15+ compatible for Neon
-- Healthcare Management System with AI-Powered Prescriptions

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable encryption extension for sensitive data
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- CORE USER MANAGEMENT
-- ============================================

-- Users table (base authentication)
CREATE TABLE users (
    uid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('patient', 'doctor', 'admin')),
    name VARCHAR(255) NOT NULL,
    profile_image_url TEXT, -- User profile image
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

-- Patient profiles
CREATE TABLE patients (
    pid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    uid UUID UNIQUE NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
    date_of_birth DATE,
    gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    blood_group VARCHAR(5),
    
    -- Medical information for AI prescription generation
    allergies TEXT[], -- Array of allergies
    current_medications TEXT[], -- Current ongoing medications
    chronic_conditions TEXT[], -- Diabetes, Hypertension, etc.
    
    -- Address (optional)
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    postal_code VARCHAR(20),
    
    -- Emergency contact
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Doctor profiles
CREATE TABLE doctors (
    did UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    uid UUID UNIQUE NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
    
    -- Professional details
    specialization VARCHAR(255) NOT NULL,
    qualification TEXT NOT NULL,
    registration_number VARCHAR(100) UNIQUE, -- Optional: Medical council registration
    years_of_experience INTEGER,
    consultation_fee DECIMAL(10, 2),
    bio TEXT,
    
    -- Clinic location (all optional)
    clinic_name VARCHAR(255),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'India',
    postal_code VARCHAR(20),
    
    -- Multilingual support
    languages TEXT[], -- ['English', 'Hindi', 'Marathi']
    
    is_verified BOOLEAN DEFAULT FALSE, -- Admin verification status
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- APPOINTMENT MANAGEMENT
-- ============================================

CREATE TABLE appointments (
    aid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pid UUID NOT NULL REFERENCES patients(pid) ON DELETE CASCADE,
    did UUID NOT NULL REFERENCES doctors(did) ON DELETE CASCADE,
    
    -- Appointment mode
    mode VARCHAR(20) NOT NULL CHECK (mode IN ('online', 'offline')),
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')),
    
    -- Timing
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER, -- Actual duration
    
    -- OFFLINE APPOINTMENT FIELDS (only for offline mode)
    token_number INTEGER, -- Token/Sequence number for queue
    queue_position INTEGER, -- Current position in queue
    estimated_wait_minutes INTEGER, -- Estimated wait time
    
    -- ONLINE APPOINTMENT FIELDS (only for online mode)
    meeting_link TEXT, -- Direct meeting link (Google Meet, Zoom, Jitsi, etc.)
    meeting_id VARCHAR(255), -- Meeting ID for reference
    meeting_password VARCHAR(100), -- If meeting requires password
    
    -- Patient complaint and notes
    chief_complaint TEXT NOT NULL, -- Why patient is visiting
    symptoms TEXT[], -- List of symptoms
    doctor_notes TEXT, -- Doctor's notes during/after appointment
    
    -- Cancellation
    cancellation_reason TEXT,
    cancelled_by UUID REFERENCES users(uid),
    cancelled_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints: offline fields only for offline, online fields only for online
    CONSTRAINT offline_fields_check CHECK (
        (mode = 'offline' AND token_number IS NOT NULL) OR
        (mode = 'online' AND meeting_link IS NOT NULL) OR
        (mode NOT IN ('online', 'offline'))
    )
);

-- ============================================
-- SIMPLE PRESCRIPTION MANAGEMENT
-- ============================================

CREATE TABLE prescriptions (
    prescription_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    aid UUID NOT NULL REFERENCES appointments(aid) ON DELETE CASCADE,
    pid UUID NOT NULL REFERENCES patients(pid) ON DELETE CASCADE,
    did UUID NOT NULL REFERENCES doctors(did) ON DELETE CASCADE,
    
    -- Diagnosis
    diagnosis TEXT NOT NULL,
    symptoms TEXT[], -- Symptoms addressed
    
    -- Medicines (simple JSONB array)
    medicines JSONB NOT NULL,
    /* Simple structure:
    [
        {
            "name": "Paracetamol 500mg",
            "dosage": "1 tablet",
            "frequency": "Twice daily",
            "duration": "5 days",
            "instructions": "After meals"
        }
    ]
    */
    
    -- Additional advice
    instructions TEXT, -- General instructions
    diet_advice TEXT, -- Dietary recommendations
    
    -- Follow-up
    follow_up_date DATE,
    follow_up_notes TEXT,
    
    -- AI metadata (simple tracking)
    ai_generated BOOLEAN DEFAULT FALSE,
    ai_suggestions JSONB, -- What AI originally suggested
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- MEDICATION ADHERENCE TRACKING
-- ============================================

CREATE TABLE medication_adherence (
    adherence_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prescription_id UUID NOT NULL REFERENCES prescriptions(prescription_id) ON DELETE CASCADE,
    pid UUID NOT NULL REFERENCES patients(pid) ON DELETE CASCADE,
    
    medicine_name VARCHAR(255) NOT NULL,
    
    -- Schedule
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    
    -- Tracking
    taken_at TIMESTAMP WITH TIME ZONE,
    is_taken BOOLEAN DEFAULT FALSE,
    is_skipped BOOLEAN DEFAULT FALSE,
    skip_reason TEXT,
    
    -- For offline sync
    synced BOOLEAN DEFAULT FALSE,
    device_timestamp TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(prescription_id, medicine_name, scheduled_date, scheduled_time)
);

-- Simple adherence progress view
CREATE VIEW adherence_progress AS
SELECT 
    pid,
    prescription_id,
    medicine_name,
    COUNT(*) as total_doses,
    SUM(CASE WHEN is_taken THEN 1 ELSE 0 END) as taken_doses,
    SUM(CASE WHEN is_skipped THEN 1 ELSE 0 END) as skipped_doses,
    ROUND(
        (SUM(CASE WHEN is_taken THEN 1 ELSE 0 END)::DECIMAL / 
         NULLIF(COUNT(*), 0) * 100), 2
    ) as adherence_percentage
FROM medication_adherence
GROUP BY pid, prescription_id, medicine_name;

-- ============================================
-- FINANCIAL MANAGEMENT WITH RAZORPAY
-- ============================================

CREATE TABLE finance_transactions (
    transaction_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    aid UUID REFERENCES appointments(aid) ON DELETE SET NULL,
    pid UUID NOT NULL REFERENCES patients(pid) ON DELETE CASCADE,
    did UUID REFERENCES doctors(did) ON DELETE SET NULL,
    
    -- Transaction details
    transaction_type VARCHAR(30) NOT NULL CHECK (transaction_type IN ('consultation', 'refund', 'cancellation_charge')),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    
    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
    
    -- Razorpay integration
    razorpay_order_id VARCHAR(255) UNIQUE, -- order_xxx from Razorpay
    razorpay_payment_id VARCHAR(255) UNIQUE, -- pay_xxx after successful payment
    razorpay_signature VARCHAR(500), -- For verification
    
    payment_method VARCHAR(30), -- card, netbanking, upi, wallet
    
    -- Razorpay webhook response (optional)
    razorpay_response JSONB,
    
    -- Metadata
    description TEXT,
    
    -- Timing
    initiated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE,
    refunded_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE receipts (
    receipt_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID NOT NULL REFERENCES finance_transactions(transaction_id) ON DELETE CASCADE,
    
    -- Receipt details
    receipt_number VARCHAR(50) UNIQUE NOT NULL, -- Auto-generated: RCP-YYYYMMDD-XXXX
    receipt_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Patient and doctor info
    pid UUID NOT NULL REFERENCES patients(pid),
    did UUID NOT NULL REFERENCES doctors(did),
    patient_name VARCHAR(255) NOT NULL,
    doctor_name VARCHAR(255) NOT NULL,
    
    -- Financial breakdown
    consultation_fee DECIMAL(10, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    
    -- Payment details
    payment_method VARCHAR(30),
    razorpay_payment_id VARCHAR(255),
    
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- MULTILINGUAL SUPPORT
-- ============================================

CREATE TABLE app_translations (
    translation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(255) NOT NULL, -- 'welcome_message', 'appointment_booked', etc.
    language_code VARCHAR(10) NOT NULL, -- 'en', 'hi', 'mr', 'gu', etc.
    translated_text TEXT NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(key, language_code)
);

-- ============================================
-- OFFLINE SYNC MANAGEMENT
-- ============================================

CREATE TABLE sync_queue (
    sync_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
    
    entity_type VARCHAR(50) NOT NULL, -- 'adherence', 'appointment', etc.
    entity_id UUID NOT NULL,
    operation VARCHAR(20) NOT NULL CHECK (operation IN ('create', 'update', 'delete')),
    
    data JSONB NOT NULL, -- The actual data to sync
    
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'synced', 'failed')),
    retry_count INTEGER DEFAULT 0,
    error_message TEXT,
    
    device_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    synced_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);

-- Patients
CREATE INDEX idx_patients_uid ON patients(uid);

-- Doctors
CREATE INDEX idx_doctors_uid ON doctors(uid);
CREATE INDEX idx_doctors_specialization ON doctors(specialization);

-- Appointments
CREATE INDEX idx_appointments_pid ON appointments(pid);
CREATE INDEX idx_appointments_did ON appointments(did);
CREATE INDEX idx_appointments_date ON appointments(scheduled_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_mode ON appointments(mode);

-- Prescriptions
CREATE INDEX idx_prescriptions_aid ON prescriptions(aid);
CREATE INDEX idx_prescriptions_pid ON prescriptions(pid);
CREATE INDEX idx_prescriptions_did ON prescriptions(did);
CREATE INDEX idx_prescriptions_active ON prescriptions(is_active);

-- Adherence
CREATE INDEX idx_adherence_prescription ON medication_adherence(prescription_id);
CREATE INDEX idx_adherence_pid ON medication_adherence(pid);
CREATE INDEX idx_adherence_date ON medication_adherence(scheduled_date);
CREATE INDEX idx_adherence_synced ON medication_adherence(synced);

-- Transactions
CREATE INDEX idx_transactions_pid ON finance_transactions(pid);
CREATE INDEX idx_transactions_aid ON finance_transactions(aid);
CREATE INDEX idx_transactions_status ON finance_transactions(status);
CREATE INDEX idx_transactions_razorpay_order ON finance_transactions(razorpay_order_id);

-- Sync queue
CREATE INDEX idx_sync_user ON sync_queue(user_id);
CREATE INDEX idx_sync_status ON sync_queue(status);

-- ============================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================

-- Auto-update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON doctors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON prescriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-generate receipt number
CREATE OR REPLACE FUNCTION generate_receipt_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.receipt_number IS NULL THEN
        NEW.receipt_number := 'RCP-' || 
            TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || 
            LPAD(NEXTVAL('receipt_sequence')::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE SEQUENCE receipt_sequence START 1;

CREATE TRIGGER generate_receipt_number_trigger 
    BEFORE INSERT ON receipts
    FOR EACH ROW EXECUTE FUNCTION generate_receipt_number();

-- Auto-generate token number for offline appointments
CREATE OR REPLACE FUNCTION generate_token_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.mode = 'offline' AND NEW.token_number IS NULL THEN
        -- Get next token number for this doctor on this date
        SELECT COALESCE(MAX(token_number), 0) + 1
        INTO NEW.token_number
        FROM appointments
        WHERE did = NEW.did 
        AND scheduled_date = NEW.scheduled_date
        AND mode = 'offline';
        
        NEW.queue_position := NEW.token_number;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER generate_token_number_trigger 
    BEFORE INSERT ON appointments
    FOR EACH ROW EXECUTE FUNCTION generate_token_number();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on sensitive tables
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_adherence ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_transactions ENABLE ROW LEVEL SECURITY;

-- Patients can only see their own data
CREATE POLICY patient_own_data ON patients
    FOR ALL
    USING (uid = current_setting('app.current_user_id', true)::UUID);

-- Doctors can see their own data
CREATE POLICY doctor_own_data ON doctors
    FOR ALL
    USING (uid = current_setting('app.current_user_id', true)::UUID);

-- Patients can see appointments where they are the patient
CREATE POLICY patient_appointments ON appointments
    FOR ALL
    USING (
        pid IN (SELECT pid FROM patients WHERE uid = current_setting('app.current_user_id', true)::UUID)
    );

-- Doctors can see appointments where they are the doctor
CREATE POLICY doctor_appointments ON appointments
    FOR ALL
    USING (
        did IN (SELECT did FROM doctors WHERE uid = current_setting('app.current_user_id', true)::UUID)
    );

-- Similar policies for prescriptions
CREATE POLICY patient_prescriptions ON prescriptions
    FOR ALL
    USING (
        pid IN (SELECT pid FROM patients WHERE uid = current_setting('app.current_user_id', true)::UUID)
    );

CREATE POLICY doctor_prescriptions ON prescriptions
    FOR ALL
    USING (
        did IN (SELECT did FROM doctors WHERE uid = current_setting('app.current_user_id', true)::UUID)
    );

-- ============================================
-- HELPER VIEWS
-- ============================================

-- Upcoming appointments with all details
CREATE VIEW upcoming_appointments AS
SELECT 
    a.aid,
    a.mode,
    a.scheduled_date,
    a.scheduled_time,
    a.status,
    a.token_number,
    a.queue_position,
    a.meeting_link,
    p.pid,
    u_patient.name as patient_name,
    u_patient.phone as patient_phone,
    u_patient.profile_image_url as patient_image,
    d.did,
    u_doctor.name as doctor_name,
    u_doctor.profile_image_url as doctor_image,
    d.specialization,
    d.consultation_fee
FROM appointments a
JOIN patients p ON a.pid = p.pid
JOIN users u_patient ON p.uid = u_patient.uid
JOIN doctors d ON a.did = d.did
JOIN users u_doctor ON d.uid = u_doctor.uid
WHERE a.status IN ('scheduled', 'confirmed')
    AND a.scheduled_date >= CURRENT_DATE
ORDER BY a.scheduled_date, a.scheduled_time;

-- Active prescriptions
CREATE VIEW active_prescriptions AS
SELECT 
    pr.prescription_id,
    pr.pid,
    pr.diagnosis,
    pr.medicines,
    pr.instructions,
    pr.diet_advice,
    pr.follow_up_date,
    pr.ai_generated,
    pr.created_at,
    u_doctor.name as doctor_name,
    u_doctor.profile_image_url as doctor_image,
    d.specialization
FROM prescriptions pr
JOIN doctors d ON pr.did = d.did
JOIN users u_doctor ON d.uid = u_doctor.uid
WHERE pr.is_active = TRUE;

ALTER TABLE appointments DROP CONSTRAINT IF EXISTS offline_fields_check;
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointment_mode_check;

ALTER TABLE appointments 
ADD CONSTRAINT appointment_mode_check CHECK (
    (mode = 'offline' AND (token_number IS NOT NULL OR status = 'cancelled')) OR
    (mode = 'online' AND (meeting_link IS NOT NULL OR status IN ('cancelled', 'scheduled'))) OR
    (mode NOT IN ('online', 'offline'))
);