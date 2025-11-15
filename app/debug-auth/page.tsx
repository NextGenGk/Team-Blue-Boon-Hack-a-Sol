"use client";

import { useState } from 'react';
import { useEnhancedSupabase } from '@/components/EnhancedSupabaseProvider';

export default function DebugAuthPage() {
  const { user, loading } = useEnhancedSupabase();
  const [debugData, setDebugData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runDebug = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/debug-auth');
      const data = await response.json();
      setDebugData(data);
    } catch (error) {
      setDebugData({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setIsLoading(false);
    }
  };

  const testProfileAPI = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/profile/simple');
      const data = await response.json();
      setDebugData({ profileAPI: data });
    } catch (error) {
      setDebugData({ profileAPI: { error: error instanceof Error ? error.message : 'Unknown error' } });
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading authentication...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Authentication Debug</h1>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-2">Current Auth State</h2>
        {user ? (
          <div>
            <p><strong>Signed in as:</strong> {user.email}</p>
            <p><strong>User ID:</strong> {user.id}</p>
            <p><strong>Metadata:</strong> {JSON.stringify(user.user_metadata, null, 2)}</p>
          </div>
        ) : (
          <p>Not signed in</p>
        )}
      </div>

      <div className="space-x-4 mb-6">
        <button
          onClick={runDebug}
          disabled={isLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? 'Running...' : 'Debug Database'}
        </button>
        
        <button
          onClick={testProfileAPI}
          disabled={isLoading}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          {isLoading ? 'Testing...' : 'Test Profile API'}
        </button>
      </div>

      {debugData && (
        <div className="bg-white border rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Debug Results</h2>
          <pre className="text-sm overflow-auto bg-gray-50 p-4 rounded">
            {JSON.stringify(debugData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}