"use client";

import { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  CreditCard, 
  Stethoscope,
  Home,
  Monitor,
  Building,
  CheckCircle,
  XCircle,
  AlertCircle,
  PlayCircle
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

interface AppointmentCardProps {
  appointment: AppointmentData;
  showPatientInfo?: boolean;
  showCaregiverInfo?: boolean;
  onStatusUpdate?: (appointmentId: string, newStatus: string) => void;
}

export function AppointmentCard({ 
  appointment, 
  showPatientInfo = true, 
  showCaregiverInfo = true,
  onStatusUpdate 
}: AppointmentCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'requested':
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'confirmed':
        return <Calendar className="w-4 h-4" />;
      case 'in_progress':
        return <PlayCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      case 'requested':
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'online':
        return <Monitor className="w-4 h-4" />;
      case 'home_visit':
        return <Home className="w-4 h-4" />;
      case 'offline':
      default:
        return <Building className="w-4 h-4" />;
    }
  };

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'online':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'home_visit':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'offline':
      default:
        return 'bg-purple-50 text-purple-700 border-purple-200';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
      default:
        return 'bg-orange-100 text-orange-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatSymptoms = (symptoms: string[]) => {
    return symptoms.map(symptom => 
      symptom.replace(/-/g, ' ').replace(/_/g, ' ')
    ).join(', ');
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(appointment.status)}`}>
            {getStatusIcon(appointment.status)}
            <span className="capitalize">{appointment.status.replace('_', ' ')}</span>
          </div>
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium border ${getModeColor(appointment.mode)}`}>
            {getModeIcon(appointment.mode)}
            <span className="capitalize">{appointment.mode.replace('_', ' ')}</span>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-500 hover:text-gray-700 text-sm font-medium"
        >
          {isExpanded ? 'Less' : 'More'}
        </button>
      </div>

      {/* Main Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
        {/* Patient Info */}
        {showPatientInfo && (
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>Patient</span>
            </h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p className="font-medium">{appointment.patient_name || 'Unknown Patient'}</p>
              {appointment.patient_age && (
                <p>Age: {appointment.patient_age} years</p>
              )}
              {appointment.patient_gender && (
                <p>Gender: {appointment.patient_gender}</p>
              )}
              {appointment.patient_blood_group && (
                <p>Blood Group: {appointment.patient_blood_group}</p>
              )}
              {isExpanded && (
                <>
                  {appointment.patient_email && (
                    <p className="flex items-center space-x-1">
                      <Mail className="w-3 h-3" />
                      <span>{appointment.patient_email}</span>
                    </p>
                  )}
                  {appointment.patient_phone && (
                    <p className="flex items-center space-x-1">
                      <Phone className="w-3 h-3" />
                      <span>{appointment.patient_phone}</span>
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Caregiver Info */}
        {showCaregiverInfo && (
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
              <Stethoscope className="w-4 h-4" />
              <span>Caregiver</span>
            </h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p className="font-medium">{appointment.caregiver_name || 'Unknown Caregiver'}</p>
              <p className="capitalize">{appointment.caregiver_type}</p>
              <p>{appointment.caregiver_experience} years experience</p>
              {appointment.caregiver_specializations.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {appointment.caregiver_specializations.slice(0, 2).map((spec, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {spec}
                    </span>
                  ))}
                  {appointment.caregiver_specializations.length > 2 && (
                    <span className="text-xs text-gray-500">
                      +{appointment.caregiver_specializations.length - 2} more
                    </span>
                  )}
                </div>
              )}
              {isExpanded && (
                <>
                  {appointment.caregiver_email && (
                    <p className="flex items-center space-x-1">
                      <Mail className="w-3 h-3" />
                      <span>{appointment.caregiver_email}</span>
                    </p>
                  )}
                  {appointment.caregiver_phone && (
                    <p className="flex items-center space-x-1">
                      <Phone className="w-3 h-3" />
                      <span>{appointment.caregiver_phone}</span>
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Appointment Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2 text-sm">
          <Calendar className="w-4 h-4 text-gray-500" />
          <div>
            <p className="font-medium">Date</p>
            <p className="text-gray-600">{formatDate(appointment.start_time)}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <Clock className="w-4 h-4 text-gray-500" />
          <div>
            <p className="font-medium">Time</p>
            <p className="text-gray-600">
              {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <CreditCard className="w-4 h-4 text-gray-500" />
          <div>
            <p className="font-medium">Payment</p>
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">₹{appointment.payment_amount}</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getPaymentStatusColor(appointment.payment_status)}`}>
                {appointment.payment_status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Symptoms */}
      {appointment.symptoms && appointment.symptoms.length > 0 && (
        <div className="mb-4">
          <h4 className="font-medium text-gray-900 mb-2">Symptoms</h4>
          <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            {formatSymptoms(appointment.symptoms)}
          </p>
        </div>
      )}

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t pt-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-gray-900">Appointment ID</p>
              <p className="text-gray-600 font-mono text-xs">{appointment.id}</p>
            </div>
            <div>
              <p className="font-medium text-gray-900">Created</p>
              <p className="text-gray-600">{formatDate(appointment.created_at)}</p>
            </div>
            <div>
              <p className="font-medium text-gray-900">Consultation Fee</p>
              <p className="text-gray-600">₹{appointment.consultation_fee}</p>
            </div>
            <div>
              <p className="font-medium text-gray-900">Home Visit Fee</p>
              <p className="text-gray-600">₹{appointment.home_visit_fee}</p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {onStatusUpdate && appointment.status === 'requested' && (
        <div className="flex space-x-2 mt-4 pt-4 border-t">
          <button
            onClick={() => onStatusUpdate(appointment.id, 'confirmed')}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Confirm
          </button>
          <button
            onClick={() => onStatusUpdate(appointment.id, 'cancelled')}
            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}