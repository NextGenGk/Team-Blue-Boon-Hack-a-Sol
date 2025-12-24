import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/razorpay';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature (if webhook secret is configured)
    if (process.env.RAZORPAY_WEBHOOK_SECRET) {
      const isValidSignature = verifyWebhookSignature(
        body,
        signature,
        process.env.RAZORPAY_WEBHOOK_SECRET
      );

      if (!isValidSignature) {
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 400 }
        );
      }
    } else {
      console.warn('Razorpay webhook secret not configured - skipping signature verification');
    }

    const event = JSON.parse(body);

    // Handle different webhook events
    switch (event.event) {
      case 'payment.captured':
        await handlePaymentCaptured(event.payload.payment.entity);
        break;
      
      case 'payment.failed':
        await handlePaymentFailed(event.payload.payment.entity);
        break;
      
      case 'order.paid':
        await handleOrderPaid(event.payload.order.entity);
        break;
      
      default:
        console.log('Unhandled webhook event:', event.event);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentCaptured(payment: any) {
  try {
    // Find appointment by order ID
    const { data: appointment } = await supabase
      .from('appointments')
      .select('*')
      .eq('razorpay_order_id', payment.order_id)
      .single();

    if (appointment) {
      // Update payment status
      await supabase
        .from('appointments')
        .update({
          payment_status: 'captured',
          razorpay_payment_id: payment.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', appointment.id);

      console.log('Payment captured for appointment:', appointment.id);
    }
  } catch (error) {
    console.error('Error handling payment captured:', error);
  }
}

async function handlePaymentFailed(payment: any) {
  try {
    // Find appointment by order ID
    const { data: appointment } = await supabase
      .from('appointments')
      .select('*')
      .eq('razorpay_order_id', payment.order_id)
      .single();

    if (appointment) {
      // Update payment status
      await supabase
        .from('appointments')
        .update({
          payment_status: 'failed',
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', appointment.id);

      console.log('Payment failed for appointment:', appointment.id);
    }
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}

async function handleOrderPaid(order: any) {
  try {
    // Additional handling for order paid event if needed
    console.log('Order paid:', order.id);
  } catch (error) {
    console.error('Error handling order paid:', error);
  }
}