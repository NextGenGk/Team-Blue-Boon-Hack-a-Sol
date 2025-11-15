"use client";

import { useState } from 'react';
import { User, Search, CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function ProfileTestPage() {
  const [email, setEmail] = useState('atkola12345@gmail.com');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!email.trim()) return;
    
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`/api/profile/user?email=${encodeURIComponent(email)}`);
      const data = await response.json();

      if (response.ok && data.success) {
        setResult(data);
      } else {
        setError(data.error || 'Failed to fetch profile');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-6">
            <User className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Profile Fetch Test</h1>
          </div>

          {/* Search Form */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="flex space-x-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email to fetch profile"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={fetchProfile}
                disabled={loading || !email.trim()}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                <span>Fetch Profile</span>
              </button>
            </div>
          </div>

          {/* Results */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2 text-red-800">
                <XCircle className="w-5 h-5" />
                <span className="font-medium">Error</span>
              </div>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          )}

          {result && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2 text-green-800 mb-3">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Profile Found!</span>
              </div>
              
              <div className="space-y-4">
                {/* User Info */}
                <div className="bg-white p-4 rounded border">
                  <h3 className="font-medium text-gray-900 mb-2">User Information</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Name:</span>
                      <span className="ml-2 font-medium">
                        {result.data.user.first_name || result.data.user.last_name 
                          ? `${result.data.user.first_name || ''} ${result.data.user.last_name || ''}`.trim()
                          : 'Not set'
                        }
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <span className="ml-2 font-medium">{result.data.user.email}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Role:</span>
                      <span className="ml-2 font-medium capitalize">{result.data.user.role}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Phone:</span>
                      <span className="ml-2 font-medium">{result.data.user.phone || 'Not set'}</span>
                    </div>
                  </div>
                </div>

                {/* Patient Info */}
                {result.data.patient && (
                  <div className="bg-white p-4 rounded border">
                    <h3 className="font-medium text-gray-900 mb-2">Patient Information</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">DOB:</span>
                        <span className="ml-2 font-medium">
                          {result.data.patient.date_of_birth 
                            ? new Date(result.data.patient.date_of_birth).toLocaleDateString()
                            : 'Not set'
                          }
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Gender:</span>
                        <span className="ml-2 font-medium capitalize">{result.data.patient.gender || 'Not set'}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Blood Group:</span>
                        <span className="ml-2 font-medium">{result.data.patient.blood_group || 'Not set'}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Statistics */}
                <div className="bg-white p-4 rounded border">
                  <h3 className="font-medium text-gray-900 mb-2">Statistics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{result.data.stats.totalAppointments}</div>
                      <div className="text-gray-600">Appointments</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{result.data.stats.completedAppointments}</div>
                      <div className="text-gray-600">Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">₹{result.data.stats.totalSpent}</div>
                      <div className="text-gray-600">Total Spent</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{result.data.stats.activePrescriptions}</div>
                      <div className="text-gray-600">Prescriptions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-teal-600">{result.data.stats.progressCompletion}%</div>
                      <div className="text-gray-600">Progress</div>
                    </div>
                  </div>
                </div>

                {/* Raw Data */}
                <details className="bg-white p-4 rounded border">
                  <summary className="font-medium text-gray-900 cursor-pointer">Raw Data (Click to expand)</summary>
                  <pre className="mt-2 text-xs bg-gray-50 p-3 rounded overflow-auto max-h-96">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </details>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">Instructions</h3>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• Enter an email address to fetch the user's profile data</li>
              <li>• The system will first try to find the specific user</li>
              <li>• If not found, it will show an error message</li>
              <li>• This tests the database connection and RLS policies</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}