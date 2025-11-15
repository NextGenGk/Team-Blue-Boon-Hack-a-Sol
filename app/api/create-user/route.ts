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

    console.log('Creating user for:', authUser.email);

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('auth_id', authUser.id)
      .single();

    if (existingUser) {
      return NextResponse.json({
        success: true,
        message: 'User already exists',
        user_id: existingUser.id
      });
    }

    // Create user record
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
      return NextResponse.json({
        success: false,
        error: 'Failed to create user',
        details: createError.message
      }, { status: 500 });
    }

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
      console.error('Error creating patient:', patientError);
      // Don't fail if patient creation fails
    }

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        role: newUser.role
      },
      patient: newPatient
    });

  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}