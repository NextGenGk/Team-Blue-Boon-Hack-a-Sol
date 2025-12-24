import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    
    // Get authenticated user
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
        error: 'Authentication required'
      }, { status: 401 });
    }

    console.log('Ensuring user exists for:', authUser.email);

    // Use service role to create user
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

    // Step 1: Check if user exists by auth_id
    let { data: existingUser, error: checkError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('auth_id', authUser.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking user:', checkError);
      return NextResponse.json({
        success: false,
        error: 'Database error checking user',
        details: checkError.message
      }, { status: 500 });
    }

    if (existingUser) {
      console.log('User already exists:', existingUser.email);
      
      // Make sure patient record exists
      const { data: patient, error: patientError } = await supabaseAdmin
        .from('patients')
        .select('id')
        .eq('user_id', existingUser.id)
        .single();

      if (patientError && patientError.code === 'PGRST116') {
        // Create patient record
        const { error: createPatientError } = await supabaseAdmin
          .from('patients')
          .insert({
            user_id: existingUser.id,
            allergies: [],
            current_medications: []
          });

        if (createPatientError) {
          console.error('Error creating patient record:', createPatientError);
        } else {
          console.log('Patient record created for existing user');
        }
      }

      return NextResponse.json({
        success: true,
        message: 'User already exists',
        user: existingUser
      });
    }

    // Step 2: Check if user exists by email (in case auth_id is missing)
    const { data: userByEmail, error: emailError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', authUser.email)
      .single();

    if (!emailError && userByEmail) {
      console.log('User exists by email, updating auth_id');
      
      // Update the auth_id
      const { data: updatedUser, error: updateError } = await supabaseAdmin
        .from('users')
        .update({ auth_id: authUser.id })
        .eq('id', userByEmail.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating auth_id:', updateError);
        return NextResponse.json({
          success: false,
          error: 'Failed to update user auth_id',
          details: updateError.message
        }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'User updated with auth_id',
        user: updatedUser
      });
    }

    // Step 3: Create new user
    console.log('Creating new user...');
    
    const userData = {
      auth_id: authUser.id,
      email: authUser.email,
      first_name: authUser.user_metadata?.first_name || authUser.email?.split('@')[0] || '',
      last_name: authUser.user_metadata?.last_name || '',
      phone: authUser.user_metadata?.phone || authUser.phone || '',
      role: 'patient' as const
    };

    console.log('User data to insert:', userData);

    const { data: newUser, error: createError } = await supabaseAdmin
      .from('users')
      .insert(userData)
      .select()
      .single();

    if (createError) {
      console.error('Error creating user:', createError);
      
      // Check if it's a constraint violation
      if (createError.code === '23505') {
        // Try to find the existing user again
        const { data: conflictUser } = await supabaseAdmin
          .from('users')
          .select('*')
          .or(`email.eq.${authUser.email},auth_id.eq.${authUser.id}`)
          .single();
        
        if (conflictUser) {
          return NextResponse.json({
            success: true,
            message: 'User already exists (found after conflict)',
            user: conflictUser
          });
        }
      }
      
      return NextResponse.json({
        success: false,
        error: 'Failed to create user',
        details: createError.message,
        code: createError.code
      }, { status: 500 });
    }

    console.log('User created successfully:', newUser.email);

    // Step 4: Create patient record
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
      // Don't fail the whole operation if patient creation fails
    } else {
      console.log('Patient record created:', newPatient.id);
    }

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: newUser,
      patient: newPatient
    });

  } catch (error) {
    console.error('Ensure user error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}