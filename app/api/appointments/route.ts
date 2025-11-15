import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const mode = searchParams.get('mode');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    console.log('Fetching appointments with filters:', { status, mode, limit, offset });

    // Build the query
    let query = supabase
      .from('appointments')
      .select(`
        *,
        patient:patients!appointments_patient_id_fkey(
          id,
          date_of_birth,
          gender,
          blood_group,
          user:users!patients_user_id_fkey(
            id,
            first_name,
            last_name,
            email,
            phone
          )
        ),
        caregiver:caregivers!appointments_caregiver_id_fkey(
          id,
          first_name,
          last_name,
          type,
          specializations,
          experience_years,
          consultation_fee,
          home_visit_fee,
          user:users!caregivers_user_id_fkey(
            id,
            first_name,
            last_name,
            email,
            phone
          )
        )
      `)
      .order('start_time', { ascending: false });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    if (mode) {
      query = query.eq('mode', mode);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: appointments, error, count } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch appointments',
        details: error
      }, { status: 500 });
    }

    // Transform the data for better UI consumption
    const transformedAppointments = appointments?.map((appointment) => ({
      ...appointment,
      patient_name: appointment.patient?.user 
        ? `${appointment.patient.user.first_name || ''} ${appointment.patient.user.last_name || ''}`.trim()
        : 'Unknown Patient',
      patient_email: appointment.patient?.user?.email || '',
      patient_phone: appointment.patient?.user?.phone || '',
      caregiver_name: appointment.caregiver?.user
        ? `${appointment.caregiver.user.first_name || ''} ${appointment.caregiver.user.last_name || ''}`.trim()
        : `${appointment.caregiver?.first_name || ''} ${appointment.caregiver?.last_name || ''}`.trim() || 'Unknown Caregiver',
      caregiver_email: appointment.caregiver?.user?.email || '',
      caregiver_phone: appointment.caregiver?.user?.phone || '',
      caregiver_type: appointment.caregiver?.type || 'nurse',
      caregiver_specializations: appointment.caregiver?.specializations || [],
      caregiver_experience: appointment.caregiver?.experience_years || 0,
      consultation_fee: appointment.caregiver?.consultation_fee || 0,
      home_visit_fee: appointment.caregiver?.home_visit_fee || 0,
      patient_age: appointment.patient?.date_of_birth 
        ? Math.floor((new Date().getTime() - new Date(appointment.patient.date_of_birth).getTime()) / (1000 * 60 * 60 * 24 * 365))
        : null,
      patient_gender: appointment.patient?.gender || null,
      patient_blood_group: appointment.patient?.blood_group || null
    })) || [];

    // Get total count for pagination
    const { count: totalCount } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      success: true,
      data: transformedAppointments,
      pagination: {
        total: totalCount || 0,
        limit,
        offset,
        hasMore: (offset + limit) < (totalCount || 0)
      },
      filters: { status, mode }
    });

  } catch (error) {
    console.error('Appointments API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}