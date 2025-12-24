import { NextRequest, NextResponse } from 'next/server';
import { verifyPaymentSignature } from '@/lib/razorpay';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      appointmentId 
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !appointmentId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify payment signature
    const isValidSignature = verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValidSignature) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    // Update appointment payment status
    const { error: updateError } = await supabase
      .from('appointments')
      .update({
        payment_status: 'paid',
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        status: 'confirmed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', appointmentId);

    if (updateError) {
      console.error('Failed to update appointment:', updateError);
      return NextResponse.json(
        { error: 'Failed to update appointment status' },
        { status: 500 }
      );
    }

    // Get appointment details for notifications
    const { data: appointment } = await supabase
      .from('appointments')
      .select(`
        *,
        caregiver:caregivers(
          user_id,
          users!inner(first_name, last_name)
        ),
        patient:patients(
          user_id,
          users!inner(first_name, last_name)
        )
      `)
      .eq('id', appointmentId)
      .single();

    // Send confirmation notifications
    if (appointment) {
      // Notify caregiver
      if (appointment.caregiver?.user_id) {
        await supabase
          .from('notifications')
          .insert({
            user_id: appointment.caregiver.user_id,
            type: 'appointment_confirmed',
            title: 'Appointment Confirmed',
            message: `Payment received for your ${appointment.mode.replace('_', ' ')} appointment.`,
            channels: ['in_app'],
            metadata: {
              appointmentId: appointment.id,
              paymentId: razorpay_payment_id,
            },
          });
      }

      // Notify patient
      if (appointment.patient?.user_id) {
        await supabase
          .from('notifications')
          .insert({
            user_id: appointment.patient.user_id,
            type: 'appointment_confirmed',
            title: 'Payment Successful',
            message: `Your appointment has been confirmed. Payment ID: ${razorpay_payment_id}`,
            channels: ['in_app'],
            metadata: {
              appointmentId: appointment.id,
              paymentId: razorpay_payment_id,
            },
          });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified and appointment confirmed',
      paymentId: razorpay_payment_id,
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Payment verification failed' },
      { status: 500 }
    );
  }
}