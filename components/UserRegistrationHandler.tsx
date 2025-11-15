'use client';

import { useUserRegistration } from '@/lib/useUserRegistration';

/**
 * Component that handles automatic user registration after Clerk sign-in
 * Add this to your layout or main app component
 */
export function UserRegistrationHandler() {
  useUserRegistration();
  
  // This component doesn't render anything, it just handles the registration logic
  return null;
}