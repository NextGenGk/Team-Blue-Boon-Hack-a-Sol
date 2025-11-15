'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useEnhancedSupabase } from '@/components/EnhancedSupabaseProvider';
import toast from 'react-hot-toast';

export default function TestAuthPage() {
  const { user, loading } = useEnhancedSupabase();
  const [email, setEmail] = useState('test@ayursutra.com');
  const [password, setPassword] = useState('testpassword123');
  const [testLoading, setTestLoading] = useState(false);
  const supabase = createClient();

  const testConnection = async () => {
    setTestLoading(true);
    try {
      const response = await fetch('/api/test-auth');
      const result = await response.json();
      
      if (result.success) {
        toast.success('Supabase connection working!');
        console.log('Connection test result:', result);
      } else {
        toast.error(`Connection failed: ${result.error}`);
        console.error('Connection test failed:', result);
      }
    } catch (error) {
      toast.error('Failed to test connection');
      console.error('Test error:', error);
    } finally {
      setTestLoading(false);
    }
  };

  const createTestUser = async () => {
    setTestLoading(true);
    try {
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
        toast.error(`Signup failed: ${error.message}`);
        console.error('Signup error:', error);
      } else {
        toast.success('Test user created! Check your email for confirmation.');
        console.log('Signup success:', data);
      }
    } catch (error) {
      toast.error('Failed to create test user');
      console.error('Signup error:', error);
    } finally {
      setTestLoading(false);
    }
  };

  const signInTestUser = async () => {
    setTestLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(`Sign in failed: ${error.message}`);
        console.error('Sign in error:', error);
      } else {
        toast.success('Signed in successfully!');
        console.log('Sign in success:', data);
      }
    } catch (error) {
      toast.error('Failed to sign in');
      console.error('Sign in error:', error);
    } finally {
      setTestLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Signed out successfully!');
    } catch (error) {
      toast.error('Failed to sign out');
      console.error('Sign out error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-8">
            AyurSutra Auth Test
          </h1>

          {/* Current User Status */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Current User Status</h2>
            {loading ? (
              <p>Loading...</p>
            ) : user ? (
              <div>
                <p className="text-green-600">✅ Signed in as: {user.email}</p>
                <p className="text-sm text-gray-600">User ID: {user.id}</p>
                <button
                  onClick={signOut}
                  className="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <p className="text-red-600">❌ Not signed in</p>
            )}
          </div>

          {/* Test Controls */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-4">Test Authentication</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={testConnection}
                  disabled={testLoading}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  {testLoading ? 'Testing...' : 'Test Connection'}
                </button>
                
                <button
                  onClick={createTestUser}
                  disabled={testLoading}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                >
                  {testLoading ? 'Creating...' : 'Create Test User'}
                </button>
                
                <button
                  onClick={signInTestUser}
                  disabled={testLoading}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
                >
                  {testLoading ? 'Signing in...' : 'Sign In Test User'}
                </button>
              </div>
            </div>

            {/* Environment Info */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Environment Info</h3>
              <div className="text-sm space-y-1">
                <p><strong>Supabase URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
                <p><strong>Anon Key:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20)}...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}