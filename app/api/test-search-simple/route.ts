import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || 'doctor';
    
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Admin client not configured' },
        { status: 500 }
      );
    }

    console.log('Testing search with query:', query);
    
    // Test 1: Basic caregivers query (no RLS)
    const { data: basicCaregivers, error: basicError } = await supabaseAdmin
      .from('caregivers')
      .select('*')
      .eq('is_active', true)
      .eq('is_verified', true)
      .limit(5);

    // Test 2: Caregivers with users join
    const { data: caregiversWithUsers, error: joinError } = await supabaseAdmin
      .from('caregivers')
      .select(`
        *,
        users!inner(
          first_name,
          last_name,
          email,
          phone,
          avatar_url
        )
      `)
      .eq('is_active', true)
      .eq('is_verified', true)
      .limit(5);

    // Test 3: Search with query
    let searchResults = [];
    let searchError = null;
    
    if (query && caregiversWithUsers) {
      try {
        const { data: searchData, error: sError } = await supabaseAdmin
          .from('caregivers')
          .select(`
            *,
            users!inner(
              first_name,
              last_name,
              email,
              phone,
              avatar_url
            )
          `)
          .eq('is_active', true)
          .eq('is_verified', true)
          .or(`users.first_name.ilike.%${query}%,users.last_name.ilike.%${query}%,bio_en.ilike.%${query}%,specializations.cs.{${query}}`)
          .limit(5);
        
        searchResults = searchData || [];
        searchError = sError;
      } catch (err) {
        searchError = err;
      }
    }

    // Flatten the results
    const flattenedResults = caregiversWithUsers?.map(caregiver => ({
      ...caregiver,
      first_name: caregiver.users?.first_name,
      last_name: caregiver.users?.last_name,
      email: caregiver.users?.email,
      phone: caregiver.users?.phone,
      avatar_url: caregiver.users?.avatar_url,
      users: undefined
    })) || [];

    return NextResponse.json({
      success: true,
      query,
      tests: {
        basic_caregivers: {
          count: basicCaregivers?.length || 0,
          error: basicError?.message,
          sample: basicCaregivers?.[0]
        },
        caregivers_with_users: {
          count: caregiversWithUsers?.length || 0,
          error: joinError?.message,
          sample: caregiversWithUsers?.[0]
        },
        search_results: {
          count: searchResults.length,
          error: searchError?.message,
          results: searchResults
        }
      },
      flattened_results: flattenedResults,
      debug_info: {
        admin_client_available: !!supabaseAdmin,
        query_used: query,
        suggestion: flattenedResults.length === 0 ? 
          'Try running POST /api/seed-simple first to insert test data' : 
          'Search is working! Try different queries like "headache", "heart", "doctor"'
      }
    });

  } catch (error) {
    console.error('Test search simple error:', error);
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