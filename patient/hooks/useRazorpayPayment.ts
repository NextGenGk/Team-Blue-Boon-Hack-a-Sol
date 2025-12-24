"use client";

import { useState } from 'react';
import { processPayment, RazorpayOptions, RazorpayResponse } from '@/lib/razorpay';

// React hook for payment processing
export const useRazorpayPayment = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initiatePayment = async (
    orderDetails: {
      amount: number;
      description: string;
      orderId: string;
      patientName?: string;
      patientEmail?: string;
      patientPhone?: string;
    }
  ): Promise<RazorpayResponse> => {
    setIsProcessing(true);
    setError(null);

    try {
      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: orderDetails.amount,
        currency: 'INR',
        name: 'HealthPWA',
        description: orderDetails.description,
        order_id: orderDetails.orderId,
        handler: () => {}, // Will be overridden by processPayment
        prefill: {
          name: orderDetails.patientName,
          email: orderDetails.patientEmail,
          contact: orderDetails.patientPhone,
        },
        theme: {
          color: '#10B981', // Health green color
        },
      };

      const response = await processPayment(options);
      setIsProcessing(false);
      return response;
    } catch (error) {
      setIsProcessing(false);
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      setError(errorMessage);
      throw error;
    }
  };

  return {
    initiatePayment,
    isProcessing,
    error,
    clearError: () => setError(null),
  };
};