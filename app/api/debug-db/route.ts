import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    // Check users table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(10);

    // Check caregivers table
    const { data: caregivers, error: caregiversError } = await supabase
      .from('caregivers')
      .select('*')
      .limit(10);

    // Check caregivers with users join
    const { data: caregiversWithUsers, error: joinError } = await supabase
      .from('caregivers')
      .select(`
        *,
        users!inner(
          first_name,
          last_name,
          email,
          phone,
          avatar_url
        )
      `)
      .limit(5);

    // Check centers
    const { data: centers, error: centersError } = await supabase
      .from('centers')
      .select('*')
      .limit(5);

    return NextResponse.json({
      success: true,
      database_status: {
        users: {
          count: users?.length || 0,
          error: usersError?.message,
          sample: users?.slice(0, 2)
        },
        caregivers: {
          count: caregivers?.length || 0,
          error: caregiversError?.message,
          sample: caregivers?.slice(0, 2)
        },
        caregivers_with_users: {
          count: caregiversWithUsers?.length || 0,
          error: joinError?.message,
          sample: caregiversWithUsers?.slice(0, 1)
        },
        centers: {
          count: centers?.length || 0,
          error: centersError?.message,
          sample: centers?.slice(0, 2)
        }
      },
      rls_info: {
        note: "If counts are 0, check if RLS policies are blocking access",
        suggestion: "Try running the seed data insertion again"
      }
    });

  } catch (error) {
    console.error('Debug DB error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}