import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    // Check if we're in development mode
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'This endpoint is only available in development' }, { status: 403 });
    }

    // First, create sample users
    const sampleUsers = [
      {
        email: 'dr.rajesh@demo.com',
        first_name: 'Dr. Rajesh',
        last_name: 'Sharma',
        role: 'caregiver'
      },
      {
        email: 'priya.nurse@demo.com',
        first_name: 'Priya',
        last_name: 'Patel',
        role: 'caregiver'
      },
      {
        email: 'dr.amit@demo.com',
        first_name: 'Dr. Amit',
        last_name: 'Singh',
        role: 'caregiver'
      },
      {
        email: 'sunita.therapist@demo.com',
        first_name: 'Sunita',
        last_name: 'Kumar',
        role: 'caregiver'
      },
      {
        email: 'dr.maya@demo.com',
        first_name: 'Dr. Maya',
        last_name: 'Joshi',
        role: 'caregiver'
      }
    ];

    // Insert users first
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert(sampleUsers)
      .select();

    if (userError) {
      console.error('Error inserting users:', userError);
      return NextResponse.json({ error: userError.message }, { status: 500 });
    }

    // Sample caregiver data
    const sampleCaregivers = [
      {
        user_id: userData[0].id,
        type: 'doctor',
        specializations: ['Cardiology', 'Internal Medicine', 'Hypertension'],
        qualifications: ['MBBS', 'MD Cardiology'],
        experience_years: 15,
        bio_en: 'Experienced cardiologist specializing in heart diseases and hypertension management.',
        bio_hi: 'हृदय रोग और उच्च रक्तचाप प्रबंधन में विशेषज्ञ अनुभवी हृदय रोग विशेषज्ञ।',
        license_number: 'MH/DOC/12345',
        rating: 4.8,
        total_reviews: 156,
        consultation_fee: 800,
        home_visit_fee: 1200,
        available_for_home_visits: true,
        available_for_online: true,
        latitude: 19.0760,
        longitude: 72.8777,
        service_radius_km: 25,
        is_verified: true,
        is_active: true
      },
      {
        user_id: userData[1].id,
        type: 'nurse',
        specializations: ['Critical Care', 'Pediatric Care', 'Home Nursing'],
        qualifications: ['BSc Nursing', 'Critical Care Certification'],
        experience_years: 8,
        bio_en: 'Dedicated nurse with expertise in critical care and pediatric nursing.',
        bio_hi: 'गंभीर देखभाल और बाल चिकित्सा नर्सिंग में विशेषज्ञता वाली समर्पित नर्स।',
        license_number: 'MH/NUR/67890',
        rating: 4.6,
        total_reviews: 89,
        consultation_fee: 400,
        home_visit_fee: 600,
        available_for_home_visits: true,
        available_for_online: true,
        latitude: 19.0760,
        longitude: 72.8777,
        service_radius_km: 20,
        is_verified: true,
        is_active: true
      },
      {
        user_id: userData[2].id,
        type: 'doctor',
        specializations: ['Orthopedics', 'Sports Medicine', 'Joint Replacement'],
        qualifications: ['MBBS', 'MS Orthopedics'],
        experience_years: 12,
        bio_en: 'Orthopedic surgeon specializing in joint replacement and sports injuries.',
        bio_hi: 'जोड़ों के प्रतिस्थापन और खेल चोटों में विशेषज्ञ आर्थोपेडिक सर्जन।',
        license_number: 'MH/DOC/54321',
        rating: 4.9,
        total_reviews: 203,
        consultation_fee: 1000,
        home_visit_fee: 1500,
        available_for_home_visits: true,
        available_for_online: true,
        latitude: 19.0760,
        longitude: 72.8777,
        service_radius_km: 30,
        is_verified: true,
        is_active: true
      },
      {
        user_id: userData[3].id,
        type: 'therapist',
        specializations: ['Physiotherapy', 'Rehabilitation', 'Pain Management'],
        qualifications: ['BPT', 'MPT'],
        experience_years: 10,
        bio_en: 'Experienced physiotherapist specializing in rehabilitation and pain management.',
        bio_hi: 'पुनर्वास और दर्द प्रबंधन में विशेषज्ञ अनुभवी फिजियोथेरेपिस्ट।',
        license_number: 'MH/PT/98765',
        rating: 4.7,
        total_reviews: 134,
        consultation_fee: 600,
        home_visit_fee: 800,
        available_for_home_visits: true,
        available_for_online: true,
        latitude: 19.0760,
        longitude: 72.8777,
        service_radius_km: 15,
        is_verified: true,
        is_active: true
      },
      {
        user_id: userData[4].id,
        type: 'doctor',
        specializations: ['Pediatrics', 'Child Development', 'Vaccination'],
        qualifications: ['MBBS', 'MD Pediatrics'],
        experience_years: 7,
        bio_en: 'Pediatrician specializing in child healthcare and development.',
        bio_hi: 'बाल स्वास्थ्य देखभाल और विकास में विशेषज्ञ बाल रोग विशेषज्ञ।',
        license_number: 'MH/DOC/22222',
        rating: 4.8,
        total_reviews: 92,
        consultation_fee: 600,
        home_visit_fee: 900,
        available_for_home_visits: true,
        available_for_online: true,
        latitude: 19.1136,
        longitude: 72.8697,
        service_radius_km: 25,
        is_verified: true,
        is_active: true
      }
    ];

    // Insert sample caregivers
    const { data: caregiverData, error } = await supabase
      .from('caregivers')
      .insert(sampleCaregivers)
      .select();

    if (error) {
      console.error('Error inserting demo data:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Demo data inserted successfully',
      users_inserted: userData?.length || 0,
      caregivers_inserted: caregiverData?.length || 0,
      users: userData,
      caregivers: caregiverData
    });

  } catch (error) {
    console.error('Seed demo data error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}