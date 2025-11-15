import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    
    // Create a Supabase client with server-side auth
    const supabaseServer = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabaseServer.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user profile
    const { data: userProfile, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', user.id)
      .single();

    if (userError || !userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Get patient profile
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select(`
        *,
        caregivers(
          id,
          users!inner(
            first_name,
            last_name,
            email
          )
        )
      `)
      .eq('user_id', userProfile.id)
      .single();

    if (patientError) {
      // Patient profile doesn't exist, create one
      const { data: newPatient, error: createError } = await supabase
        .from('patients')
        .insert({
          user_id: userProfile.id,
          allergies: [],
          current_medications: [],
        })
        .select()
        .single();

      if (createError) {
        console.error('Failed to create patient profile:', createError);
        return NextResponse.json(
          { error: 'Failed to create patient profile' },
          { status: 500 }
        );
      }

      return NextResponse.json(newPatient);
    }

    return NextResponse.json(patient);

  } catch (error) {
    console.error('Patient API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}