import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Test the connection
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        details: 'Failed to get user'
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      user: data.user,
      message: 'Supabase connection working'
    });

  } catch (error) {
    console.error('Auth test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: 'Server error during auth test'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    const supabase = createClient();
    
    // Test sign up
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: 'Test',
          last_name: 'User',
        },
      },
    });

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        details: 'Failed to create test user'
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      user: data.user,
      message: 'Test user created successfully'
    });

  } catch (error) {
    console.error('Test signup error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: 'Server error during test signup'
    }, { status: 500 });
  }
}