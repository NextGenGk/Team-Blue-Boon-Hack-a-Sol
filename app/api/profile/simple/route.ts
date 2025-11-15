import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // Create Supabase client with server-side auth
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    // Get authenticated user
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authUser) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required',
        details: 'Please sign in to access profile data'
      }, { status: 401 });
    }

    console.log('Authenticated user:', authUser.email);

    // Use service role key for database operations to bypass RLS temporarily
    const supabaseAdmin = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    // Check if user exists by auth_id first, then by email
    let user = null;
    let userError = null;

    // First try to find by auth_id
    const { data: userByAuthId, error: authIdError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('auth_id', authUser.id)
      .single();

    if (!authIdError && userByAuthId) {
      user = userByAuthId;
    } else {
      // Try to find by email
      const { data: userByEmail, error: emailError } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('email', authUser.email)
        .single();

      if (!emailError && userByEmail) {
        // User exists but auth_id is not set, update it
        const { data: updatedUser, error: updateError } = await supabaseAdmin
          .from('users')
          .update({ auth_id: authUser.id })
          .eq('id', userByEmail.id)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating user auth_id:', updateError);
          userError = updateError;
        } else {
          user = updatedUser;
        }
      } else {
        userError = emailError;
      }
    }

    if (userError || !user) {
      console.log('User not found in database, creating user record...');
      
      // Create user record if it doesn't exist
      const { data: newUser, error: createError } = await supabaseAdmin
        .from('users')
        .insert({
          auth_id: authUser.id,
          email: authUser.email,
          first_name: authUser.user_metadata?.first_name || authUser.email?.split('@')[0] || '',
          last_name: authUser.user_metadata?.last_name || '',
          phone: authUser.user_metadata?.phone || authUser.phone || '',
          role: 'patient'
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating user:', createError);
        
        // If it's a unique constraint violation, try to find the existing user
        if (createError.code === '23505') {
          const { data: existingUser } = await supabaseAdmin
            .from('users')
            .select('*')
            .or(`email.eq.${authUser.email},auth_id.eq.${authUser.id}`)
            .single();
          
          if (existingUser) {
            user = existingUser;
          } else {
            return NextResponse.json({
              success: false,
              error: 'User already exists but could not be retrieved',
              details: createError.message
            }, { status: 409 });
          }
        } else {
          return NextResponse.json({
            success: false,
            error: 'Failed to create user profile',
            details: createError.message
          }, { status: 500 });
        }
      } else {
        user = newUser;
      }

      // Create patient record for new user
      const { data: newPatient, error: patientError } = await supabaseAdmin
        .from('patients')
        .insert({
          user_id: user.id,
          allergies: [],
          current_medications: []
        })
        .select()
        .single();

      if (patientError) {
        console.error('Error creating patient record:', patientError);
      }

      // Return minimal profile for new user
      return NextResponse.json({
        success: true,
        data: {
          user: {
            id: user.id,
            first_name: user.first_name || '',
            last_name: user.last_name || '',
            email: user.email,
            phone: user.phone || '',
            role: user.role,
            created_at: user.created_at
          },
          patient: newPatient || null,
          appointments: [],
          prescriptions: [],
          progressTracking: [],
          financeLogs: [],
          stats: {
            totalAppointments: 0,
            completedAppointments: 0,
            totalSpent: 0,
            activePrescriptions: 0,
            progressCompletion: 0
          }
        },
        message: `New user profile created for ${authUser.email}`,
        isSimulated: false
      });
    }

    console.log('User found, fetching real data...');

    // Fetch patient data if user is a patient
    let patient = null;
    if (user.role === 'patient') {
      const { data: patientData, error: patientError } = await supabaseAdmin
        .from('patients')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!patientError && patientData) {
        patient = patientData;
      } else if (patientError && patientError.code === 'PGRST116') {
        // Patient record doesn't exist, create one
        const { data: newPatient, error: createPatientError } = await supabaseAdmin
          .from('patients')
          .insert({
            user_id: user.id,
            allergies: [],
            current_medications: []
          })
          .select()
          .single();

        if (!createPatientError) {
          patient = newPatient;
        }
      }
    }

    // Fetch appointments
    let appointments = [];
    if (patient) {
      const { data: appointmentsData, error: appointmentsError } = await supabaseAdmin
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

      if (!appointmentsError && appointmentsData) {
        appointments = appointmentsData;
      }
    }

    // Fetch prescriptions
    let prescriptions = [];
    if (patient) {
      const { data: prescriptionsData, error: prescriptionsError } = await supabaseAdmin
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

      if (!prescriptionsError && prescriptionsData) {
        prescriptions = prescriptionsData;
      }
    }

    // Fetch progress tracking
    let progressTracking = [];
    if (patient) {
      const { data: progressData, error: progressError } = await supabaseAdmin
        .from('progress_tracking')
        .select('*')
        .eq('patient_id', patient.id)
        .order('date', { ascending: false })
        .limit(10);

      if (!progressError && progressData) {
        progressTracking = progressData;
      }
    }

    // Fetch finance logs
    const { data: financeLogs, error: financeError } = await supabaseAdmin
      .from('finance_log')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    // Transform and calculate stats
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

    const transformedPrescriptions = prescriptions.map(presc => ({
      id: presc.id,
      items: Array.isArray(presc.items) ? presc.items : [],
      is_approved: presc.is_approved,
      created_at: presc.created_at,
      caregiver_name: presc.appointments?.caregivers
        ? `${presc.appointments.caregivers.first_name || ''} ${presc.appointments.caregivers.last_name || ''}`.trim()
        : 'Unknown Caregiver'
    }));

    const transformedProgress = progressTracking.map(prog => ({
      id: prog.id,
      checklist_type: prog.checklist_type,
      checklist_items: Array.isArray(prog.checklist_items) ? prog.checklist_items : [],
      completion_percentage: prog.completion_percentage || 0,
      date: prog.date,
      created_at: prog.created_at
    }));

    const transformedFinance = (financeLogs || []).map(log => ({
      id: log.id,
      transaction_type: log.transaction_type,
      amount: parseFloat(log.amount || '0'),
      currency: log.currency || 'INR',
      status: log.status,
      description: log.description,
      created_at: log.created_at
    }));

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
      message: `Profile data loaded for ${authUser.email}`,
      isSimulated: false
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