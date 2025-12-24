import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'Email parameter is required'
      }, { status: 400 });
    }

    console.log('Fetching profile for email:', email);

    // 1. Fetch user by email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (userError || !user) {
      console.error('User not found:', userError);
      return NextResponse.json({
        success: false,
        error: 'User not found',
        details: userError
      }, { status: 404 });
    }

    console.log('Found user:', user);

    // 2. Fetch patient data if user is a patient
    let patient = null;
    if (user.role === 'patient') {
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (patientError) {
        console.error('Patient data error:', patientError);
      } else {
        patient = patientData;
        console.log('Found patient data:', patient);
      }
    }

    // 3. Fetch appointments with caregiver details
    let appointments = [];
    if (patient) {
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          *,
          caregivers (
            first_name,
            last_name,
            specializations,
            type
          )
        `)
        .eq('patient_id', patient.id)
        .order('start_time', { ascending: false })
        .limit(10);

      if (appointmentsError) {
        console.error('Appointments error:', appointmentsError);
      } else {
        appointments = appointmentsData || [];
        console.log('Found appointments:', appointments.length);
      }
    }

    // 4. Fetch prescriptions
    let prescriptions = [];
    if (patient) {
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
        .eq('patient_id', patient.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (prescriptionsError) {
        console.error('Prescriptions error:', prescriptionsError);
      } else {
        prescriptions = prescriptionsData || [];
        console.log('Found prescriptions:', prescriptions.length);
      }
    }

    // 5. Fetch progress tracking
    let progressTracking = [];
    if (patient) {
      const { data: progressData, error: progressError } = await supabase
        .from('progress_tracking')
        .select('*')
        .eq('patient_id', patient.id)
        .order('date', { ascending: false })
        .limit(10);

      if (progressError) {
        console.error('Progress tracking error:', progressError);
      } else {
        progressTracking = progressData || [];
        console.log('Found progress tracking:', progressTracking.length);
      }
    }

    // 6. Fetch finance logs
    const { data: financeLogs, error: financeError } = await supabase
      .from('finance_log')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (financeError) {
      console.error('Finance logs error:', financeError);
    }

    // 7. Transform appointments data
    const transformedAppointments = appointments.map(apt => ({
      id: apt.id,
      mode: apt.mode,
      status: apt.status,
      start_time: apt.start_time,
      end_time: apt.end_time,
      symptoms: apt.symptoms || [],
      payment_amount: parseFloat(apt.payment_amount || '0'),
      payment_status: apt.payment_status,
      caregiver_name: apt.caregivers 
        ? `${apt.caregivers.first_name || ''} ${apt.caregivers.last_name || ''}`.trim()
        : 'Unknown Caregiver',
      caregiver_specializations: apt.caregivers?.specializations || [],
      created_at: apt.created_at
    }));

    // 8. Transform prescriptions data
    const transformedPrescriptions = prescriptions.map(presc => ({
      id: presc.id,
      items: Array.isArray(presc.items) ? presc.items : [],
      is_approved: presc.is_approved,
      created_at: presc.created_at,
      caregiver_name: presc.appointments?.caregivers
        ? `${presc.appointments.caregivers.first_name || ''} ${presc.appointments.caregivers.last_name || ''}`.trim()
        : 'Unknown Caregiver'
    }));

    // 9. Transform progress tracking data
    const transformedProgress = progressTracking.map(prog => ({
      id: prog.id,
      checklist_type: prog.checklist_type,
      checklist_items: Array.isArray(prog.checklist_items) ? prog.checklist_items : [],
      completion_percentage: prog.completion_percentage || 0,
      date: prog.date,
      created_at: prog.created_at
    }));

    // 10. Transform finance logs
    const transformedFinance = (financeLogs || []).map(log => ({
      id: log.id,
      transaction_type: log.transaction_type,
      amount: parseFloat(log.amount || '0'),
      currency: log.currency || 'INR',
      status: log.status,
      description: log.description,
      created_at: log.created_at
    }));

    // 11. Calculate statistics
    const stats = {
      totalAppointments: transformedAppointments.length,
      completedAppointments: transformedAppointments.filter(apt => apt.status === 'completed').length,
      totalSpent: transformedFinance
        .filter(log => log.transaction_type === 'payment' && log.status === 'completed')
        .reduce((sum, log) => sum + log.amount, 0),
      activePrescriptions: transformedPrescriptions.filter(presc => presc.is_approved).length,
      progressCompletion: transformedProgress.length > 0
        ? Math.round(transformedProgress.reduce((sum, prog) => sum + prog.completion_percentage, 0) / transformedProgress.length)
        : 0
    };

    const profileData = {
      user: {
        id: user.id,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        created_at: user.created_at
      },
      patient: patient ? {
        id: patient.id,
        date_of_birth: patient.date_of_birth,
        gender: patient.gender,
        blood_group: patient.blood_group,
        allergies: patient.allergies || [],
        current_medications: patient.current_medications || [],
        emergency_contact_name: patient.emergency_contact_name || '',
        emergency_contact_phone: patient.emergency_contact_phone || ''
      } : null,
      appointments: transformedAppointments,
      prescriptions: transformedPrescriptions,
      progressTracking: transformedProgress,
      financeLogs: transformedFinance,
      stats
    };

    return NextResponse.json({
      success: true,
      data: profileData,
      message: `Profile data loaded for ${email}`
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