import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    const { data: tables, error: tablesError } = await supabase
      .from('caregivers')
      .select('count', { count: 'exact', head: true });

    if (tablesError) {
      throw new Error(`Database connection failed: ${tablesError.message}`);
    }

    // Test Local Docker Model configuration
    let localModelAvailable = false;
    try {
      const modelUrl = process.env.LOCAL_MODEL_URL || 'http://localhost:12434';
      const healthCheck = await fetch(`${modelUrl}/api/tags`, { 
        method: 'GET',
        signal: AbortSignal.timeout(3000) // 3 second timeout
      });
      localModelAvailable = healthCheck.ok;
    } catch (error) {
      console.log('Local model not available:', error.message);
      localModelAvailable = false;
    }

    // Test Supabase configuration
    const supabaseConfigured = !!(
      process.env.NEXT_PUBLIC_SUPABASE_URL && 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        caregivers_count: tables?.count || 0
      },
      ai: {
        local_model_available: localModelAvailable,
        local_model_url: process.env.LOCAL_MODEL_URL || 'http://localhost:12434',
        local_model_name: process.env.LOCAL_MODEL_NAME || 'llama2',
        fallback_available: true
      },
      supabase: {
        configured: supabaseConfigured,
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'missing'
      },
      features: {
        ai_search: localModelAvailable,
        fallback_search: true,
        authentication: supabaseConfigured,
        demo_data: true
      }
    });

  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      database: {
        connected: false
      }
    }, { status: 500 });
  }
}