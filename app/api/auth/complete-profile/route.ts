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
    
    // Verify the token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    console.log('Completing profile for user:', user.id);
    console.log('User metadata:', user.user_metadata);
    console.log('User email:', user.email);

    // Extract names from various sources with better fallbacks
    const extractNames = (user: any) => {
      const metadata = user.user_metadata || {};
      const email = user.email || '';
      
      console.log('Extracting names from metadata:', metadata);
      
      // Try to get full name first
      const fullName = metadata.full_name || metadata.name || metadata.displayName || '';
      
      let firstName = '';
      let lastName = '';
      
      // Priority 1: Google's standard fields
      if (metadata.given_name) {
        firstName = metadata.given_name;
      } else if (metadata.first_name) {
        firstName = metadata.first_name;
      } else if (metadata.firstName) {
        firstName = metadata.firstName;
      }
      
      if (metadata.family_name) {
        lastName = metadata.family_name;
      } else if (metadata.last_name) {
        lastName = metadata.last_name;
      } else if (metadata.lastName) {
        lastName = metadata.lastName;
      }
      
      // Priority 2: Parse from full name
      if (!firstName && fullName) {
        const nameParts = fullName.trim().split(' ');
        firstName = nameParts[0] || '';
        if (nameParts.length > 1) {
          lastName = nameParts.slice(1).join(' ');
        }
      }
      
      // Priority 3: Parse from email
      if (!firstName && email) {
        const emailPart = email.split('@')[0];
        if (emailPart.includes('.')) {
          const emailParts = emailPart.split('.');
          firstName = emailParts[0] || '';
          if (emailParts.length > 1 && !lastName) {
            lastName = emailParts[1] || '';
          }
        } else if (emailPart.includes('_')) {
          const emailParts = emailPart.split('_');
          firstName = emailParts[0] || '';
          if (emailParts.length > 1 && !lastName) {
            lastName = emailParts[1] || '';
          }
        } else {
          firstName = emailPart;
        }
      }
      
      // Final fallback - but make it more user-friendly
      if (!firstName) {
        firstName = 'New User';
      }
      
      // Clean and capitalize names
      firstName = firstName.trim();
      lastName = lastName ? lastName.trim() : '';
      
      if (firstName) {
        firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
      }
      if (lastName) {
        lastName = lastName.charAt(0).toUpperCase() + lastName.slice(1).toLowerCase();
      }
      
      // Create full name if not provided
      const finalFullName = fullName || (firstName + (lastName ? ` ${lastName}` : ''));
      
      console.log('Extracted names result:', { firstName, lastName, fullName: finalFullName });
      
      return { firstName, lastName, fullName: finalFullName };
    };

    const { firstName, lastName, fullName } = extractNames(user);
    
    console.log('Extracted names:', { firstName, lastName, fullName });

    // Check if profile already exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', user.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing profile:', checkError);
      return NextResponse.json(
        { success: false, error: 'Database error', details: checkError.message },
        { status: 500 }
      );
    }

    let profile;

    if (existingProfile) {
      // Update existing profile if names are missing
      const needsUpdate = !existingProfile.first_name || 
                         !existingProfile.last_name || 
                         existingProfile.first_name === 'User' ||
                         existingProfile.last_name === 'User';

      if (needsUpdate) {
        console.log('Updating existing profile with better names');
        const { data: updatedProfile, error: updateError } = await supabase
          .from('users')
          .update({
            first_name: firstName,
            last_name: lastName,
            full_name: fullName,
            avatar_url: user.user_metadata?.avatar_url || 
                       user.user_metadata?.picture || 
                       existingProfile.avatar_url,
            metadata: user.user_metadata,
            updated_at: new Date().toISOString()
          })
          .eq('auth_id', user.id)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating profile:', updateError);
          return NextResponse.json(
            { success: false, error: 'Failed to update profile', details: updateError.message },
            { status: 500 }
          );
        }

        profile = updatedProfile;
      } else {
        profile = existingProfile;
      }
    } else {
      // Create new profile
      console.log('Creating new profile');
      const { data: newProfile, error: createError } = await supabase
        .from('users')
        .insert({
          auth_id: user.id,
          email: user.email,
          first_name: firstName,
          last_name: lastName,
          full_name: fullName,
          avatar_url: user.user_metadata?.avatar_url || 
                     user.user_metadata?.picture,
          phone: user.phone,
          role: 'patient',
          metadata: user.user_metadata
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating profile:', createError);
        return NextResponse.json(
          { success: false, error: 'Failed to create profile', details: createError.message },
          { status: 500 }
        );
      }

      profile = newProfile;
    }

    console.log('Profile completed:', profile);

    return NextResponse.json({
      success: true,
      profile,
      message: existingProfile ? 'Profile updated successfully' : 'Profile created successfully'
    });

  } catch (error) {
    console.error('Complete profile error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Verify the token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Use the database function to get profile with fallbacks
    const { data: profile, error: profileError } = await supabase
      .rpc('get_user_profile', { user_auth_id: user.id });

    if (profileError) {
      console.error('Error getting profile:', profileError);
      return NextResponse.json(
        { success: false, error: 'Failed to get profile', details: profileError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      profile,
      auth_user: {
        id: user.id,
        email: user.email,
        metadata: user.user_metadata
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}