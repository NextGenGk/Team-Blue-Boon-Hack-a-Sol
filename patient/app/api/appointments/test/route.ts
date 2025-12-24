import { NextRequest, NextResponse } from 'next/server';

// Your sample data
const sampleAppointments = [
  {"idx":0,"id":"060c4e51-9f77-4ff1-9f39-f02c6b8b3c1f","patient_id":"63f49c02-6df0-47dd-82f4-e8f078319c75","caregiver_id":"5ae6fe4f-2349-4dc0-95f1-5ee793c095db","mode":"offline","status":"requested","start_time":"2025-11-23 04:05:12.685076+00","end_time":"2025-11-16 04:35:12.685076+00","notes_encrypted":null,"symptoms":["pregnancy-fatigue"],"home_visit_address":null,"home_visit_latitude":null,"home_visit_longitude":null,"payment_required":true,"payment_amount":"212.00","payment_status":"pending","razorpay_order_id":null,"razorpay_payment_id":null,"zego_room_id":null,"created_at":"2025-11-15 04:05:12.685076+00","updated_at":"2025-11-15 04:05:12.685076+00"},
  {"idx":1,"id":"073a7d77-e44b-4fec-8f06-1b1e468cc392","patient_id":"025391ec-aea5-4da5-adb7-b86338dd896a","caregiver_id":"0a61eee5-f92b-4e29-a604-28898ee86483","mode":"online","status":"completed","start_time":"2025-11-15 05:40:40.961+00","end_time":"2025-11-15 05:48:02.02+00","notes_encrypted":null,"symptoms":["cold"],"home_visit_address":null,"home_visit_latitude":null,"home_visit_longitude":null,"payment_required":true,"payment_amount":"800.00","payment_status":"paid","razorpay_order_id":null,"razorpay_payment_id":null,"zego_room_id":"073a7d77-e44b-4fec-8f06-1b1e468cc392","created_at":"2025-11-15 05:40:44.196767+00","updated_at":"2025-11-15 05:48:04.117444+00"},
  {"idx":2,"id":"0889e288-e4ee-434b-9239-d5726dd7607a","patient_id":"c5e8685d-5a73-4599-bbb1-fbf4cc340215","caregiver_id":"5ae6fe4f-2349-4dc0-95f1-5ee793c095db","mode":"home_visit","status":"requested","start_time":"2025-11-18 04:05:12.685076+00","end_time":"2025-11-19 04:35:12.685076+00","notes_encrypted":null,"symptoms":["headache"],"home_visit_address":null,"home_visit_latitude":null,"home_visit_longitude":null,"payment_required":true,"payment_amount":"212.00","payment_status":"pending","razorpay_order_id":null,"razorpay_payment_id":null,"zego_room_id":null,"created_at":"2025-11-15 04:05:12.685076+00","updated_at":"2025-11-15 04:05:12.685076+00"},
  {"idx":3,"id":"0adde461-f044-447d-83c4-a71f8879f37b","patient_id":"fe1dab01-83a6-405c-b8ad-9f26fd5286f2","caregiver_id":"5ae6fe4f-2349-4dc0-95f1-5ee793c095db","mode":"offline","status":"requested","start_time":"2025-11-20 04:05:12.685076+00","end_time":"2025-11-25 04:35:12.685076+00","notes_encrypted":null,"symptoms":["anxiety"],"home_visit_address":null,"home_visit_latitude":null,"home_visit_longitude":null,"payment_required":true,"payment_amount":"212.00","payment_status":"pending","razorpay_order_id":null,"razorpay_payment_id":null,"zego_room_id":null,"created_at":"2025-11-15 04:05:12.685076+00","updated_at":"2025-11-15 04:05:12.685076+00"},
  {"idx":4,"id":"0ea4b606-1c0f-4f09-ae89-f18a08d1cbf4","patient_id":"4d6976d2-908b-4b77-96aa-3822ac146664","caregiver_id":"5ae6fe4f-2349-4dc0-95f1-5ee793c095db","mode":"online","status":"requested","start_time":"2025-11-25 04:05:12.685076+00","end_time":"2025-11-26 04:35:12.685076+00","notes_encrypted":null,"symptoms":["headache"],"home_visit_address":null,"home_visit_latitude":null,"home_visit_longitude":null,"payment_required":true,"payment_amount":"212.00","payment_status":"pending","razorpay_order_id":null,"razorpay_payment_id":null,"zego_room_id":null,"created_at":"2025-11-15 04:05:12.685076+00","updated_at":"2025-11-15 04:05:12.685076+00"}
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const mode = searchParams.get('mode');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Filter the sample data
    let filteredAppointments = [...sampleAppointments];

    if (status) {
      filteredAppointments = filteredAppointments.filter(apt => apt.status === status);
    }

    if (mode) {
      filteredAppointments = filteredAppointments.filter(apt => apt.mode === mode);
    }

    // Apply pagination
    const paginatedAppointments = filteredAppointments.slice(offset, offset + limit);

    // Transform the data to match the expected format
    const transformedAppointments = paginatedAppointments.map((appointment) => ({
      ...appointment,
      patient_name: `Patient ${appointment.patient_id.slice(0, 8)}`,
      patient_email: `patient${appointment.idx}@example.com`,
      patient_phone: `+91 9${String(appointment.idx).padStart(3, '0')}000000`,
      patient_age: 25 + (appointment.idx % 40),
      patient_gender: appointment.idx % 2 === 0 ? 'male' : 'female',
      patient_blood_group: ['A+', 'B+', 'O+', 'AB+'][appointment.idx % 4],
      caregiver_name: `Dr. ${appointment.caregiver_id === '5ae6fe4f-2349-4dc0-95f1-5ee793c095db' ? 'Manju Nair' : 'Sarah Kumar'}`,
      caregiver_email: `caregiver${appointment.idx}@example.com`,
      caregiver_phone: `+91 8${String(appointment.idx).padStart(3, '0')}000000`,
      caregiver_type: 'nurse',
      caregiver_specializations: appointment.symptoms.includes('pregnancy-fatigue') 
        ? ['Pregnancy Care', 'Postnatal Care'] 
        : appointment.symptoms.includes('headache')
        ? ['General Care', 'Pain Management']
        : ['General Care'],
      caregiver_experience: 5 + (appointment.idx % 10),
      consultation_fee: appointment.mode === 'online' ? 500 : 0,
      home_visit_fee: appointment.mode === 'home_visit' ? parseInt(appointment.payment_amount) : 0
    }));

    return NextResponse.json({
      success: true,
      data: transformedAppointments,
      pagination: {
        total: filteredAppointments.length,
        limit,
        offset,
        hasMore: (offset + limit) < filteredAppointments.length
      },
      filters: { status, mode }
    });

  } catch (error) {
    console.error('Test appointments API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}