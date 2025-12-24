// Utility functions for handling user data and Google sign-up

export interface GoogleUserMetadata {
  name?: string;
  given_name?: string;
  family_name?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  picture?: string;
  email?: string;
}

export interface UserProfile {
  id: string;
  auth_id: string;
  email: string;
  first_name: string;
  last_name?: string;
  full_name?: string;
  avatar_url?: string;
  role: string;
}

/**
 * Extract first and last name from Google user metadata
 */
export function extractNamesFromGoogleData(metadata: GoogleUserMetadata, email: string): {
  firstName: string;
  lastName: string | null;
  fullName: string;
} {
  // Extract full name from various Google fields
  const fullName = metadata.name || metadata.full_name || '';
  
  // Extract first name with multiple fallbacks
  let firstName = metadata.given_name || 
                  metadata.first_name || 
                  '';
  
  // If no first name from metadata, try to extract from full name
  if (!firstName && fullName) {
    firstName = fullName.split(' ')[0] || '';
  }
  
  // If still no first name, use email username
  if (!firstName && email) {
    const emailUsername = email.split('@')[0];
    if (emailUsername.includes('.')) {
      firstName = emailUsername.split('.')[0];
    } else {
      firstName = emailUsername;
    }
  }
  
  // Final fallback
  if (!firstName) {
    firstName = 'User';
  }
  
  // Extract last name with multiple fallbacks
  let lastName = metadata.family_name || 
                 metadata.last_name || 
                 null;
  
  // If no last name from metadata, try to extract from full name
  if (!lastName && fullName && fullName.includes(' ')) {
    const nameParts = fullName.split(' ');
    if (nameParts.length > 1) {
      lastName = nameParts.slice(1).join(' ');
    }
  }
  
  // If still no last name, try email
  if (!lastName && email) {
    const emailUsername = email.split('@')[0];
    if (emailUsername.includes('.')) {
      const emailParts = emailUsername.split('.');
      if (emailParts.length > 1) {
        lastName = emailParts[1];
      }
    }
  }
  
  // Clean and format names
  firstName = capitalizeFirstLetter(firstName.trim());
  lastName = lastName ? capitalizeFirstLetter(lastName.trim()) : null;
  
  const finalFullName = fullName || (firstName + (lastName ? ` ${lastName}` : ''));
  
  return {
    firstName,
    lastName,
    fullName: finalFullName
  };
}

/**
 * Capitalize the first letter of a string
 */
function capitalizeFirstLetter(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Update user profile with extracted names
 */
export async function updateUserProfileNames(
  supabase: any,
  userId: string,
  metadata: GoogleUserMetadata,
  email: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { firstName, lastName, fullName } = extractNamesFromGoogleData(metadata, email);
    
    const { error } = await supabase
      .from('users')
      .update({
        first_name: firstName,
        last_name: lastName,
        full_name: fullName,
        updated_at: new Date().toISOString()
      })
      .eq('auth_id', userId);
    
    if (error) {
      console.error('Error updating user profile names:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error in updateUserProfileNames:', error);
    return { success: false, error: 'Failed to update user profile' };
  }
}

/**
 * Ensure user profile exists and has proper names
 */
export async function ensureUserProfile(
  supabase: any,
  user: any
): Promise<UserProfile | null> {
  try {
    // First, try to get existing profile
    const { data: existingProfile, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', user.id)
      .single();
    
    if (existingProfile && existingProfile.first_name && existingProfile.first_name !== 'User') {
      // Profile exists and has proper name
      return existingProfile;
    }
    
    // Profile doesn't exist or has generic name, create/update it
    const metadata = user.user_metadata || {};
    const { firstName, lastName, fullName } = extractNamesFromGoogleData(metadata, user.email);
    
    const profileData = {
      auth_id: user.id,
      email: user.email,
      first_name: firstName,
      last_name: lastName,
      full_name: fullName,
      avatar_url: metadata.picture || metadata.avatar_url || null,
      role: 'patient'
    };
    
    if (existingProfile) {
      // Update existing profile
      const { data: updatedProfile, error: updateError } = await supabase
        .from('users')
        .update({
          first_name: firstName,
          last_name: lastName,
          full_name: fullName,
          avatar_url: profileData.avatar_url,
          updated_at: new Date().toISOString()
        })
        .eq('auth_id', user.id)
        .select()
        .single();
      
      if (updateError) {
        console.error('Error updating user profile:', updateError);
        return existingProfile; // Return existing profile as fallback
      }
      
      return updatedProfile;
    } else {
      // Create new profile
      const { data: newProfile, error: insertError } = await supabase
        .from('users')
        .insert(profileData)
        .select()
        .single();
      
      if (insertError) {
        console.error('Error creating user profile:', insertError);
        return null;
      }
      
      return newProfile;
    }
  } catch (error) {
    console.error('Error in ensureUserProfile:', error);
    return null;
  }
}

/**
 * Get user display name with fallbacks
 */
export function getUserDisplayName(user: UserProfile | null): string {
  if (!user) return 'User';
  
  if (user.first_name && user.first_name !== 'User') {
    return user.last_name ? `${user.first_name} ${user.last_name}` : user.first_name;
  }
  
  if (user.full_name) {
    return user.full_name;
  }
  
  if (user.email) {
    return user.email.split('@')[0];
  }
  
  return 'User';
}