import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Extract user data from Clerk webhook or direct call
    const {
      clerk_id,
      email,
      first_name,
      last_name,
      avatar_url,
      phone,
      role = 'patient'
    } = body;

    console.log('Registering user:', { clerk_id, email, first_name, last_name });

    if (!clerk_id) {
      return NextResponse.json(
        { success: false, error: 'clerk_id is required' },
        { status: 400 }
      );
    }

    // Use the database function to upsert user
    const { data, error } = await supabase.rpc('upsert_user', {
      p_clerk_id: clerk_id,
      p_email: email,
      p_first_name: first_name,
      p_last_name: last_name,
      p_avatar_url: avatar_url,
      p_phone: phone,
      p_role: role
    });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to register user', details: error.message },
        { status: 500 }
      );
    }

    // Get the created/updated user
    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data)
      .single();

    if (fetchError) {
      console.error('Fetch error:', fetchError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch user data', details: fetchError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'User registered successfully',
      user: userData
    });

  } catch (error) {
    console.error('Register user error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Handle Clerk webhooks
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Handle Clerk webhook events
    const { type, data } = body;
    
    if (type === 'user.created' || type === 'user.updated') {
      const userData = data;
      
      // Extract user information from Clerk webhook
      const userInfo = {
        clerk_id: userData.id,
        email: userData.email_addresses?.[0]?.email_address,
        first_name: userData.first_name,
        last_name: userData.last_name,
        avatar_url: userData.image_url,
        phone: userData.phone_numbers?.[0]?.phone_number
      };

      console.log('Clerk webhook received:', type, userInfo);

      // Use Google sign-in handler for better name extraction
      const { data: result, error } = await supabase.rpc('handle_google_signin', {
        p_clerk_id: userInfo.clerk_id,
        p_email: userInfo.email,
        p_given_name: userInfo.first_name,
        p_family_name: userInfo.last_name,
        p_picture: userInfo.avatar_url
      });

      if (error) {
        console.error('Webhook processing error:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to process webhook', details: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Webhook processed successfully',
        user: result
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook received but not processed',
      type
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}