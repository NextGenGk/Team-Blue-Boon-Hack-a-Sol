import { NextRequest, NextResponse } from 'next/server';
import { searchCaregivers } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || 'doctor';
    
    console.log('Testing search with query:', query);
    
    // Test the search function
    const caregivers = await searchCaregivers(query, undefined, undefined, undefined, 5);
    
    console.log('Search results:', caregivers.length, 'caregivers found');
    
    return NextResponse.json({
      success: true,
      query,
      total_found: caregivers.length,
      results: caregivers.map(c => ({
        id: c.id,
        name: `${c.first_name} ${c.last_name}`,
        type: c.type,
        specializations: c.specializations,
        rating: c.rating,
        experience_years: c.experience_years,
        is_verified: c.is_verified,
        is_active: c.is_active
      }))
    });
  } catch (error) {
    console.error('Test search error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}