import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      // For demo purposes, return sample data even if not authenticated
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      
      const { data: sampleData, error: sampleError } = await supabaseAdmin
        .from('progress_tracking')
        .select('completion_percentage, date')
        .order('date', { ascending: false })
        .limit(15);

      if (sampleError) {
        return NextResponse.json(
          { success: false, error: 'Failed to fetch sample data' },
          { status: 500 }
        );
      }

      const transformedProgress = sampleData?.map(progress => ({
        completion_percentage: parseFloat(progress.completion_percentage) || 0,
        date: progress.date
      })) || [];

      const stats = {
        totalEntries: transformedProgress.length,
        averageCompletion: transformedProgress.length > 0 
          ? transformedProgress.reduce((sum, item) => sum + item.completion_percentage, 0) / transformedProgress.length
          : 0,
        bestDay: transformedProgress.length > 0 
          ? Math.max(...transformedProgress.map(item => item.completion_percentage))
          : 0
      };

      return NextResponse.json({
        success: true,
        data: transformedProgress,
        stats,
        count: transformedProgress.length,
        demo: true
      });
    }

    // Try to get patient ID from the user, but if not found, return sample data for demo
    const { data: patientData, error: patientError } = await supabase
      .from('patients')
      .select('id')
      .eq('user_id', user.id)
      .single();

    let progressData = [];

    if (patientData && !patientError) {
      // Fetch progress tracking data for the specific patient
      const { data: userProgressData, error: progressError } = await supabase
        .from('progress_tracking')
        .select('completion_percentage, date')
        .eq('patient_id', patientData.id)
        .order('date', { ascending: false });

      if (!progressError && userProgressData) {
        progressData = userProgressData;
      }
    }

    // If no user-specific data found, get sample data for demo purposes
    if (progressData.length === 0) {
      const { data: sampleData, error: sampleError } = await supabase
        .from('progress_tracking')
        .select('completion_percentage, date')
        .order('date', { ascending: false })
        .limit(15);

      if (!sampleError && sampleData) {
        progressData = sampleData;
      }
    }

    // Transform the data - only keep completion_percentage and date
    const transformedProgress = progressData?.map(progress => ({
      completion_percentage: parseFloat(progress.completion_percentage) || 0,
      date: progress.date
    })) || [];



    // Calculate simple statistics
    const stats = {
      totalEntries: transformedProgress.length,
      averageCompletion: transformedProgress.length > 0 
        ? transformedProgress.reduce((sum, item) => sum + item.completion_percentage, 0) / transformedProgress.length
        : 0,
      bestDay: transformedProgress.length > 0 
        ? Math.max(...transformedProgress.map(item => item.completion_percentage))
        : 0
    };

    return NextResponse.json({
      success: true,
      data: transformedProgress,
      stats,
      count: transformedProgress.length
    });

  } catch (error) {
    console.error('Progress API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { patient_id, checklist_type, checklist_items, completion_percentage, date } = body;

    // Validate required fields
    if (!patient_id || !checklist_type || !checklist_items) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create new progress entry
    const { data: progress, error: progressError } = await supabase
      .from('progress_tracking')
      .insert({
        patient_id,
        checklist_type,
        checklist_items,
        completion_percentage: completion_percentage || 0,
        date: date || new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (progressError) {
      console.error('Error creating progress entry:', progressError);
      return NextResponse.json(
        { success: false, error: 'Failed to create progress entry' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: progress,
      message: 'Progress entry created successfully'
    });

  } catch (error) {
    console.error('Create progress API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}