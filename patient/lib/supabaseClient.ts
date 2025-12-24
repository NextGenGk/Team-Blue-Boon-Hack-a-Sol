import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type definitions for your database
export interface User {
  id: string;
  auth_id: string;
  clerk_id?: string;
  email: string;
  phone?: string;
  first_name: string;
  last_name: string;
  role: 'patient' | 'caregiver' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface Caregiver {
  id: string;
  user_id: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  image_url?: string;
  type: string;
  specializations: string[];
  qualifications: string[];
  experience_years: number;
  languages: string[];
  bio?: string;
  consultation_fee: number;
  home_visit_fee: number;
  available_for_home_visits: boolean;
  available_for_online: boolean;
  latitude?: number;
  longitude?: number;
  service_radius_km: number;
  is_verified: boolean;
  is_active: boolean;
  rating?: number;
  total_reviews?: number;
  center_id?: string;
  created_at: string;
  updated_at: string;

  // New fields for Doctors/Clinics
  clinic_name?: string;
  address_line1?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  registration_number?: string;
  years_of_experience?: number;
  qualification?: string;
  specialization?: string;
  profile_image_url?: string;
}

export interface Patient {
  id: string;
  user_id: string;
  assigned_nurse_id?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  blood_group?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  allergies: string[];
  current_medications: string[];
  prakriti_assessment?: any;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  caregiver_id: string;
  mode: 'online' | 'home_visit' | 'offline';
  status: 'requested' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  start_time: string;
  end_time: string;
  symptoms: string[];
  home_visit_address?: string;
  home_visit_latitude?: number;
  home_visit_longitude?: number;
  payment_required: boolean;
  payment_amount?: number;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  zego_room_id?: string;
  created_at: string;
  updated_at: string;
}

export interface AIQueryLog {
  id: string;
  session_id?: string;
  user_id?: string;
  query_text: string;
  user_lang: 'en' | 'hi';
  extracted_symptoms: string[];
  extracted_conditions: string[];
  recommended_specializations: string[];
  confidence_score?: number;
  results_returned?: number;
  response_time_ms?: number;
  created_at: string;
}