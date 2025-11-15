import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { supabase } from '@/lib/supabaseClient';

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, currency = 'INR', appointmentId, userId } = body;

    if (!amount || !appointmentId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, appointmentId, userId' },
        { status: 400 }
      );
    }

    // Create Razorpay order
    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency,
      receipt: `receipt_${appointmentId}_${Date.now()}`,
      notes: {
        appointmentId,
        userId,
      },
    };

    const order = await razorpay.orders.create(options);

    // Update appointment with Razorpay order ID
    const { error: updateError } = await supabase
      .from('appointments')
      .update({
        razorpay_order_id: order.id,
        payment_amount: amount,
        payment_status: 'pending',
      })
      .eq('id', appointmentId);

    if (updateError) {
      console.error('Failed to update appointment:', updateError);
      return NextResponse.json(
        { error: 'Failed to update appointment' },
        { status: 500 }
      );
    }

    // Log the transaction
    await supabase
      .from('finance_log')
      .insert({
        user_id: userId,
        appointment_id: appointmentId,
        transaction_type: 'payment',
        amount,
        currency,
        razorpay_order_id: order.id,
        status: 'pending',
        description: `Payment for appointment ${appointmentId}`,
      });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });

  } catch (error) {
    console.error('Payment order creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment order' },
      { status: 500 }
    );
  }
}