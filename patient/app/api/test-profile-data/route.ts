import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
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

    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authUser) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated',
        authError: authError?.message
      });
    }

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

    // Test database queries step by step
    const testResults: any = {
      authUser: {
        id: authUser.id,
        email: authUser.email,
        metadata: authUser.user_metadata
      },
      queries: {}
    };

    // Test 1: Check users table
    try {
      const { data: users, error: usersError } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('email', authUser.email);
      
      testResults.queries.users = {
        success: !usersError,
        error: usersError?.message,
        data: users,
        count: users?.length || 0
      };
    } catch (e) {
      testResults.queries.users = {
        success: false,
        error: e instanceof Error ? e.message : 'Unknown error'
      };
    }

    // Test 2: Check patients table
    try {
      const { data: patients, error: patientsError } = await supabaseAdmin
        .from('patients')
        .select('*')
        .limit(5);
      
      testResults.queries.patients = {
        success: !patientsError,
        error: patientsError?.message,
        data: patients,
        count: patients?.length || 0
      };
    } catch (e) {
      testResults.queries.patients = {
        success: false,
        error: e instanceof Error ? e.message : 'Unknown error'
      };
    }

    // Test 3: Check appointments table
    try {
      const { data: appointments, error: appointmentsError } = await supabaseAdmin
        .from('appointments')
        .select('*')
        .limit(5);
      
      testResults.queries.appointments = {
        success: !appointmentsError,
        error: appointmentsError?.message,
        data: appointments,
        count: appointments?.length || 0
      };
    } catch (e) {
      testResults.queries.appointments = {
        success: false,
        error: e instanceof Error ? e.message : 'Unknown error'
      };
    }

    // Test 4: Test the actual profile API call
    try {
      const profileResponse = await fetch(`${request.nextUrl.origin}/api/profile/simple`, {
        headers: {
          'Cookie': request.headers.get('cookie') || ''
        }
      });
      
      const profileData = await profileResponse.json();
      
      testResults.profileAPI = {
        success: profileResponse.ok,
        status: profileResponse.status,
        data: profileData
      };
    } catch (e) {
      testResults.profileAPI = {
        success: false,
        error: e instanceof Error ? e.message : 'Unknown error'
      };
    }

    return NextResponse.json({
      success: true,
      testResults
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}