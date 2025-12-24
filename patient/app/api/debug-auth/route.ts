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
        error: 'No authenticated user',
        details: authError?.message || 'Not signed in'
      });
    }

    // Use service role to check database
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

    // Check if user exists in database
    const { data: dbUser, error: dbError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', authUser.email)
      .single();

    // Check if user exists by auth_id
    const { data: dbUserByAuthId, error: authIdError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('auth_id', authUser.id)
      .single();

    // Get all users to see what's in the database
    const { data: allUsers, error: allUsersError } = await supabaseAdmin
      .from('users')
      .select('id, email, auth_id, first_name, last_name, role, created_at')
      .limit(10);

    return NextResponse.json({
      success: true,
      debug: {
        authUser: {
          id: authUser.id,
          email: authUser.email,
          user_metadata: authUser.user_metadata,
          phone: authUser.phone
        },
        dbUser: dbUser || null,
        dbUserError: dbError?.message || null,
        dbUserByAuthId: dbUserByAuthId || null,
        authIdError: authIdError?.message || null,
        allUsers: allUsers || [],
        allUsersError: allUsersError?.message || null,
        environment: {
          hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL
        }
      }
    });

  } catch (error) {
    console.error('Debug auth error:', error);
    return NextResponse.json({
      success: false,
      error: 'Debug failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}