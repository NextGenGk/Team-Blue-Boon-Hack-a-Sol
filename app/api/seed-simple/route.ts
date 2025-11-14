import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Admin client not configured. Please set SUPABASE_SERVICE_ROLE_KEY' },
        { status: 500 }
      );
    }

    // Clear existing data first
    await supabaseAdmin.from('caregivers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('centers').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Insert centers first
    const { data: centersData, error: centersError } = await supabaseAdmin
      .from('centers')
      .insert([
        {
          name: 'AIIMS Delhi',
          address: 'Ansari Nagar, New Delhi',
          latitude: 28.5672,
          longitude: 77.2100,
          contact_phone: '+91-11-26588500'
        },
        {
          name: 'Apollo Hospital Mumbai',
          address: 'Tardeo, Mumbai',
          latitude: 19.0176,
          longitude: 72.8562,
          contact_phone: '+91-22-26925858'
        }
      ])
      .select();

    if (centersError) {
      throw new Error(`Centers insert failed: ${centersError.message}`);
    }

    // Insert users
    const { data: usersData, error: usersError } = await supabaseAdmin
      .from('users')
      .insert([
        {
          email: 'dr.rajesh.cardio@hospital.com',
          first_name: 'Dr. Rajesh',
          last_name: 'Sharma',
          role: 'caregiver'
        },
        {
          email: 'dr.priya.neuro@hospital.com',
          first_name: 'Dr. Priya',
          last_name: 'Patel',
          role: 'caregiver'
        },
        {
          email: 'dr.amit.ortho@hospital.com',
          first_name: 'Dr. Amit',
          last_name: 'Singh',
          role: 'caregiver'
        },
        {
          email: 'patient.john@email.com',
          first_name: 'John',
          last_name: 'Doe',
          role: 'patient'
        }
      ])
      .select();

    if (usersError) {
      throw new Error(`Users insert failed: ${usersError.message}`);
    }

    // Insert caregivers
    const { data: caregiversData, error: caregiversError } = await supabaseAdmin
      .from('caregivers')
      .insert([
        {
          user_id: usersData.find(u => u.email === 'dr.rajesh.cardio@hospital.com')?.id,
          type: 'doctor',
          specializations: ['Cardiology', 'Heart Disease', 'Hypertension', 'Chest Pain', 'Heart Attack'],
          qualifications: ['MBBS', 'MD Cardiology'],
          experience_years: 15,
          languages: ['en', 'hi'],
          bio_en: 'Experienced cardiologist specializing in heart diseases, chest pain, and cardiac emergencies.',
          bio_hi: 'हृदय रोग, सीने में दर्द और हृदय आपातकाल में विशेषज्ञ।',
          license_number: 'DL/DOC/CARD/001',
          rating: 4.8,
          total_reviews: 245,
          consultation_fee: 1200.00,
          home_visit_fee: 1800.00,
          available_for_home_visits: true,
          available_for_online: true,
          latitude: 28.5672,
          longitude: 77.2100,
          service_radius_km: 25,
          center_id: centersData.find(c => c.name === 'AIIMS Delhi')?.id,
          is_verified: true,
          is_active: true
        },
        {
          user_id: usersData.find(u => u.email === 'dr.priya.neuro@hospital.com')?.id,
          type: 'doctor',
          specializations: ['Neurology', 'Headache', 'Migraine', 'Stroke', 'Epilepsy'],
          qualifications: ['MBBS', 'DM Neurology'],
          experience_years: 12,
          languages: ['en', 'hi'],
          bio_en: 'Neurologist specializing in headaches, migraines, and neurological disorders.',
          bio_hi: 'सिरदर्द, माइग्रेन और न्यूरोलॉजिकल विकारों में विशेषज्ञ।',
          license_number: 'MH/DOC/NEURO/002',
          rating: 4.9,
          total_reviews: 189,
          consultation_fee: 1000.00,
          home_visit_fee: 1500.00,
          available_for_home_visits: true,
          available_for_online: true,
          latitude: 19.0176,
          longitude: 72.8562,
          service_radius_km: 30,
          center_id: centersData.find(c => c.name === 'Apollo Hospital Mumbai')?.id,
          is_verified: true,
          is_active: true
        },
        {
          user_id: usersData.find(u => u.email === 'dr.amit.ortho@hospital.com')?.id,
          type: 'doctor',
          specializations: ['Orthopedics', 'Bone Fracture', 'Joint Pain', 'Back Pain', 'Knee Pain'],
          qualifications: ['MBBS', 'MS Orthopedics'],
          experience_years: 10,
          languages: ['en', 'hi'],
          bio_en: 'Orthopedic surgeon specializing in bone fractures, joint pain, and sports injuries.',
          bio_hi: 'हड्डी के फ्रैक्चर, जोड़ों के दर्द में विशेषज्ञ।',
          license_number: 'KA/DOC/ORTHO/003',
          rating: 4.7,
          total_reviews: 156,
          consultation_fee: 800.00,
          home_visit_fee: 1200.00,
          available_for_home_visits: true,
          available_for_online: true,
          latitude: 28.5672,
          longitude: 77.2100,
          service_radius_km: 20,
          center_id: centersData.find(c => c.name === 'AIIMS Delhi')?.id,
          is_verified: true,
          is_active: true
        }
      ])
      .select();

    if (caregiversError) {
      throw new Error(`Caregivers insert failed: ${caregiversError.message}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Simple seed data inserted successfully',
      data: {
        centers_inserted: centersData?.length || 0,
        users_inserted: usersData?.length || 0,
        caregivers_inserted: caregiversData?.length || 0
      },
      next_steps: [
        'Test with: curl "http://localhost:3000/api/debug-db"',
        'Test search: curl "http://localhost:3000/api/search?query=headache"',
        'Test basic: curl "http://localhost:3000/api/test-search?query=doctor"'
      ]
    });

  } catch (error) {
    console.error('Seed simple error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}