import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clerk_id = searchParams.get('clerk_id');
    const email = searchParams.get('email');

    if (!clerk_id && !email) {
      return NextResponse.json(
        { success: false, error: 'clerk_id or email is required' },
        { status: 400 }
      );
    }

    // Check if user exists in our database
    let query = supabase
      .from('users')
      .select('id, clerk_id, email, first_name, last_name, avatar_url, role, created_at');

    if (clerk_id) {
      query = query.eq('clerk_id', clerk_id);
    } else if (email) {
      query = query.eq('email', email);
    }

    const { data: user, error } = await query.single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Database error', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      exists: !!user,
      user: user || null
    });

  } catch (error) {
    console.error('Check user error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}