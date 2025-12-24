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
        error: 'Not authenticated'
      }, { status: 401 });
    }

    console.log('Syncing user to database:', authUser.email);

    // Use service role to create/update user
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

    // Check if user exists by uid (Supabase auth user ID)
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('uid', authUser.id)
      .single();

    if (existingUser) {
      console.log('User already synced:', existingUser.email);

      // Ensure patient record exists
      const { data: patient, error: patientError } = await supabaseAdmin
        .from('patients')
        .select('id')
        .eq('user_id', existingUser.id)
        .single();

      if (patientError && patientError.code === 'PGRST116') {
        // Create patient record
        await supabaseAdmin
          .from('patients')
          .insert({
            user_id: existingUser.id,
            allergies: [],
            current_medications: []
          });
        console.log('Patient record created for existing user');
      }

      return NextResponse.json({
        success: true,
        message: 'User already synced',
        user: existingUser
      });
    }

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking user:', checkError);
      return NextResponse.json({
        success: false,
        error: 'Database error',
        details: checkError.message
      }, { status: 500 });
    }

    // Check if user exists by email
    const { data: userByEmail, error: emailError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', authUser.email)
      .single();

    if (userByEmail) {
      console.log('Updating user with auth_id:', userByEmail.email);

      const { data: updatedUser, error: updateError } = await supabaseAdmin
        .from('users')
        .update({ auth_id: authUser.id })
        .eq('id', userByEmail.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating user:', updateError);
        return NextResponse.json({
          success: false,
          error: 'Failed to update user',
          details: updateError.message
        }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'User synced with auth_id',
        user: updatedUser
      });
    }

    // Create new user
    console.log('Creating new user from auth data...');

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

    console.log('User data to create:', userData);

    const { data: newUser, error: createError } = await supabaseAdmin
      .from('users')
      .insert(userData)
      .select()
      .single();

    if (createError) {
      console.error('Error creating user:', createError);

      if (createError.code === '23505') {
        // Try to find existing user
        const { data: conflictUser } = await supabaseAdmin
          .from('users')
          .select('*')
          .or(`email.eq.${authUser.email},auth_id.eq.${authUser.id}`)
          .single();

        if (conflictUser) {
          return NextResponse.json({
            success: true,
            message: 'User found after conflict',
            user: conflictUser
          });
        }
      }

      return NextResponse.json({
        success: false,
        error: 'Failed to create user',
        details: createError.message
      }, { status: 500 });
    }

    console.log('User created successfully:', newUser.email);

    // Create patient record
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
    } else {
      console.log('Patient record created:', newPatient.id);
    }

    return NextResponse.json({
      success: true,
      message: 'User created and synced',
      user: newUser,
      patient: newPatient
    });

  } catch (error) {
    console.error('Sync user error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}