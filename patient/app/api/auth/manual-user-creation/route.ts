import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    
    // Get authenticated user from Supabase Auth
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

    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authUser) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated',
        details: 'Please sign in first'
      }, { status: 401 });
    }

    console.log('Manual user creation for:', authUser.email);
    console.log('Auth user data:', {
      id: authUser.id,
      email: authUser.email,
      provider: authUser.app_metadata?.provider,
      metadata: authUser.user_metadata
    });

    // Use service role for direct database access
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

    // Step 1: Check if user already exists
    console.log('Checking if user exists...');
    
    const { data: existingUsers, error: checkError } = await supabaseAdmin
      .from('users')
      .select('*')
      .or(`auth_id.eq.${authUser.id},email.eq.${authUser.email}`);

    if (checkError) {
      console.error('Error checking existing users:', checkError);
      return NextResponse.json({
        success: false,
        error: 'Database check failed',
        details: checkError.message
      }, { status: 500 });
    }

    if (existingUsers && existingUsers.length > 0) {
      const existingUser = existingUsers[0];
      console.log('User already exists:', existingUser.email);
      
      // Update auth_id if missing
      if (!existingUser.auth_id) {
        console.log('Updating missing auth_id...');
        const { error: updateError } = await supabaseAdmin
          .from('users')
          .update({ auth_id: authUser.id })
          .eq('id', existingUser.id);
        
        if (updateError) {
          console.error('Error updating auth_id:', updateError);
        }
      }

      // Ensure patient record exists
      const { data: patient, error: patientCheckError } = await supabaseAdmin
        .from('patients')
        .select('id')
        .eq('user_id', existingUser.id)
        .single();

      if (patientCheckError && patientCheckError.code === 'PGRST116') {
        console.log('Creating missing patient record...');
        const { error: createPatientError } = await supabaseAdmin
          .from('patients')
          .insert({
            user_id: existingUser.id,
            allergies: [],
            current_medications: []
          });
        
        if (createPatientError) {
          console.error('Error creating patient record:', createPatientError);
        }
      }

      return NextResponse.json({
        success: true,
        message: 'User already exists',
        user: existingUser,
        wasExisting: true
      });
    }

    // Step 2: Create new user
    console.log('Creating new user...');
    
    const userData = {
      auth_id: authUser.id,
      email: authUser.email,
      first_name: authUser.user_metadata?.first_name || 
                  authUser.user_metadata?.given_name || 
                  authUser.email?.split('@')[0] || '',
      last_name: authUser.user_metadata?.last_name || 
                 authUser.user_metadata?.family_name || '',
      phone: authUser.user_metadata?.phone || authUser.phone || '',
      role: 'patient',
      image_url: authUser.user_metadata?.avatar_url || 
                 authUser.user_metadata?.picture || null
    };

    console.log('Inserting user data:', userData);

    const { data: newUser, error: createError } = await supabaseAdmin
      .from('users')
      .insert(userData)
      .select()
      .single();

    if (createError) {
      console.error('Error creating user:', createError);
      
      // Try one more time to find existing user (race condition)
      const { data: raceUser } = await supabaseAdmin
        .from('users')
        .select('*')
        .or(`auth_id.eq.${authUser.id},email.eq.${authUser.email}`)
        .single();
      
      if (raceUser) {
        console.log('Found user after race condition:', raceUser.email);
        return NextResponse.json({
          success: true,
          message: 'User found after race condition',
          user: raceUser,
          wasExisting: true
        });
      }
      
      return NextResponse.json({
        success: false,
        error: 'Failed to create user',
        details: createError.message,
        code: createError.code
      }, { status: 500 });
    }

    console.log('User created successfully:', newUser.email);

    // Step 3: Create patient record
    console.log('Creating patient record...');
    
    const { data: newPatient, error: patientError } = await supabaseAdmin
      .from('patients')
      .insert({
        user_id: newUser.id,
        allergies: [],
        current_medications: []
      })
      .select()
      .single();

    if (patientError) {
      console.error('Error creating patient record:', patientError);
      // Don't fail the whole operation
    } else {
      console.log('Patient record created:', newPatient.id);
    }

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: newUser,
      patient: newPatient,
      wasExisting: false
    });

  } catch (error) {
    console.error('Manual user creation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}