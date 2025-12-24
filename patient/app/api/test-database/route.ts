import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    
    // Use service role for testing
    const supabase = createServerClient(
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

    const tests: any = {};

    // Test 1: Check if tables exist
    try {
      const { data, error } = await supabase
        .from('users')
        .select('count(*)')
        .limit(1);
      
      tests.usersTableExists = {
        success: !error,
        error: error?.message,
        data: data
      };
    } catch (e) {
      tests.usersTableExists = {
        success: false,
        error: e instanceof Error ? e.message : 'Unknown error'
      };
    }

    // Test 2: Check if patients table exists
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('count(*)')
        .limit(1);
      
      tests.patientsTableExists = {
        success: !error,
        error: error?.message,
        data: data
      };
    } catch (e) {
      tests.patientsTableExists = {
        success: false,
        error: e instanceof Error ? e.message : 'Unknown error'
      };
    }

    // Test 3: Try to insert a test user
    try {
      const testUser = {
        auth_id: 'test-' + Date.now(),
        email: `test-${Date.now()}@example.com`,
        first_name: 'Test',
        last_name: 'User',
        role: 'patient'
      };

      const { data, error } = await supabase
        .from('users')
        .insert(testUser)
        .select()
        .single();
      
      tests.userInsert = {
        success: !error,
        error: error?.message,
        data: data ? { id: data.id, email: data.email } : null
      };

      // Clean up test user
      if (data) {
        await supabase
          .from('users')
          .delete()
          .eq('id', data.id);
      }
    } catch (e) {
      tests.userInsert = {
        success: false,
        error: e instanceof Error ? e.message : 'Unknown error'
      };
    }

    // Test 4: Check existing users
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, role, created_at')
        .limit(5);
      
      tests.existingUsers = {
        success: !error,
        error: error?.message,
        data: data,
        count: data?.length || 0
      };
    } catch (e) {
      tests.existingUsers = {
        success: false,
        error: e instanceof Error ? e.message : 'Unknown error'
      };
    }

    // Test 5: Check database connection
    try {
      const { data, error } = await supabase
        .rpc('version');
      
      tests.databaseConnection = {
        success: !error,
        error: error?.message,
        data: data
      };
    } catch (e) {
      tests.databaseConnection = {
        success: false,
        error: e instanceof Error ? e.message : 'Unknown error'
      };
    }

    // Overall success
    const allTestsPassed = Object.values(tests).every((test: any) => test.success);

    return NextResponse.json({
      success: allTestsPassed,
      message: allTestsPassed ? 'All database tests passed' : 'Some database tests failed',
      tests,
      environment: {
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL
      }
    });

  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Database test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}