import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testQuery = searchParams.get('query') || 'I have a headache';
    const lang = searchParams.get('lang') || 'en';
    
    // Test queries to demonstrate AI search functionality
    const testQueries = [
      {
        query: "I have a severe headache and dizziness",
        language: "en",
        expected: "Should match Neurologist"
      },
      {
        query: "मुझे सिरदर्द और चक्कर आ रहे हैं",
        language: "hi", 
        expected: "Should match Neurologist (Hindi)"
      },
      {
        query: "I have chest pain and shortness of breath",
        language: "en",
        expected: "Should match Cardiologist"
      },
      {
        query: "My knee is swollen after playing cricket",
        language: "en",
        expected: "Should match Orthopedic surgeon"
      },
      {
        query: "I have stomach pain and acidity",
        language: "en",
        expected: "Should match Gastroenterologist"
      },
      {
        query: "I have skin rash and itching",
        language: "en",
        expected: "Should match Dermatologist"
      },
      {
        query: "I need help taking care of my elderly mother",
        language: "en",
        expected: "Should match Home care nurse or helper"
      },
      {
        query: "I feel very sad and anxious lately",
        language: "en",
        expected: "Should match Psychiatrist"
      },
      {
        query: "My baby has fever and is not eating well",
        language: "en",
        expected: "Should match Pediatrician"
      },
      {
        query: "I have diabetes and need regular checkups",
        language: "en",
        expected: "Should match Endocrinologist"
      }
    ];

    // Test the search API with the provided query
    const searchUrl = new URL('/api/search', request.url);
    searchUrl.searchParams.set('query', testQuery);
    searchUrl.searchParams.set('lang', lang);
    
    const searchResponse = await fetch(searchUrl.toString(), {
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
      }
    });
    
    const searchResults = await searchResponse.json();

    return NextResponse.json({
      success: true,
      test_query: {
        query: testQuery,
        language: lang
      },
      search_results: searchResults,
      available_test_queries: testQueries,
      instructions: {
        usage: "Use ?query=your_query&lang=en to test different queries",
        examples: [
          "/api/test-ai-search?query=I have a headache&lang=en",
          "/api/test-ai-search?query=मुझे सिरदर्द है&lang=hi",
          "/api/test-ai-search?query=chest pain&lang=en"
        ]
      },
      database_info: {
        total_caregivers: "18 caregivers available",
        specializations: [
          "Cardiology", "Neurology", "Orthopedics", "Pediatrics",
          "Gastroenterology", "Dermatology", "ENT", "Gynecology", 
          "Psychiatry", "Endocrinology", "Critical Care", "Home Care"
        ],
        languages_supported: ["English", "Hindi"]
      }
    });

  } catch (error) {
    console.error('Test AI search error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to test AI search functionality'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { queries } = body;
    
    if (!queries || !Array.isArray(queries)) {
      return NextResponse.json(
        { error: 'Please provide an array of queries to test' },
        { status: 400 }
      );
    }

    const results = [];
    
    for (const testCase of queries) {
      const { query, language = 'en' } = testCase;
      
      try {
        const searchUrl = new URL('/api/search', request.url);
        searchUrl.searchParams.set('query', query);
        searchUrl.searchParams.set('lang', language);
        
        const searchResponse = await fetch(searchUrl.toString(), {
          headers: {
            'Authorization': request.headers.get('Authorization') || '',
          }
        });
        
        const searchResult = await searchResponse.json();
        
        results.push({
          query,
          language,
          success: true,
          results_count: searchResult.results?.length || 0,
          top_match: searchResult.results?.[0] ? {
            name: `${searchResult.results[0].first_name} ${searchResult.results[0].last_name}`,
            type: searchResult.results[0].type,
            specializations: searchResult.results[0].specializations,
            match_score: searchResult.results[0].match_score,
            reason: searchResult.results[0].short_reason
          } : null,
          query_analysis: searchResult.query_analysis
        });
      } catch (error) {
        results.push({
          query,
          language,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      success: true,
      batch_test_results: results,
      summary: {
        total_queries: queries.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }
    });

  } catch (error) {
    console.error('Batch test error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}