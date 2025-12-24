import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      appointmentId,
      userId,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing payment verification data' },
        { status: 400 }
      );
    }

    // Verify signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature !== expectedSign) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    // Update appointment payment status
    const { error: appointmentError } = await supabase
      .from('appointments')
      .update({
        payment_status: 'paid',
        razorpay_payment_id,
        status: 'confirmed',
      })
      .eq('id', appointmentId);

    if (appointmentError) {
      console.error('Failed to update appointment:', appointmentError);
      return NextResponse.json(
        { error: 'Failed to update appointment' },
        { status: 500 }
      );
    }

    // Update finance log
    const { error: financeError } = await supabase
      .from('finance_log')
      .update({
        status: 'completed',
        razorpay_payment_id,
      })
      .eq('razorpay_order_id', razorpay_order_id);

    if (financeError) {
      console.error('Failed to update finance log:', financeError);
    }

    // Create notification for the caregiver
    const { data: appointment } = await supabase
      .from('appointments')
      .select(`
        caregiver_id,
        caregivers!inner(
          user_id
        )
      `)
      .eq('id', appointmentId)
      .single();

    if (appointment) {
      await supabase
        .from('notifications')
        .insert({
          user_id: appointment.caregivers.user_id,
          type: 'appointment_confirm',
          title: 'New Appointment Booked',
          message: 'A patient has booked and paid for an appointment with you.',
          channels: ['in_app'],
          metadata: {
            appointmentId,
            paymentId: razorpay_payment_id,
          },
        });
    }

    // Generate receipt
    const receiptNumber = `RCT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    const { data: financeLog } = await supabase
      .from('finance_log')
      .select('id, amount')
      .eq('razorpay_order_id', razorpay_order_id)
      .single();

    if (financeLog) {
      await supabase
        .from('receipts')
        .insert({
          finance_log_id: financeLog.id,
          receipt_number: receiptNumber,
          pdf_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/receipts/${receiptNumber}.pdf`,
        });
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      receiptNumber,
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Payment verification failed' },
      { status: 500 }
    );
  }
}