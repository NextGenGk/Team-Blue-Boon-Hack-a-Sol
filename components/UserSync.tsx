'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect } from 'react';
import { syncClerkUser } from '@/lib/supabaseClient';

export function UserSync() {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    const syncUser = async () => {
      if (isLoaded && user) {
        try {
          await syncClerkUser(user);
        } catch (error) {
          console.error('Error syncing user:', error);
        }
      }
    };

    syncUser();
  }, [user, isLoaded]);

  return null; // This component doesn't render anything
}