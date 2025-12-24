"use client";
import { useEffect } from 'react';
import { useEnhancedSupabase } from '@/components/EnhancedSupabaseProvider';

export function UserProfileHandler() {
  const { user } = useEnhancedSupabase();

  useEffect(() => {
    if (user) {
      // Handle user profile updates
      console.log('Profile handled for user:', user.id);
    }
  }, [user]);

  return null;
}