"use client";

import { useState, useEffect } from 'react';
import { User, CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react';

export default function TestCorrectedProfilePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/profile/corrected?email=atkola12345@gmail.com');
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

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <User className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Corrected Profile Test</h1>
            </div>
            <button
              onClick={fetchProfile}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              <span>Refresh</span>
            </button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">Fetching profile for atkola12345@gmail.com...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2 text-red-800">
                <XCircle className="w-5 h-5" />
                <span className="font-medium">Error</span>
              </div>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          )}

          {/* Success State */}
          {result && (
            <div className="space-y-6">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2 text-green-800">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">
                    {result.isSimulated ? 'Sample Profile Created!' : 'Real Profile Loaded!'}
                  </span>
                </div>
                <p className="text-green-700 mt-1">{result.message}</p>
              </div>

              {/* Profile Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">User Info</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-blue-700">Name:</span> {result.data.user.first_name} {result.data.user.last_name}</p>
                    <p><span className="text-blue-700">Email:</span> {result.data.user.email}</p>
                    <p><span className="text-blue-700">Role:</span> {result.data.user.role}</p>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-medium text-green-900 mb-2">Health Info</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-green-700">Blood Group:</span> {result.data.patient?.blood_group || 'N/A'}</p>
                    <p><span className="text-green-700">Gender:</span> {result.data.patient?.gender || 'N/A'}</p>
                    <p><span className="text-green-700">Allergies:</span> {result.data.patient?.allergies?.length || 0}</p>
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-medium text-purple-900 mb-2">Medical Records</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-purple-700">Appointments:</span> {result.data.appointments?.length || 0}</p>
                    <p><span className="text-purple-700">Prescriptions:</span> {result.data.prescriptions?.length || 0}</p>
                    <p><span className="text-purple-700">Progress:</span> {result.data.progressTracking?.length || 0}</p>
                  </div>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg">
                  <h3 className="font-medium text-orange-900 mb-2">Statistics</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-orange-700">Total Spent:</span> ₹{result.data.stats?.totalSpent || 0}</p>
                    <p><span className="text-orange-700">Completed:</span> {result.data.stats?.completedAppointments || 0}</p>
                    <p><span className="text-orange-700">Progress:</span> {result.data.stats?.progressCompletion || 0}%</p>
                  </div>
                </div>
              </div>

              {/* Detailed Data */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Appointments */}
                <div className="bg-white border rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">Recent Appointments</h3>
                  <div className="space-y-2">
                    {result.data.appointments?.slice(0, 3).map((apt: any, index: number) => (
                      <div key={index} className="bg-gray-50 p-3 rounded border">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-sm">{apt.caregiver_name}</p>
                            <p className="text-xs text-gray-600">{new Date(apt.start_time).toLocaleDateString()}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded ${
                            apt.status === 'completed' ? 'bg-green-100 text-green-800' :
                            apt.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {apt.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {apt.symptoms?.join(', ') || 'No symptoms listed'}
                        </p>
                      </div>
                    )) || <p className="text-gray-500 text-sm">No appointments found</p>}
                  </div>
                </div>

                {/* Prescriptions */}
                <div className="bg-white border rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-3">Recent Prescriptions</h3>
                  <div className="space-y-2">
                    {result.data.prescriptions?.slice(0, 2).map((presc: any, index: number) => (
                      <div key={index} className="bg-gray-50 p-3 rounded border">
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-medium text-sm">{presc.caregiver_name}</p>
                          <span className={`px-2 py-1 text-xs rounded ${
                            presc.is_approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {presc.is_approved ? 'Approved' : 'Pending'}
                          </span>
                        </div>
                        <div className="space-y-1">
                          {presc.items?.slice(0, 2).map((item: any, i: number) => (
                            <p key={i} className="text-xs text-gray-600">
                              {item.name} - {item.dosage} ({item.frequency})
                            </p>
                          ))}
                        </div>
                      </div>
                    )) || <p className="text-gray-500 text-sm">No prescriptions found</p>}
                  </div>
                </div>
              </div>

              {/* Raw Data Toggle */}
              <details className="bg-gray-50 border rounded-lg p-4">
                <summary className="font-medium text-gray-900 cursor-pointer">View Raw Data</summary>
                <pre className="mt-3 text-xs bg-white p-3 rounded border overflow-auto max-h-96">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}