"use client";

import { useState } from 'react';
import { useEnhancedSupabase } from '@/components/EnhancedSupabaseProvider';
import toast from 'react-hot-toast';

export default function TestUserCreationPage() {
  const { user, loading } = useEnhancedSupabase();
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const createUser = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      const data = await response.json();
      setResult(data);
      
      if (data.success) {
        toast.success('User created successfully!');
      } else {
        toast.error(data.error || 'Failed to create user');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setResult({ error: errorMsg });
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const testProfile = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/profile/simple');
      const data = await response.json();
      setResult({ profile: data });
      
      if (data.success) {
        toast.success('Profile loaded successfully!');
      } else {
        toast.error(data.error || 'Failed to load profile');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setResult({ error: errorMsg });
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const debugAuth = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/debug-auth');
      const data = await response.json();
      setResult({ debug: data });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setResult({ error: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading authentication...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Test User Creation</h1>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-2">Current Auth State</h2>
        {user ? (
          <div>
            <p><strong>Signed in as:</strong> {user.email}</p>
            <p><strong>User ID:</strong> {user.id}</p>
          </div>
        ) : (
          <p className="text-red-600">❌ Not signed in - Please sign in first</p>
        )}
      </div>

      {user && (
        <div className="space-x-4 mb-6">
          <button
            onClick={createUser}
            disabled={isLoading}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
          >
            {isLoading ? 'Creating...' : 'Create User in Database'}
          </button>
          
          <button
            onClick={testProfile}
            disabled={isLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? 'Testing...' : 'Test Profile API'}
          </button>
          
          <button
            onClick={debugAuth}
            disabled={isLoading}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
          >
            {isLoading ? 'Debugging...' : 'Debug Auth'}
          </button>
        </div>
      )}

      {result && (
        <div className="bg-white border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Results</h2>
          <pre className="text-sm overflow-auto bg-gray-50 p-4 rounded max-h-96">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">Instructions:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Make sure you're signed in</li>
          <li>Click "Create User in Database" to manually create your user record</li>
          <li>Click "Test Profile API" to verify it works</li>
          <li>Go to your profile page to see real data</li>
        </ol>
      </div>
    </div>
  );
}