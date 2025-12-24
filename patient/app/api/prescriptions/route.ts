import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get patient ID from the user
    const { data: patientData, error: patientError } = await supabase
      .from('patients')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (patientError || !patientData) {
      return NextResponse.json(
        { success: false, error: 'Patient profile not found' },
        { status: 404 }
      );
    }

    // Fetch prescriptions with caregiver details
    const { data: prescriptions, error: prescriptionsError } = await supabase
      .from('prescriptions')
      .select(`
        *,
        appointments!inner(
          caregivers!inner(
            first_name,
            last_name,
            specializations
          )
        )
      `)
      .eq('patient_id', patientData.id)
      .order('created_at', { ascending: false });

    if (prescriptionsError) {
      console.error('Error fetching prescriptions:', prescriptionsError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch prescriptions' },
        { status: 500 }
      );
    }

    // Transform the data to include caregiver information
    const transformedPrescriptions = prescriptions?.map(prescription => ({
      id: prescription.id,
      patient_id: prescription.patient_id,
      items: Array.isArray(prescription.items) ? prescription.items : [],
      is_approved: prescription.is_approved,
      created_at: prescription.created_at,
      caregiver_name: prescription.appointments?.caregivers 
        ? `${prescription.appointments.caregivers.first_name} ${prescription.appointments.caregivers.last_name}`
        : 'Unknown Doctor',
      caregiver_specializations: prescription.appointments?.caregivers?.specializations || []
    })) || [];

    return NextResponse.json({
      success: true,
      data: transformedPrescriptions,
      count: transformedPrescriptions.length
    });

  } catch (error) {
    console.error('Prescriptions API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { patient_id, items, appointment_id } = body;

    // Validate required fields
    if (!patient_id || !items || !Array.isArray(items)) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: patient_id, items' },
        { status: 400 }
      );
    }

    // Create new prescription
    const { data: prescription, error: prescriptionError } = await supabase
      .from('prescriptions')
      .insert({
        patient_id,
        items,
        is_approved: false, // Default to pending approval
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (prescriptionError) {
      console.error('Error creating prescription:', prescriptionError);
      return NextResponse.json(
        { success: false, error: 'Failed to create prescription' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: prescription,
      message: 'Prescription created successfully'
    });

  } catch (error) {
    console.error('Create prescription API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}