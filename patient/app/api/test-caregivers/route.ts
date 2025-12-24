import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Fetch caregivers with their image URLs
    const { data: caregivers, error } = await supabase
      .from('caregivers')
      .select(`
        id,
        first_name,
        last_name,
        image_url,
        specializations,
        experience_years,
        consultation_fee,
        is_active
      `)
      .eq('is_active', true)
      .limit(10);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Analyze image URLs
    const imageAnalysis = caregivers?.map(caregiver => ({
      id: caregiver.id,
      name: `${caregiver.first_name} ${caregiver.last_name}`,
      image_url: caregiver.image_url,
      has_image: !!caregiver.image_url,
      is_unsplash: caregiver.image_url?.includes('unsplash.com') || false,
      url_length: caregiver.image_url?.length || 0,
      specializations: caregiver.specializations
    })) || [];

    const stats = {
      total_caregivers: caregivers?.length || 0,
      with_images: imageAnalysis.filter(c => c.has_image).length,
      unsplash_images: imageAnalysis.filter(c => c.is_unsplash).length,
      without_images: imageAnalysis.filter(c => !c.has_image).length
    };

    return NextResponse.json({
      success: true,
      stats,
      caregivers: imageAnalysis,
      sample_urls: imageAnalysis
        .filter(c => c.has_image)
        .slice(0, 5)
        .map(c => c.image_url)
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch caregivers', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}