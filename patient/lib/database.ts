import { supabase } from './supabaseClient';

export interface CaregiverData {
  id: string;
  first_name: string;
  last_name: string;
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
  created_at: string;
  updated_at: string;
}

export interface UserData {
  id: string;
  auth_id?: string;
  clerk_id?: string;
  email: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  image_url?: string;
  role: 'patient' | 'caregiver' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface PatientData {
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

export interface AppointmentData {
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

// Fetch all active caregivers
export async function fetchCaregivers(limit = 50): Promise<{ data: CaregiverData[] | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('caregivers')
      .select('*')
      .eq('is_active', true)
      .eq('is_verified', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    return { data, error };
  } catch (error) {
    console.error('Error fetching caregivers:', error);
    return { data: null, error };
  }
}

// Fetch caregiver by ID
export async function fetchCaregiverById(id: string): Promise<{ data: CaregiverData | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('caregivers')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    return { data, error };
  } catch (error) {
    console.error('Error fetching caregiver by ID:', error);
    return { data: null, error };
  }
}

// Search caregivers by specialization
export async function searchCaregiversBySpecialization(
  specializations: string[],
  limit = 20
): Promise<{ data: CaregiverData[] | null; error: any }> {
  try {
    let query = supabase
      .from('caregivers')
      .select('*')
      .eq('is_active', true)
      .eq('is_verified', true);

    // Add specialization filters
    for (const spec of specializations) {
      query = query.contains('specializations', [spec]);
    }

    const { data, error } = await query
      .order('experience_years', { ascending: false })
      .limit(limit);

    return { data, error };
  } catch (error) {
    console.error('Error searching caregivers by specialization:', error);
    return { data: null, error };
  }
}

// Fetch users
export async function fetchUsers(role?: 'patient' | 'caregiver' | 'admin', limit = 50): Promise<{ data: UserData[] | null; error: any }> {
  try {
    let query = supabase
      .from('users')
      .select('id, auth_id, clerk_id, email, phone, first_name, last_name, image_url, role, created_at, updated_at');

    if (role) {
      query = query.eq('role', role);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(limit);

    return { data, error };
  } catch (error) {
    console.error('Error fetching users:', error);
    return { data: null, error };
  }
}

// Fetch patients
export async function fetchPatients(limit = 50): Promise<{ data: PatientData[] | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    return { data, error };
  } catch (error) {
    console.error('Error fetching patients:', error);
    return { data: null, error };
  }
}

// Fetch appointments
export async function fetchAppointments(
  status?: 'requested' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled',
  limit = 50
): Promise<{ data: AppointmentData[] | null; error: any }> {
  try {
    let query = supabase
      .from('appointments')
      .select('*');

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query
      .order('start_time', { ascending: false })
      .limit(limit);

    return { data, error };
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return { data: null, error };
  }
}

// Fetch appointments for a specific patient
export async function fetchPatientAppointments(patientId: string): Promise<{ data: AppointmentData[] | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('patient_id', patientId)
      .order('start_time', { ascending: false });

    return { data, error };
  } catch (error) {
    console.error('Error fetching patient appointments:', error);
    return { data: null, error };
  }
}

// Fetch appointments for a specific caregiver
export async function fetchCaregiverAppointments(caregiverId: string): Promise<{ data: AppointmentData[] | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('caregiver_id', caregiverId)
      .order('start_time', { ascending: false });

    return { data, error };
  } catch (error) {
    console.error('Error fetching caregiver appointments:', error);
    return { data: null, error };
  }
}

// Get database statistics
export async function getDatabaseStats(): Promise<{
  users: number;
  caregivers: number;
  patients: number;
  appointments: number;
  error?: any;
}> {
  try {
    const [usersResult, caregiversResult, patientsResult, appointmentsResult] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('caregivers').select('id', { count: 'exact', head: true }),
      supabase.from('patients').select('id', { count: 'exact', head: true }),
      supabase.from('appointments').select('id', { count: 'exact', head: true })
    ]);

    return {
      users: usersResult.count || 0,
      caregivers: caregiversResult.count || 0,
      patients: patientsResult.count || 0,
      appointments: appointmentsResult.count || 0,
      error: usersResult.error || caregiversResult.error || patientsResult.error || appointmentsResult.error
    };
  } catch (error) {
    console.error('Error getting database stats:', error);
    return {
      users: 0,
      caregivers: 0,
      patients: 0,
      appointments: 0,
      error
    };
  }
}