/**
 * Razorpay Payment Integration
 * Handles order creation and payment processing
 */

import Razorpay from 'razorpay';
import crypto from 'crypto';

// Server-side Razorpay instance (use in API routes only)
export const razorpayInstance = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// Payment order interface
export interface PaymentOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
  created_at: number;
}

// Create payment order (server-side)
export const createPaymentOrder = async (
  amount: number, // in paise (INR * 100)
  currency: string = 'INR',
  receipt: string,
  notes?: Record<string, string>
): Promise<PaymentOrder> => {
  try {
    const order = await razorpayInstance.orders.create({
      amount,
      currency,
      receipt,
      notes,
    });

    return order as PaymentOrder;
  } catch (error) {
    console.error('Razorpay order creation failed:', error);
    throw new Error('Failed to create payment order');
  }
};

// Verify payment signature (server-side)
export const verifyPaymentSignature = (
  orderId: string,
  paymentId: string,
  signature: string
): boolean => {
  try {
    const body = orderId + '|' + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest('hex');

    return expectedSignature === signature;
  } catch (error) {
    console.error('Signature verification failed:', error);
    return false;
  }
};

// Client-side payment options
export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

// Client-side payment processing
export const processPayment = (options: RazorpayOptions): Promise<RazorpayResponse> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Razorpay can only be used in browser'));
      return;
    }

    // Load Razorpay script if not already loaded
    if (!window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => initializePayment();
      script.onerror = () => reject(new Error('Failed to load Razorpay script'));
      document.head.appendChild(script);
    } else {
      initializePayment();
    }

    function initializePayment() {
      const rzp = new window.Razorpay({
        ...options,
        handler: (response: RazorpayResponse) => {
          resolve(response);
        },
        modal: {
          ...options.modal,
          ondismiss: () => {
            reject(new Error('Payment cancelled by user'));
            options.modal?.ondismiss?.();
          },
        },
      });

      rzp.open();
    }
  });
};

// Payment utilities
export const formatAmount = (amount: number): string => {
  return (amount / 100).toFixed(2);
};

export const convertToRazorpayAmount = (amount: number): number => {
  return Math.round(amount * 100); // Convert to paise
};

// Payment status types
export type PaymentStatus = 'created' | 'authorized' | 'captured' | 'refunded' | 'failed';

// Refund interface
export interface RefundRequest {
  payment_id: string;
  amount?: number; // Optional for partial refund
  notes?: Record<string, string>;
}

// Process refund (server-side)
export const processRefund = async (refundRequest: RefundRequest) => {
  try {
    const refund = await razorpayInstance.payments.refund(
      refundRequest.payment_id,
      {
        amount: refundRequest.amount,
        notes: refundRequest.notes,
      }
    );

    return refund;
  } catch (error) {
    console.error('Refund processing failed:', error);
    throw new Error('Failed to process refund');
  }
};

// Fetch payment details (server-side)
export const getPaymentDetails = async (paymentId: string) => {
  try {
    const payment = await razorpayInstance.payments.fetch(paymentId);
    return payment;
  } catch (error) {
    console.error('Failed to fetch payment details:', error);
    throw new Error('Failed to fetch payment details');
  }
};

// Note: React hooks moved to separate client component file

// Webhook event types
export interface RazorpayWebhookEvent {
  entity: string;
  account_id: string;
  event: string;
  contains: string[];
  payload: {
    payment: {
      entity: any;
    };
    order?: {
      entity: any;
    };
  };
  created_at: number;
}

// Webhook signature verification
export const verifyWebhookSignature = (
  body: string,
  signature: string,
  secret: string
): boolean => {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    return expectedSignature === signature;
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return false;
  }
};

// Payment receipt data
export interface PaymentReceipt {
  receiptNumber: string;
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
  patientName: string;
  caregiverName: string;
  appointmentDate: string;
  paymentDate: string;
  description: string;
}

// Generate receipt number
export const generateReceiptNumber = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `HPW-${timestamp}-${random}`;
};

// Declare Razorpay global type
declare global {
  interface Window {
    Razorpay: any;
  }
}