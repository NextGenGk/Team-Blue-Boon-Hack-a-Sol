import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
}

// Client for database operations only (no auth)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

// Admin client for server-side operations (bypasses RLS)
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

// Database types
export interface User {
  id: string;
  clerk_id: string; // Changed from auth_id to clerk_id
  email?: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Patient {
  id: string;
  user_id: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  blood_group?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  medical_history_encrypted?: Uint8Array;
  allergies?: string[];
  current_medications?: string[];
  prakriti_assessment?: any;
  created_at: string;
  updated_at: string;
  // User data from join
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
}

export interface Caregiver {
  id: string;
  user_id: string;
  type: 'doctor' | 'nurse' | 'maid' | 'therapist';
  specializations?: string[];
  qualifications?: string[];
  experience_years?: number;
  languages?: string[];
  bio_en?: string;
  bio_hi?: string;
  profile_image_url?: string;
  license_number?: string;
  rating: number;
  total_reviews: number;
  consultation_fee?: number;
  home_visit_fee?: number;
  available_for_home_visits: boolean;
  available_for_online: boolean;
  center_id?: string;
  latitude?: number;
  longitude?: number;
  service_radius_km: number;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // User data from join
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  caregiver_id: string;
  center_id?: string;
  mode: 'online' | 'offline' | 'home_visit';
  status: 'requested' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  start_time: string;
  end_time: string;
  notes_encrypted?: Uint8Array;
  symptoms?: string[];
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

export interface Center {
  id: string;
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  contact_phone?: string;
  created_at: string;
}

// Helper functions for Clerk integration
export const getUserByClerkId = async (clerkId: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_id', clerkId)
    .single();
  
  if (error) return null;
  return data;
};

export const createUserFromClerk = async (
  clerkId: string, 
  email?: string, 
  phone?: string,
  firstName?: string,
  lastName?: string,
  avatarUrl?: string
): Promise<User> => {
  const { data, error } = await supabase
    .from('users')
    .insert({
      clerk_id: clerkId,
      email,
      phone,
      first_name: firstName,
      last_name: lastName,
      avatar_url: avatarUrl
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const syncClerkUser = async (clerkUser: any): Promise<User> => {
  // Check if user exists in our database
  let user = await getUserByClerkId(clerkUser.id);
  
  if (!user) {
    // Create user in our database if doesn't exist
    const email = clerkUser.emailAddresses?.[0]?.emailAddress;
    const phone = clerkUser.phoneNumbers?.[0]?.phoneNumber;
    const firstName = clerkUser.firstName;
    const lastName = clerkUser.lastName;
    const avatarUrl = clerkUser.imageUrl;
    
    user = await createUserFromClerk(clerkUser.id, email, phone, firstName, lastName, avatarUrl);
  } else {
    // Update user data if it exists
    const { data, error } = await supabase
      .from('users')
      .update({
        email: clerkUser.emailAddresses?.[0]?.emailAddress,
        phone: clerkUser.phoneNumbers?.[0]?.phoneNumber,
        first_name: clerkUser.firstName,
        last_name: clerkUser.lastName,
        avatar_url: clerkUser.imageUrl,
        updated_at: new Date().toISOString()
      })
      .eq('clerk_id', clerkUser.id)
      .select()
      .single();
    
    if (error) throw error;
    user = data;
  }

  return user;
};

export const getPatientByUserId = async (userId: string): Promise<Patient | null> => {
  const { data, error } = await supabase
    .from('patients')
    .select(`
      *,
      users!inner(
        first_name,
        last_name,
        email,
        phone,
        avatar_url
      )
    `)
    .eq('user_id', userId)
    .single();
  
  if (error) return null;
  
  // Flatten the user data
  return {
    ...data,
    first_name: data.users?.first_name,
    last_name: data.users?.last_name,
    email: data.users?.email,
    phone: data.users?.phone,
    avatar_url: data.users?.avatar_url,
    users: undefined
  };
};

export const getCaregiverByUserId = async (userId: string): Promise<Caregiver | null> => {
  const { data, error } = await supabase
    .from('caregivers')
    .select(`
      *,
      users!inner(
        first_name,
        last_name,
        email,
        phone,
        avatar_url
      )
    `)
    .eq('user_id', userId)
    .single();
  
  if (error) return null;
  
  // Flatten the user data
  return {
    ...data,
    first_name: data.users?.first_name,
    last_name: data.users?.last_name,
    email: data.users?.email,
    phone: data.users?.phone,
    avatar_url: data.users?.avatar_url,
    users: undefined
  };
};

export const searchCaregivers = async (
  query?: string,
  lat?: number,
  lon?: number,
  type?: string,
  limit: number = 10
): Promise<Caregiver[]> => {
  try {
    let queryBuilder = supabase
      .from('caregivers')
      .select(`
        *,
        users!inner(
          first_name,
          last_name,
          email,
          phone,
          avatar_url
        )
      `)
      .eq('is_active', true)
      .eq('is_verified', true);

    if (type) {
      queryBuilder = queryBuilder.eq('type', type);
    }

    if (query) {
      // Clean query for specializations (remove spaces and special characters)
      const cleanQuery = query.replace(/[^a-zA-Z0-9]/g, '');
      
      // Search in user names and bio (allow spaces), but clean query for specializations
      if (cleanQuery.length > 0) {
        queryBuilder = queryBuilder.or(
          `users.first_name.ilike.%${query}%,users.last_name.ilike.%${query}%,bio_en.ilike.%${query}%,bio_hi.ilike.%${query}%,specializations.cs.{${cleanQuery}}`
        );
      } else {
        // If no valid characters for specialization search, just search names and bio
        queryBuilder = queryBuilder.or(
          `users.first_name.ilike.%${query}%,users.last_name.ilike.%${query}%,bio_en.ilike.%${query}%,bio_hi.ilike.%${query}%`
        );
      }
    }

    queryBuilder = queryBuilder
      .order('rating', { ascending: false })
      .limit(limit);

    const { data, error } = await queryBuilder;
    
    if (error) {
      console.error('Search caregivers error:', error);
      throw error;
    }
    
    // Flatten the user data into the caregiver object
    const flattenedData = data?.map(caregiver => ({
      ...caregiver,
      first_name: caregiver.users?.first_name,
      last_name: caregiver.users?.last_name,
      email: caregiver.users?.email,
      phone: caregiver.users?.phone,
      avatar_url: caregiver.users?.avatar_url,
      users: undefined // Remove the nested users object
    })) || [];
    
    return flattenedData;
  } catch (error) {
    console.error('Search caregivers function error:', error);
    return []; // Return empty array instead of throwing
  }
};

// Enhanced search function for AI-powered matching
export const searchCaregiversEnhanced = async (
  query: string,
  medicalInfo: any,
  lat?: number,
  lon?: number,
  limit: number = 10
): Promise<Caregiver[]> => {
  try {
    let queryBuilder = supabase
      .from('caregivers')
      .select(`
        *,
        users!inner(
          first_name,
          last_name,
          email,
          phone,
          avatar_url
        )
      `)
      .eq('is_active', true)
      .eq('is_verified', true);

    // Filter by caregiver type if specified
    if (medicalInfo.caregiver_type && medicalInfo.caregiver_type !== 'doctor') {
      queryBuilder = queryBuilder.eq('type', medicalInfo.caregiver_type);
    }

    // Enhanced specialization matching
    if (medicalInfo.specializations && medicalInfo.specializations.length > 0) {
      // Create OR conditions for each specialization
      const specializationConditions = medicalInfo.specializations
        .map((spec: string) => `specializations.cs.{${spec}}`)
        .join(',');
      
      queryBuilder = queryBuilder.or(specializationConditions);
    } else if (query) {
      // Fallback to text search if no specializations found
      const cleanQuery = query.replace(/[^a-zA-Z0-9]/g, '');
      
      if (cleanQuery.length > 0) {
        queryBuilder = queryBuilder.or(
          `users.first_name.ilike.%${query}%,users.last_name.ilike.%${query}%,bio_en.ilike.%${query}%,bio_hi.ilike.%${query}%,specializations.cs.{${cleanQuery}}`
        );
      } else {
        queryBuilder = queryBuilder.or(
          `users.first_name.ilike.%${query}%,users.last_name.ilike.%${query}%,bio_en.ilike.%${query}%,bio_hi.ilike.%${query}%`
        );
      }
    }

    // Order by rating and experience for better results
    queryBuilder = queryBuilder
      .order('rating', { ascending: false })
      .order('experience_years', { ascending: false })
      .limit(limit);

    const { data, error } = await queryBuilder;
    
    if (error) {
      console.error('Enhanced search error:', error);
      // Fallback to basic search
      return await searchCaregivers(query, lat, lon, medicalInfo.caregiver_type, limit);
    }
    
    // Flatten the user data into the caregiver object
    const flattenedData = data?.map(caregiver => ({
      ...caregiver,
      first_name: caregiver.users?.first_name,
      last_name: caregiver.users?.last_name,
      email: caregiver.users?.email,
      phone: caregiver.users?.phone,
      avatar_url: caregiver.users?.avatar_url,
      users: undefined // Remove the nested users object
    })) || [];
    
    return flattenedData;
  } catch (error) {
    console.error('Enhanced search function error:', error);
    // Fallback to basic search
    return await searchCaregivers(query, lat, lon, medicalInfo.caregiver_type, limit);
  }
};

// Function to get caregivers by specialization (for direct matching)
export const getCaregiversBySpecialization = async (
  specializations: string[],
  lat?: number,
  lon?: number,
  limit: number = 10
): Promise<Caregiver[]> => {
  try {
    let queryBuilder = supabase
      .from('caregivers')
      .select(`
        *,
        users!inner(
          first_name,
          last_name,
          email,
          phone,
          avatar_url
        )
      `)
      .eq('is_active', true)
      .eq('is_verified', true);

    // Match any of the specializations
    if (specializations.length > 0) {
      const conditions = specializations
        .map(spec => `specializations.cs.{${spec}}`)
        .join(',');
      queryBuilder = queryBuilder.or(conditions);
    }

    queryBuilder = queryBuilder
      .order('rating', { ascending: false })
      .limit(limit);

    const { data, error } = await queryBuilder;
    
    if (error) {
      console.error('Specialization search error:', error);
      return [];
    }
    
    // Flatten the user data
    const flattenedData = data?.map(caregiver => ({
      ...caregiver,
      first_name: caregiver.users?.first_name,
      last_name: caregiver.users?.last_name,
      email: caregiver.users?.email,
      phone: caregiver.users?.phone,
      avatar_url: caregiver.users?.avatar_url,
      users: undefined
    })) || [];
    
    return flattenedData;
  } catch (error) {
    console.error('Specialization search function error:', error);
    return [];
  }
};