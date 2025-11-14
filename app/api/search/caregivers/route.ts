import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Local Docker model configuration (OpenAI-compatible)
const LLM_BASE_URL = process.env.LLM_BASE_URL || 'http://localhost:12434/engines/llama.cpp/v1';
const LLM_MODEL = process.env.LLM_MODEL || 'ai/gemma3';

// AI-powered query analysis using OpenAI-compatible local model
async function analyzeQuery(query: string): Promise<{
  symptoms: string[];
  caregiver_type: string | null;
  urgency: 'low' | 'medium' | 'high';
  specializations: string[];
}> {
  try {
    const prompt = `Analyze this healthcare query and extract medical information. Respond ONLY with valid JSON:

Query: "${query}"

Extract:
1. symptoms - array of medical symptoms mentioned
2. caregiver_type - "doctor", "nurse", "therapist", or "maid" (null if unclear)
3. urgency - "low", "medium", or "high" 
4. specializations - relevant medical specializations

Common specializations: Cardiology, Neurology, Orthopedics, Pediatrics, Gastroenterology, Dermatology, ENT, Gynecology, Psychiatry, Endocrinology, General Medicine

Examples:
"I have a headache" -> {"symptoms":["headache"],"caregiver_type":"doctor","urgency":"low","specializations":["Neurology","General Medicine"]}
"Chest pain emergency" -> {"symptoms":["chest pain"],"caregiver_type":"doctor","urgency":"high","specializations":["Cardiology"]}
"Need elderly care" -> {"symptoms":["elderly care"],"caregiver_type":"maid","urgency":"low","specializations":[]}

JSON only:`;

    // Use OpenAI-compatible API format
    const response = await fetch(`${LLM_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer dummy' // Some endpoints require this
      },
      body: JSON.stringify({
        model: LLM_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are a medical AI assistant. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 200,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Local model error: ${response.status} - ${await response.text()}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || '';

    console.log('AI Response:', aiResponse);

    // Extract JSON from response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        symptoms: parsed.symptoms || [],
        caregiver_type: parsed.caregiver_type || null,
        urgency: parsed.urgency || 'medium',
        specializations: parsed.specializations || []
      };
    }

    throw new Error('No valid JSON in AI response');

  } catch (error) {
    console.error('AI analysis failed:', error);
    // Fallback to keyword matching
    return fallbackAnalysis(query);
  }
}

// Fallback keyword analysis
function fallbackAnalysis(query: string): {
  symptoms: string[];
  caregiver_type: string | null;
  urgency: 'low' | 'medium' | 'high';
  specializations: string[];
} {
  const lowerQuery = query.toLowerCase();
  
  const symptomKeywords = {
    'headache': ['Neurology', 'General Medicine'],
    'chest pain': ['Cardiology'],
    'heart': ['Cardiology'],
    'stomach': ['Gastroenterology'],
    'skin': ['Dermatology'],
    'bone': ['Orthopedics'],
    'joint': ['Orthopedics'],
    'fever': ['General Medicine'],
    'cold': ['General Medicine'],
    'cough': ['General Medicine'],
    'diabetes': ['Endocrinology'],
    'anxiety': ['Psychiatry'],
    'depression': ['Psychiatry']
  };

  let symptoms: string[] = [];
  let specializations: string[] = [];
  let caregiver_type: string | null = 'doctor';
  let urgency: 'low' | 'medium' | 'high' = 'medium';

  // Extract symptoms and specializations
  for (const [symptom, specs] of Object.entries(symptomKeywords)) {
    if (lowerQuery.includes(symptom)) {
      symptoms.push(symptom);
      specializations.push(...specs);
    }
  }

  // Determine caregiver type
  if (lowerQuery.includes('nurse') || lowerQuery.includes('nursing')) {
    caregiver_type = 'nurse';
  } else if (lowerQuery.includes('therapy') || lowerQuery.includes('physiotherapy')) {
    caregiver_type = 'therapist';
  } else if (lowerQuery.includes('elderly') || lowerQuery.includes('home care')) {
    caregiver_type = 'maid';
  }

  // Determine urgency
  if (lowerQuery.includes('emergency') || lowerQuery.includes('urgent') || lowerQuery.includes('severe')) {
    urgency = 'high';
  } else if (lowerQuery.includes('mild') || lowerQuery.includes('checkup')) {
    urgency = 'low';
  }

  return {
    symptoms: symptoms.length > 0 ? symptoms : [query],
    caregiver_type,
    urgency,
    specializations: [...new Set(specializations)]
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get parameters from URL (support both lng/lon for compatibility)
    const symptomsParam = searchParams.get('symptoms');
    const queryParam = searchParams.get('query'); // Natural language query
    const type = searchParams.get('type');
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng') || searchParams.get('lon'); // Support both lng and lon
    const radius = searchParams.get('radius');
    
    console.log('Raw URL params:', {
      symptoms: symptomsParam,
      query: queryParam,
      type,
      lat,
      lng: searchParams.get('lng'),
      lon: searchParams.get('lon'),
      radius
    });
    
    let symptoms: string[] = [];
    let analyzedType: string | null = type;
    let aiAnalysis: any = null;

    // If natural language query is provided, use AI analysis
    if (queryParam) {
      aiAnalysis = await analyzeQuery(queryParam);
      symptoms = aiAnalysis.symptoms;
      analyzedType = analyzedType || aiAnalysis.caregiver_type;
      
      console.log('AI Analysis:', aiAnalysis);
    } else if (symptomsParam) {
      // Parse symptoms (can be comma-separated)
      symptoms = symptomsParam.split(',').map(s => s.trim());
    }
    
    console.log('Search params:', { symptoms, type: analyzedType, lat, lng, radius });

    // Call the database search function
    const { data, error } = await supabase.rpc('search_caregivers_by_symptoms', {
      search_symptoms: symptoms,
      user_latitude: lat ? parseFloat(lat) : null,
      user_longitude: lng ? parseFloat(lng) : null,
      max_distance_km: radius ? parseInt(radius) : null,
      caregiver_type: analyzedType || null
    });

    if (error) {
      console.error('Database error:', error);
      
      // Fallback: Try a simple caregivers query if the function fails
      console.log('Trying fallback query...');
      try {
        const fallbackQuery = supabase
          .from('caregivers')
          .select(`
            *,
            users!inner(first_name, last_name, email, phone, avatar_url)
          `)
          .eq('is_active', true)
          .eq('is_verified', true);
          
        if (analyzedType) {
          fallbackQuery.eq('type', analyzedType);
        }
        
        const { data: fallbackData, error: fallbackError } = await fallbackQuery.limit(10);
        
        if (fallbackError) {
          throw fallbackError;
        }
        
        console.log('Fallback query successful, found:', fallbackData?.length || 0, 'caregivers');
        
        // Use fallback data
        const formattedFallback = fallbackData?.map((caregiver: any) => ({
          id: caregiver.id,
          name: `${caregiver.users.first_name} ${caregiver.users.last_name}`,
          type: caregiver.type,
          specializations: caregiver.specializations || [],
          qualifications: caregiver.qualifications || [],
          experience_years: caregiver.experience_years,
          rating: caregiver.rating,
          total_reviews: caregiver.total_reviews,
          consultation_fee: caregiver.consultation_fee,
          home_visit_fee: caregiver.home_visit_fee,
          available_for_online: caregiver.available_for_online,
          available_for_home_visits: caregiver.available_for_home_visits,
          distance_km: 0,
          match_score: caregiver.rating / 5,
          profile_image_url: caregiver.profile_image_url,
          bio: caregiver.bio_en,
          is_verified: caregiver.is_verified,
          is_active: caregiver.is_active
        })) || [];
        
        return NextResponse.json({
          success: true,
          data: formattedFallback,
          total: formattedFallback.length,
          query: {
            original_query: queryParam,
            symptoms,
            type: analyzedType,
            location: lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : null,
            radius: radius ? parseInt(radius) : null
          },
          ai_analysis: aiAnalysis,
          fallback_used: true,
          note: 'Used fallback query due to search function error'
        });
        
      } catch (fallbackError) {
        console.error('Fallback query also failed:', fallbackError);
        return NextResponse.json(
          { success: false, error: 'Database query failed', details: error.message },
          { status: 500 }
        );
      }
    }

    // Format the response (now includes first_name and last_name from updated function)
    const formattedResults = data?.map((caregiver: any) => ({
      id: caregiver.id,
      name: `${caregiver.first_name || ''} ${caregiver.last_name || ''}`.trim() || 'Unknown',
      first_name: caregiver.first_name || '',
      last_name: caregiver.last_name || '',
      type: caregiver.type,
      specializations: caregiver.specializations || [],
      qualifications: caregiver.qualifications || [],
      experience_years: caregiver.experience_years,
      rating: caregiver.rating,
      total_reviews: caregiver.total_reviews,
      consultation_fee: caregiver.consultation_fee,
      home_visit_fee: caregiver.home_visit_fee,
      available_for_online: caregiver.available_for_online,
      available_for_home_visits: caregiver.available_for_home_visits,
      distance_km: caregiver.distance_km,
      match_score: caregiver.match_score,
      profile_image_url: caregiver.profile_image_url,
      bio: caregiver.bio_en,
      is_verified: caregiver.is_verified,
      is_active: caregiver.is_active
    })) || [];

    return NextResponse.json({
      success: true,
      data: formattedResults,
      total: formattedResults.length,
      query: {
        original_query: queryParam,
        symptoms,
        type: analyzedType,
        location: lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : null,
        radius: radius ? parseInt(radius) : null
      },
      ai_analysis: aiAnalysis
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}