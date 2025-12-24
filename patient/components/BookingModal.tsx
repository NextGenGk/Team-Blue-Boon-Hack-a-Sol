"use client";

import { useState } from "react";
import { X, Video, Home, Calendar, Clock, User, MapPin, CreditCard } from "lucide-react";
import { Caregiver } from "@/lib/supabaseClient";
import { useEnhancedSupabase } from "@/components/EnhancedSupabaseProvider";
import { useRazorpayPayment } from "@/hooks/useRazorpayPayment";
import toast from "react-hot-toast";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  caregiver: Caregiver;
}

interface BookingFormData {
  mode: 'online' | 'home_visit';
  date: string;
  time: string;
  symptoms: string[];
  notes: string;
  homeVisitAddress?: string;
}

export function BookingModal({ isOpen, onClose, caregiver }: BookingModalProps) {
  const { user } = useEnhancedSupabase();
  const { initiatePayment, isProcessing } = useRazorpayPayment();

  const [step, setStep] = useState<'mode' | 'details' | 'payment'>('mode');
  const [formData, setFormData] = useState<BookingFormData>({
    mode: 'online',
    date: '',
    time: '',
    symptoms: [],
    notes: '',
  });
  const [isBooking, setIsBooking] = useState(false);

  if (!isOpen) return null;

  const caregiverName = caregiver.name ||
    `${caregiver.first_name || ""} ${caregiver.last_name || ""}`.trim() ||
    "Healthcare Provider";

  const getConsultationFee = () => {
    return formData.mode === 'online'
      ? caregiver.consultation_fee || 0
      : caregiver.home_visit_fee || 0;
  };

  const handleModeSelection = (mode: 'online' | 'home_visit') => {
    setFormData(prev => ({ ...prev, mode }));
    setStep('details');
  };

  const handleDetailsSubmit = () => {
    if (!formData.date || !formData.time) {
      toast.error("Please select date and time");
      return;
    }

    const fee = getConsultationFee();
    if (fee > 0) {
      setStep('payment');
    } else {
      handleBookingSubmit();
    }
  };

  const handleBookingSubmit = async () => {
    setIsBooking(true);

    try {
      // Create appointment
      const appointmentData = {
        caregiverId: caregiver.id,
        patientId: user?.id,
        mode: formData.mode,
        startTime: `${formData.date}T${formData.time}:00`,
        endTime: `${formData.date}T${String(parseInt(formData.time.split(':')[0]) + 1).padStart(2, '0')}:${formData.time.split(':')[1]}:00`,
        symptoms: formData.symptoms,
        notes: formData.notes,
        ...(formData.mode === 'home_visit' && formData.homeVisitAddress && {
          homeVisitAddress: formData.homeVisitAddress
        })
      };

      const response = await fetch('/api/appointments/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to book appointment');
      }

      if (result.paymentRequired) {
        // Create Razorpay order
        const orderResponse = await fetch('/api/razorpay/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: result.paymentAmount,
            appointmentId: result.appointment.id,
            description: `${formData.mode === 'online' ? 'Online' : 'Home Visit'} consultation with ${caregiverName}`,
          }),
        });

        const orderResult = await orderResponse.json();

        if (!orderResponse.ok) {
          throw new Error(orderResult.error || 'Failed to create payment order');
        }

        // Initiate Razorpay payment
        const paymentResponse = await initiatePayment({
          amount: orderResult.order.amount,
          description: orderResult.order.notes.description,
          orderId: orderResult.order.id,
          patientName: user?.first_name + ' ' + user?.last_name,
          patientEmail: user?.email,
          patientPhone: user?.phone,
        });

        // Verify payment on server
        const verifyResponse = await fetch('/api/razorpay/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id: paymentResponse.razorpay_order_id,
            razorpay_payment_id: paymentResponse.razorpay_payment_id,
            razorpay_signature: paymentResponse.razorpay_signature,
            appointmentId: result.appointment.id,
          }),
        });

        if (!verifyResponse.ok) {
          throw new Error('Payment verification failed');
        }

        toast.success("Payment completed! Appointment booked successfully.");
      } else {
        toast.success("Appointment booked successfully!");
      }

      onClose();

    } catch (error) {
      console.error('Booking error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to book appointment');
    } finally {
      setIsBooking(false);
    }
  };

  const renderModeSelection = () => (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
        Choose Consultation Type
      </h2>

      <div className="space-y-4">
        {caregiver.available_for_online && (
          <button
            onClick={() => handleModeSelection('online')}
            className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all duration-200 text-left"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Video className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">Online Consultation</h3>
                <p className="text-sm text-gray-600">Video call consultation from home</p>
                <p className="text-lg font-bold text-green-600 mt-1">
                  ₹{caregiver.consultation_fee || 0}
                </p>
              </div>
            </div>
          </button>
        )}

        {caregiver.available_for_home_visits && (
          <button
            onClick={() => handleModeSelection('home_visit')}
            className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-left"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Home className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">Home Visit</h3>
                <p className="text-sm text-gray-600">Doctor visits your location</p>
                <p className="text-lg font-bold text-blue-600 mt-1">
                  ₹{caregiver.home_visit_fee || 0}
                </p>
              </div>
            </div>
          </button>
        )}
      </div>
    </div>
  );

  const renderDetailsForm = () => (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <button
          onClick={() => setStep('mode')}
          className="mr-4 p-2 hover:bg-gray-100 rounded-full"
        >
          ←
        </button>
        <h2 className="text-xl font-semibold text-gray-800">
          Appointment Details
        </h2>
      </div>

      <div className="space-y-4">
        {/* Selected Mode Display */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center space-x-2">
            {formData.mode === 'online' ? (
              <Video className="w-5 h-5 text-green-600" />
            ) : (
              <Home className="w-5 h-5 text-blue-600" />
            )}
            <span className="font-medium">
              {formData.mode === 'online' ? 'Online Consultation' : 'Home Visit'}
            </span>
            <span className="ml-auto font-bold text-green-600">
              ₹{getConsultationFee()}
            </span>
          </div>
        </div>

        {/* Date Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-2" />
            Select Date
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            min={new Date().toISOString().split('T')[0]}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* Time Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Clock className="w-4 h-4 inline mr-2" />
            Select Time
          </label>
          <input
            type="time"
            value={formData.time}
            onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* Home Visit Address */}
        {formData.mode === 'home_visit' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-2" />
              Home Address
            </label>
            <textarea
              value={formData.homeVisitAddress || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, homeVisitAddress: e.target.value }))}
              placeholder="Enter your complete address for home visit"
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        )}

        {/* Symptoms */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Symptoms (Optional)
          </label>
          <textarea
            value={formData.symptoms.join(', ')}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              symptoms: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
            }))}
            placeholder="Describe your symptoms..."
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Notes (Optional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Any additional information..."
            rows={2}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <button
          onClick={handleDetailsSubmit}
          className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );

  const renderPaymentStep = () => (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <button
          onClick={() => setStep('details')}
          className="mr-4 p-2 hover:bg-gray-100 rounded-full"
        >
          ←
        </button>
        <h2 className="text-xl font-semibold text-gray-800">
          Payment
        </h2>
      </div>

      <div className="space-y-4">
        {/* Appointment Summary */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-3">Appointment Summary</h3>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Doctor:</span>
              <span className="font-medium">{caregiverName}</span>
            </div>
            <div className="flex justify-between">
              <span>Type:</span>
              <span className="font-medium">
                {formData.mode === 'online' ? 'Online Consultation' : 'Home Visit'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Date & Time:</span>
              <span className="font-medium">
                {new Date(formData.date).toLocaleDateString()} at {formData.time}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2 mt-2">
              <span className="font-semibold">Total Amount:</span>
              <span className="font-bold text-green-600">₹{getConsultationFee()}</span>
            </div>
          </div>
        </div>

        {/* Payment Button */}
        <button
          onClick={handleBookingSubmit}
          disabled={isBooking || isProcessing}
          className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          <CreditCard className="w-5 h-5" />
          <span>
            {isBooking || isProcessing ? 'Processing...' : `Pay ₹${getConsultationFee()}`}
          </span>
        </button>

        <p className="text-xs text-gray-500 text-center">
          Secure payment powered by Razorpay
        </p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="relative p-4 border-b border-gray-200">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">{caregiverName}</h3>
              <p className="text-sm text-gray-600">
                {caregiver.type?.charAt(0).toUpperCase() + caregiver.type?.slice(1)}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        {step === 'mode' && renderModeSelection()}
        {step === 'details' && renderDetailsForm()}
        {step === 'payment' && renderPaymentStep()}
      </div>
    </div>
  );
}