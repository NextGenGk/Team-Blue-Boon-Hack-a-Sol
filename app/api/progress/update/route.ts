import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      patientId,
      appointmentId,
      checklistType, // 'medication' | 'diet' | 'exercise' | 'vitals'
      completedItems,
      date = new Date().toISOString().split('T')[0],
    } = body;

    if (!patientId || !checklistType || !completedItems) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get existing progress tracking record
    const { data: existingProgress } = await supabase
      .from('progress_tracking')
      .select('*')
      .eq('patient_id', patientId)
      .eq('checklist_type', checklistType)
      .eq('date', date)
      .maybeSingle();

    let progressData;

    if (existingProgress) {
      // Update existing record
      const totalItems = existingProgress.checklist_items?.length || 0;
      const completedCount = completedItems.length;
      const completionPercentage = totalItems > 0 ? (completedCount / totalItems) * 100 : 0;

      const { data: updatedProgress, error: updateError } = await supabase
        .from('progress_tracking')
        .update({
          completed_items: completedItems,
          completion_percentage: Math.round(completionPercentage * 100) / 100,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingProgress.id)
        .select()
        .single();

      if (updateError) {
        console.error('Failed to update progress:', updateError);
        return NextResponse.json(
          { error: 'Failed to update progress' },
          { status: 500 }
        );
      }

      progressData = updatedProgress;
    } else {
      // Create new progress record
      const checklistItems = generateChecklistItems(checklistType);
      const totalItems = checklistItems.length;
      const completedCount = completedItems.length;
      const completionPercentage = totalItems > 0 ? (completedCount / totalItems) * 100 : 0;

      const { data: newProgress, error: insertError } = await supabase
        .from('progress_tracking')
        .insert({
          patient_id: patientId,
          appointment_id: appointmentId,
          checklist_type: checklistType,
          checklist_items: checklistItems,
          completed_items: completedItems,
          completion_percentage: Math.round(completionPercentage * 100) / 100,
          date,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Failed to create progress:', insertError);
        return NextResponse.json(
          { error: 'Failed to create progress record' },
          { status: 500 }
        );
      }

      progressData = newProgress;
    }

    // Get patient's assigned nurse for notification
    const { data: patient } = await supabase
      .from('patients')
      .select(`
        assigned_nurse_id,
        caregivers!inner(
          user_id
        )
      `)
      .eq('id', patientId)
      .single();

    // Notify assigned nurse about progress update
    if (patient?.caregivers?.user_id) {
      await supabase
        .from('notifications')
        .insert({
          user_id: patient.caregivers.user_id,
          type: 'diet_approved', // Using existing type for progress updates
          title: 'Patient Progress Updated',
          message: `Patient has updated their ${checklistType} checklist (${progressData.completion_percentage}% complete).`,
          channels: ['in_app'],
          metadata: {
            patientId,
            checklistType,
            completionPercentage: progressData.completion_percentage,
            progressId: progressData.id,
          },
        });
    }

    return NextResponse.json({
      success: true,
      progress: progressData,
    });

  } catch (error) {
    console.error('Progress update API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Generate default checklist items based on type
function generateChecklistItems(checklistType: string) {
  switch (checklistType) {
    case 'medication':
      return [
        { item: 'Morning medication', time: 'morning', completed: false },
        { item: 'Afternoon medication', time: 'afternoon', completed: false },
        { item: 'Evening medication', time: 'evening', completed: false },
      ];
    case 'diet':
      return [
        { item: 'Healthy breakfast', time: 'morning', completed: false },
        { item: 'Balanced lunch', time: 'afternoon', completed: false },
        { item: 'Light dinner', time: 'evening', completed: false },
        { item: 'Adequate water intake', time: 'all_day', completed: false },
      ];
    case 'exercise':
      return [
        { item: 'Morning walk', time: 'morning', completed: false },
        { item: 'Stretching exercises', time: 'afternoon', completed: false },
        { item: 'Breathing exercises', time: 'evening', completed: false },
      ];
    case 'vitals':
      return [
        { item: 'Blood pressure check', time: 'morning', completed: false },
        { item: 'Temperature check', time: 'morning', completed: false },
        { item: 'Weight measurement', time: 'morning', completed: false },
      ];
    default:
      return [
        { item: 'General health check', time: 'morning', completed: false },
      ];
  }
}