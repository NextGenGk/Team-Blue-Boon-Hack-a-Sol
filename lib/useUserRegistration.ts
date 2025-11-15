/**
 * Hook to handle user registration after Clerk authentication
 */

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import toast from 'react-hot-toast';

export function useUserRegistration() {
  const { user, isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    const registerUser = async () => {
      if (!isLoaded || !isSignedIn || !user) return;

      try {
        // Check if user is already registered in our database
        const checkResponse = await fetch(`/api/auth/check-user?clerk_id=${user.id}`);
        const checkData = await checkResponse.json();

        if (checkData.exists) {
          console.log('User already registered in database');
          return;
        }

        // Register user in our database
        const registerResponse = await fetch('/api/auth/register-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            clerk_id: user.id,
            email: user.emailAddresses?.[0]?.emailAddress,
            first_name: user.firstName,
            last_name: user.lastName,
            avatar_url: user.imageUrl,
            phone: user.phoneNumbers?.[0]?.phoneNumber,
          }),
        });

        const registerData = await registerResponse.json();

        if (registerData.success) {
          console.log('User registered successfully:', registerData.user);
          toast.success('Welcome! Your account has been set up.');
        } else {
          console.error('Failed to register user:', registerData.error);
          toast.error('Failed to set up your account. Please try again.');
        }

      } catch (error) {
        console.error('User registration error:', error);
        toast.error('Failed to set up your account. Please try again.');
      }
    };

    registerUser();
  }, [isLoaded, isSignedIn, user]);

  return {
    user,
    isLoaded,
    isSignedIn
  };
}