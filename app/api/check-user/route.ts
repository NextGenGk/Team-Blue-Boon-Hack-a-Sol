import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email') || 'atkola12345@gmail.com';

    console.log('Checking for user:', email);

    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (userError) {
      console.log('User not found, checking all users...');
      
      // Get all users to see what's available
      const { data: allUsers, error: allUsersError } = await supabase
        .from('users')
        .select('id, email, first_name, last_name, role')
        .limit(10);

      return NextResponse.json({
        success: false,
        error: 'User not found',
        details: userError,
        availableUsers: allUsers || [],
        searchedEmail: email
      });
    }

    // If user found, get related data counts
    let patientData = null;
    let appointmentsCount = 0;
    let prescriptionsCount = 0;

    if (user.role === 'patient') {
      // Get patient record
      const { data: patient } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', user.id)
        .single();

      patientData = patient;

      if (patient) {
        // Count appointments
        const { count: aptCount } = await supabase
          .from('appointments')
          .select('*', { count: 'exact', head: true })
          .eq('patient_id', patient.id);

        appointmentsCount = aptCount || 0;

        // Count prescriptions
        const { count: prescCount } = await supabase
          .from('prescriptions')
          .select('*', { count: 'exact', head: true })
          .eq('patient_id', patient.id);

        prescriptionsCount = prescCount || 0;
      }
    }

    return NextResponse.json({
      success: true,
      user,
      patient: patientData,
      counts: {
        appointments: appointmentsCount,
        prescriptions: prescriptionsCount
      }
    });

  } catch (error) {
    console.error('Check user error:', error);
    return NextResponse.json({
      success: false,
      error: 'Database error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}