import { createClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    console.log('Fetching profile data from API...');
    
    // Get the first patient user
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'patient')
      .limit(1)
      .single();

    if (userError || !userData) {
      return NextResponse.json({
        success: false,
        error: 'No patient user found',
        details: userError
      }, { status: 404 });
    }

    // Get patient record
    const { data: patientData, error: patientError } = await supabase
      .from('patients')
      .select('*')
      .eq('user_id', userData.id)
      .single();

    // Get appointments with caregiver details
    const { data: appointmentsData, error: appointmentsError } = await supabase
      .from('appointments')
      .select(`
        *,
        caregivers (
          first_name,
          last_name,
          specializations
        )
      `)
      .order('start_time', { ascending: false })
      .limit(10);

    // Get prescriptions with appointment and caregiver details
    const { data: prescriptionsData, error: prescriptionsError } = await supabase
      .from('prescriptions')
      .select(`
        *,
        appointments (
          start_time,
          caregivers (
            first_name,
            last_name
          )
        )
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    // Get progress tracking
    const { data: progressData, error: progressError } = await supabase
      .from('progress_tracking')
      .select('*')
      .order('date', { ascending: false })
      .limit(10);

    // Get finance logs
    const { data: financeData, error: financeError } = await supabase
      .from('finance_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    // Calculate stats
    const totalAppointments = appointmentsData?.length || 0;
    const completedAppointments = appointmentsData?.filter(apt => apt.status === 'completed').length || 0;
    const totalSpent = financeData?.filter(log => log.transaction_type === 'payment' && log.status === 'completed')
      .reduce((sum, log) => sum + Number(log.amount), 0) || 0;
    const activePrescriptions = prescriptionsData?.filter(presc => presc.is_approved).length || 0;
    const avgProgress = progressData?.length > 0 
      ? progressData.reduce((sum, prog) => sum + Number(prog.completion_percentage), 0) / progressData.length 
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        user: userData,
        patient: patientData,
        appointments: appointmentsData || [],
        prescriptions: prescriptionsData || [],
        progressTracking: progressData || [],
        financeLogs: financeData || [],
        stats: {
          totalAppointments,
          completedAppointments,
          totalSpent,
          activePrescriptions,
          progressCompletion: Math.round(avgProgress)
        }
      },
      errors: {
        userError,
        patientError,
        appointmentsError,
        prescriptionsError,
        progressError,
        financeError
      }
    });

  } catch (error) {
    console.error('Profile data API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch profile data',
      details: String(error)
    }, { status: 500 });
  }
}