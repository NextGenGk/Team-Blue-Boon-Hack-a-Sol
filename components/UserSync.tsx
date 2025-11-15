"use client";
import { useEffect } from 'react';
import { useEnhancedSupabase } from '@/components/EnhancedSupabaseProvider';

export function UserSync() {
  const { user } = useEnhancedSupabase();

  useEffect(() => {
    if (user) {
      // Sync user data if needed
      console.log('User synced:', user.id);
    }
  }, [user]);

  return null;
}