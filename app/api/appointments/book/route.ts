import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      caregiverId,
      patientId,
      mode, // 'online' | 'home_visit' | 'offline'
      startTime,
      endTime,
      symptoms = [],
      homeVisitAddress,
      homeVisitLatitude,
      homeVisitLongitude,
      notes,
    } = body;

    if (!caregiverId || !patientId || !mode || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get caregiver details for pricing
    const { data: caregiver, error: caregiverError } = await supabase
      .from('caregivers')
      .select('consultation_fee, home_visit_fee, available_for_online, available_for_home_visits')
      .eq('id', caregiverId)
      .single();

    if (caregiverError || !caregiver) {
      return NextResponse.json(
        { error: 'Caregiver not found' },
        { status: 404 }
      );
    }

    // Check availability
    if (mode === 'online' && !caregiver.available_for_online) {
      return NextResponse.json(
        { error: 'Caregiver not available for online consultations' },
        { status: 400 }
      );
    }

    if (mode === 'home_visit' && !caregiver.available_for_home_visits) {
      return NextResponse.json(
        { error: 'Caregiver not available for home visits' },
        { status: 400 }
      );
    }

    // Calculate payment amount
    let paymentAmount = 0;
    let paymentRequired = false;

    if (mode === 'online' && caregiver.consultation_fee > 0) {
      paymentAmount = caregiver.consultation_fee;
      paymentRequired = true;
    } else if (mode === 'home_visit' && caregiver.home_visit_fee > 0) {
      paymentAmount = caregiver.home_visit_fee;
      paymentRequired = true;
    }

    // Create appointment
    const appointmentData = {
      patient_id: patientId,
      caregiver_id: caregiverId,
      mode,
      status: 'requested',
      start_time: startTime,
      end_time: endTime,
      symptoms,
      payment_required: paymentRequired,
      payment_amount: paymentAmount,
      payment_status: paymentRequired ? 'pending' : 'paid',
      ...(homeVisitAddress && { home_visit_address: homeVisitAddress }),
      ...(homeVisitLatitude && { home_visit_latitude: homeVisitLatitude }),
      ...(homeVisitLongitude && { home_visit_longitude: homeVisitLongitude }),
      ...(notes && { notes_encrypted: Buffer.from(notes) }),
    };

    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .insert(appointmentData)
      .select()
      .single();

    if (appointmentError) {
      console.error('Failed to create appointment:', appointmentError);
      return NextResponse.json(
        { error: 'Failed to create appointment' },
        { status: 500 }
      );
    }

    // Get caregiver user details for notification
    const { data: caregiverUser } = await supabase
      .from('caregivers')
      .select(`
        user_id,
        users!inner(
          first_name,
          last_name
        )
      `)
      .eq('id', caregiverId)
      .single();

    // Create notification for caregiver
    if (caregiverUser) {
      await supabase
        .from('notifications')
        .insert({
          user_id: caregiverUser.user_id,
          type: 'appointment_confirm',
          title: 'New Appointment Request',
          message: `You have a new ${mode.replace('_', ' ')} appointment request.`,
          channels: ['in_app'],
          metadata: {
            appointmentId: appointment.id,
            mode,
            symptoms,
          },
        });
    }

    // Get patient details for notification
    const { data: patientUser } = await supabase
      .from('patients')
      .select(`
        user_id,
        users!inner(
          first_name,
          last_name
        )
      `)
      .eq('id', patientId)
      .single();

    // Create notification for patient
    if (patientUser) {
      await supabase
        .from('notifications')
        .insert({
          user_id: patientUser.user_id,
          type: 'appointment_confirm',
          title: 'Appointment Request Submitted',
          message: paymentRequired 
            ? 'Your appointment request has been submitted. Please complete payment to confirm.'
            : 'Your appointment request has been submitted successfully.',
          channels: ['in_app'],
          metadata: {
            appointmentId: appointment.id,
            paymentRequired,
            paymentAmount,
          },
        });
    }

    return NextResponse.json({
      success: true,
      appointment,
      paymentRequired,
      paymentAmount,
    });

  } catch (error) {
    console.error('Booking API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}