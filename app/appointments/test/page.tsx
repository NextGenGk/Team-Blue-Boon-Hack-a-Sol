"use client";

import { useState, useEffect } from 'react';
import { AppointmentCard } from '@/components/AppointmentCard';
import { 
  Calendar, 
  Filter, 
  Search, 
  RefreshCw, 
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Database
} from 'lucide-react';

interface AppointmentData {
  id: string;
  patient_id: string;
  caregiver_id: string;
  mode: 'online' | 'home_visit' | 'offline';
  status: 'requested' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  start_time: string;
  end_time: string;
  symptoms: string[];
  payment_required: boolean;
  payment_amount: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  patient_age?: number;
  patient_gender?: string;
  patient_blood_group?: string;
  caregiver_name: string;
  caregiver_email: string;
  caregiver_phone: string;
  caregiver_type: string;
  caregiver_specializations: string[];
  caregiver_experience: number;
  consultation_fee: number;
  home_visit_fee: number;
  created_at: string;
  updated_at: string;
}

export default function TestAppointmentsPage() {
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    mode: '',
    search: ''
  });

  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.mode) params.append('mode', filters.mode);

      const response = await fetch(`/api/appointments/test?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch appointments');
      }

      if (data.success) {
        setAppointments(data.data || []);
      } else {
        throw new Error(data.error || 'Failed to fetch appointments');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [filters.status, filters.mode]);

  const handleStatusUpdate = async (appointmentId: string, newStatus: string) => {
    try {
      console.log(`Updating appointment ${appointmentId} to status: ${newStatus}`);
      
      // Update local state
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === appointmentId 
            ? { ...apt, status: newStatus as any }
            : apt
        )
      );
    } catch (err) {
      console.error('Failed to update appointment status:', err);
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    if (!filters.search) return true;
    
    const searchLower = filters.search.toLowerCase();
    return (
      appointment.patient_name.toLowerCase().includes(searchLower) ||
      appointment.caregiver_name.toLowerCase().includes(searchLower) ||
      appointment.symptoms.some(symptom => symptom.toLowerCase().includes(searchLower)) ||
      appointment.id.toLowerCase().includes(searchLower)
    );
  });

  const getStatusStats = () => {
    const stats = appointments.reduce((acc, apt) => {
      acc[apt.status] = (acc[apt.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: appointments.length,
      requested: stats.requested || 0,
      confirmed: stats.confirmed || 0,
      completed: stats.completed || 0,
      cancelled: stats.cancelled || 0
    };
  };

  const stats = getStatusStats();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Database className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Test Appointments Dashboard</h1>
                <p className="text-gray-600">Sample data from your database</p>
              </div>
            </div>
            <button
              onClick={fetchAppointments}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="flex items-center space-x-3">
                <Users className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  <p className="text-sm text-gray-600">Total</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-8 h-8 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.requested}</p>
                  <p className="text-sm text-gray-600">Requested</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="flex items-center space-x-3">
                <Clock className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.confirmed}</p>
                  <p className="text-sm text-gray-600">Confirmed</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
                  <p className="text-sm text-gray-600">Completed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filters:</span>
              </div>
              
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Status</option>
                <option value="requested">Requested</option>
                <option value="confirmed">Confirmed</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <select
                value={filters.mode}
                onChange={(e) => setFilters(prev => ({ ...prev, mode: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Modes</option>
                <option value="online">Online</option>
                <option value="home_visit">Home Visit</option>
                <option value="offline">Offline</option>
              </select>

              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search appointments..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-2 text-gray-600">
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Loading appointments...</span>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-red-800">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Error loading appointments</span>
              </div>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          )}

          {/* Appointments List */}
          {!loading && (
            <div className="space-y-4">
              {filteredAppointments.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
                  <p className="text-gray-600">
                    {filters.search || filters.status || filters.mode 
                      ? 'Try adjusting your filters to see more results.'
                      : 'No appointments have been scheduled yet.'
                    }
                  </p>
                </div>
              ) : (
                filteredAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    showPatientInfo={true}
                    showCaregiverInfo={true}
                    onStatusUpdate={handleStatusUpdate}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}