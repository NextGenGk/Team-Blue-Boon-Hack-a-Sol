import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const body = await request.json();
    
    // Verify the token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Extract names from email if not provided
    let firstName = body.first_name;
    let lastName = body.last_name;

    if (!firstName && user.email) {
      const emailParts = user.email.split('@')[0].split('.');
      firstName = emailParts[0] || 'User';
      lastName = emailParts[1] || 'User';
    }

    // Create user profile
    const { data: newProfile, error: createError } = await supabase
      .from('users')
      .insert({
        auth_id: user.id,
        email: user.email,
        first_name: firstName,
        last_name: lastName,
        avatar_url: body.avatar_url,
        phone: body.phone || user.phone,
        role: 'patient'
      })
      .select()
      .single();

    if (createError) {
      // Check if profile already exists
      if (createError.code === '23505') { // Unique constraint violation
        const { data: existingProfile, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('auth_id', user.id)
          .single();

        if (fetchError) {
          return NextResponse.json(
            { success: false, error: 'Profile creation failed', details: createError.message },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          profile: existingProfile,
          message: 'Profile already exists'
        });
      }

      return NextResponse.json(
        { success: false, error: 'Failed to create profile', details: createError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: newProfile,
      message: 'Profile created successfully'
    });

  } catch (error) {
    console.error('Create profile error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}