import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { cookies } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const prescriptionId = params.id;

    // Fetch specific prescription with caregiver details
    const { data: prescription, error: prescriptionError } = await supabase
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
      .eq('id', prescriptionId)
      .single();

    if (prescriptionError || !prescription) {
      return NextResponse.json(
        { success: false, error: 'Prescription not found' },
        { status: 404 }
      );
    }

    // Transform the data
    const transformedPrescription = {
      id: prescription.id,
      patient_id: prescription.patient_id,
      items: Array.isArray(prescription.items) ? prescription.items : [],
      is_approved: prescription.is_approved,
      created_at: prescription.created_at,
      caregiver_name: prescription.appointments?.caregivers 
        ? `${prescription.appointments.caregivers.first_name} ${prescription.appointments.caregivers.last_name}`
        : 'Unknown Doctor',
      caregiver_specializations: prescription.appointments?.caregivers?.specializations || []
    };

    return NextResponse.json({
      success: true,
      data: transformedPrescription
    });

  } catch (error) {
    console.error('Get prescription API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const prescriptionId = params.id;
    const body = await request.json();
    const { is_approved, items } = body;

    // Build update object
    const updateData: any = {};
    if (typeof is_approved === 'boolean') {
      updateData.is_approved = is_approved;
    }
    if (items && Array.isArray(items)) {
      updateData.items = items;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Update prescription
    const { data: prescription, error: updateError } = await supabase
      .from('prescriptions')
      .update(updateData)
      .eq('id', prescriptionId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating prescription:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update prescription' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: prescription,
      message: 'Prescription updated successfully'
    });

  } catch (error) {
    console.error('Update prescription API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const prescriptionId = params.id;

    // Delete prescription
    const { error: deleteError } = await supabase
      .from('prescriptions')
      .delete()
      .eq('id', prescriptionId);

    if (deleteError) {
      console.error('Error deleting prescription:', deleteError);
      return NextResponse.json(
        { success: false, error: 'Failed to delete prescription' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Prescription deleted successfully'
    });

  } catch (error) {
    console.error('Delete prescription API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}