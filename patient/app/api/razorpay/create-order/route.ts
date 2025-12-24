import { NextRequest, NextResponse } from 'next/server';
import { createPaymentOrder, generateReceiptNumber } from '@/lib/razorpay';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, appointmentId, description } = body;

    if (!amount || !appointmentId || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate unique receipt number
    const receipt = generateReceiptNumber();

    // Create Razorpay order
    const order = await createPaymentOrder(
      amount * 100, // Convert to paise
      'INR',
      receipt,
      {
        appointmentId: appointmentId.toString(),
        description,
      }
    );

    return NextResponse.json({
      success: true,
      order,
    });

  } catch (error) {
    console.error('Razorpay order creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment order' },
      { status: 500 }
    );
  }
}