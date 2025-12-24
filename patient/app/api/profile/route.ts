import { NextRequest, NextResponse } from 'next/server';

// Simple seed data for profile
const PROFILE_SEED_DATA = {
  user: {
    id: 'demo-user-1',
    first_name: 'Priya',
    last_name: 'Sharma',
    email: 'priya.sharma@example.com',
    phone: '+91 9876543210',
    role: 'patient',
    created_at: '2024-01-15T10:30:00Z'
  },
  patient: {
    id: 'demo-patient-1',
    date_of_birth: '1990-05-15',
    gender: 'female',
    blood_group: 'A+',
    allergies: ['Dust', 'Pollen'],
    current_medications: ['Vitamin D3', 'Iron Supplement'],
    emergency_contact_name: 'Raj Sharma',
    emergency_contact_phone: '+91 9876543211'
  },
  appointments: [
    {
      id: 'apt-1',
      mode: 'online',
      status: 'completed',
      start_time: '2024-11-10T14:00:00Z',
      symptoms: ['headache', 'fever'],
      payment_amount: 500,
      payment_status: 'paid',
      caregiver_name: 'Dr. Manju Nair',
      caregiver_specializations: ['General Care', 'Pregnancy Care']
    },
    {
      id: 'apt-2',
      mode: 'home_visit',
      status: 'confirmed',
      start_time: '2024-11-20T10:00:00Z',
      symptoms: ['pregnancy checkup'],
      payment_amount: 800,
      payment_status: 'pending',
      caregiver_name: 'Dr. Priya Kumar',
      caregiver_specializations: ['Pregnancy Care', 'Postnatal Care']
    }
  ],
  prescriptions: [
    {
      id: 'presc-1',
      items: [
        { name: 'Paracetamol', dosage: '500mg', frequency: 'Twice daily', duration: '3 days' },
        { name: 'Vitamin B12', dosage: '1000mcg', frequency: 'Once daily', duration: '30 days' }
      ],
      is_approved: true,
      created_at: '2024-11-10T14:30:00Z',
      caregiver_name: 'Dr. Manju Nair'
    }
  ],
  progressTracking: [
    {
      id: 'prog-1',
      checklist_type: 'medication',
      checklist_items: [
        { item: 'Take morning vitamins', completed: true },
        { item: 'Take evening iron supplement', completed: true },
        { item: 'Drink 8 glasses of water', completed: false }
      ],
      completion_percentage: 67,
      date: '2024-11-15'
    }
  ],
  financeLogs: [
    {
      id: 'fin-1',
      transaction_type: 'payment',
      amount: 500,
      currency: 'INR',
      status: 'completed',
      description: 'Online consultation fee',
      created_at: '2024-11-10T14:00:00Z'
    }
  ]
};

export async function GET(request: NextRequest) {
  try {
    // Return seed data for demo
    return NextResponse.json({
      success: true,
      data: PROFILE_SEED_DATA,
      message: 'Profile data loaded successfully'
    });
  } catch (error) {
    console.error('Profile API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to load profile data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}