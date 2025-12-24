"use client";

import { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Video, 
  Home, 
  Building, 
  User, 
  Stethoscope,
  CreditCard,
  CheckCircle,
  AlertCircle,
  XCircle,
  Filter,
  Eye,
  Phone
} from 'lucide-react';
import toast from 'react-hot-toast';

interface AppointmentData {
  id: string;
  patient_id: string;
  caregiver_id: string;
  mode: 'online' | 'home_visit' | 'offline';
  status: 'requested' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  start_time: string;
  end_time: string;
  symptoms: string[];
  payment_amount: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  created_at: string;
  updated_at: string;
  patient_name?: string;
  patient_email?: string;
  patient_phone?: string;
  caregiver_name?: string;
  caregiver_type?: string;
  caregiver_specializations?: string[];
  caregiver_experience?: number;
  consultation_fee?: number;
  home_visit_fee?: number;
  patient_age?: number;
  patient_gender?: string;
  patient_blood_group?: string;
}

interface AppointmentsSectionProps {
  className?: string;
}

export function AppointmentsSection({ className = "" }: AppointmentsSectionProps) {
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedMode, setSelectedMode] = useState<string>('all');
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentData | null>(null);

  useEffect(() => {
    fetchAppointments();
  }, [selectedStatus, selectedMode]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (selectedStatus !== 'all') params.append('status', selectedStatus);
      if (selectedMode !== 'all') params.append('mode', selectedMode);
      params.append('limit', '50');

      const response = await fetch(`/api/appointments?${params}`);
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
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'confirmed':
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    }
  };

  const