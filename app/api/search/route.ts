import { NextRequest, NextResponse } from 'next/server';
import { searchCaregivers, searchCaregiversEnhanced } from '@/lib/supabaseClient';
// Using local Docker model instead of Gemini
const LOCAL_MODEL_URL = process.env.LOCAL_MODEL_URL || 'http://localhost:12434';
const LOCAL_MODEL_NAME = process.env.LOCAL_MODEL_NAME || 'llama2';

interface SearchResult {
  id: string;
  first_name: string;
  last_name: string;
  type: string;
  specializations: string[];
  qualifications: string[];
  experience_years: number;
  bio_en: string;
  bio_hi: string;
  profile_image_url: string;
  license_number: string;
  rating: number;
  total_reviews: number;
  consultation_fee: number;
  home_visit_fee: number;
  available_for_home_visits: boolean;
  available_for_online: boolean;
  center_id: string;
  latitude: number;
  longitude: number;
  service_radius_km: number;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  match_score: number;
  distance_km: number;
  short_reason: string;
}

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Extract symptoms and medical conditions from user query using AI
async function extractMedicalInfo(query: string, language: string = 'en') {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `
You are a medical AI assistant. Analyze the following user query and extract medical information.

User query: "${query}"
Language: ${language}

Based on the symptoms and conditions mentioned, determine:
1. Symptoms: Extract all symptoms mentioned
2. Medical conditions: Identify potential medical conditions
3. Specializations: Which medical specializations would be most relevant
4. Caregiver type: What type of healthcare provider is needed
5. Urgency: How urgent is this medical concern

Common specializations include:
- Cardiology (heart problems, chest pain, heart attack)
- Neurology (headache, migraine, stroke, seizures)
- Orthopedics (bone fracture, joint pain, back pain, sports injury)
- Pediatrics (child fever, baby care, vaccination)
- Gastroenterology (stomach pain, acidity, digestive issues)
- Dermatology (skin rash, acne, skin allergy)
- ENT (ear pain, throat pain, nose bleeding)
- Gynecology (pregnancy, menstrual problems, PCOS)
- Psychiatry (depression, anxiety, stress)
- Endocrinology (diabetes, thyroid, hormone imbalance)

Respond ONLY in valid JSON format:
{
  "symptoms": ["symptom1", "symptom2"],
  "conditions": ["condition1", "condition2"],
  "specializations": ["specialization1", "specialization2"],
  "caregiver_type": "doctor|nurse|therapist|maid",
  "urgency": "low|medium|high",
  "confidence": 0.85
}
`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    if (!text) throw new Error('No AI response');

    // Clean the response to extract JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in response');

    const extracted = JSON.parse(jsonMatch[0]);
    
    // Log the AI query for analytics
    try {
      await logAIQuery(query, language, extracted);
    } catch (logError) {
      console.error('Failed to log AI query:', logError);
    }

    return extracted;
  } catch (error) {
    console.error('AI extraction error:', error);
    // Enhanced fallback with keyword matching
    const fallbackResult = performKeywordMatching(query, language);
    
    try {
      await logAIQuery(query, language, fallbackResult, false);
    } catch (logError) {
      console.error('Failed to log fallback query:', logError);
    }
    
    return fallbackResult;
  }
}

// Enhanced keyword matching fallback
function performKeywordMatching(query: string, language: string) {
  const lowerQuery = query.toLowerCase();
  
  // Symptom keywords mapping
  const symptomMap = {
    'headache': ['Neurology'],
    'migraine': ['Neurology'],
    'chest pain': ['Cardiology'],
    'heart': ['Cardiology'],
    'stomach pain': ['Gastroenterology'],
    'acidity': ['Gastroenterology'],
    'skin': ['Dermatology'],
    'rash': ['Dermatology'],
    'bone': ['Orthopedics'],
    'joint pain': ['Orthopedics'],
    'back pain': ['Orthopedics'],
    'fever': ['Pediatrics', 'General Medicine'],
    'ear': ['ENT'],
    'throat': ['ENT'],
    'pregnancy': ['Gynecology'],
    'depression': ['Psychiatry'],
    'anxiety': ['Psychiatry'],
    'diabetes': ['Endocrinology'],
    'thyroid': ['Endocrinology']
  };

  // Hindi symptom keywords
  const hindiSymptomMap = {
    'सिरदर्द': ['Neurology'],
    'सीने में दर्द': ['Cardiology'],
    'पेट दर्द': ['Gastroenterology'],
    'त्वचा': ['Dermatology'],
    'हड्डी': ['Orthopedics'],
    'बुखार': ['Pediatrics'],
    'कान': ['ENT'],
    'गला': ['ENT'],
    'गर्भावस्था': ['Gynecology'],
    'अवसाद': ['Psychiatry'],
    'मधुमेह': ['Endocrinology']
  };

  let symptoms = [];
  let specializations = [];
  
  // Check English keywords
  for (const [symptom, specs] of Object.entries(symptomMap)) {
    if (lowerQuery.includes(symptom)) {
      symptoms.push(symptom);
      specializations.push(...specs);
    }
  }
  
  // Check Hindi keywords if language is Hindi
  if (language === 'hi') {
    for (const [symptom, specs] of Object.entries(hindiSymptomMap)) {
      if (query.includes(symptom)) {
        symptoms.push(symptom);
        specializations.push(...specs);
      }
    }
  }

  // Remove duplicates
  specializations = [...new Set(specializations)];
  
  return {
    symptoms,
    conditions: symptoms, // Use symptoms as conditions for fallback
    specializations,
    caregiver_type: 'doctor',
    urgency: symptoms.length > 0 ? 'medium' : 'low',
    confidence: 0.6
  };
}

// Log AI queries for analytics
async function logAIQuery(query: string, language: string, extracted: any, aiUsed: boolean = true) {
  try {
    const { supabaseAdmin } = await import('@/lib/supabaseClient');
    if (!supabaseAdmin) return;

    await supabaseAdmin
      .from('ai_queries_log')
      .insert({
        session_id: `sess_${Date.now()}`,
        query_text: query,
        user_lang: language,
        extracted_symptoms: extracted.symptoms || [],
        extracted_conditions: extracted.conditions || [],
        recommended_specializations: extracted.specializations || [],
        confidence_score: extracted.confidence || 0,
        results_returned: 0, // Will be updated later
        response_time_ms: Date.now() // Approximate
      });
  } catch (error) {
    console.error('Failed to log AI query:', error);
  }
}

// Generate AI reasoning for caregiver recommendations
async function generateRecommendationReason(
  query: string, 
  caregiver: any, 
  medicalInfo: any,
  language: string = 'en'
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const prompt = `
You are a healthcare AI assistant. Explain in 1-2 sentences why this caregiver is a good match for the user's query.

User query: "${query}"
Extracted symptoms: ${medicalInfo.symptoms.join(', ')}
Caregiver: ${caregiver.first_name} ${caregiver.last_name}
Type: ${caregiver.type}
Specializations: ${caregiver.specializations?.join(', ') || 'General'}
Experience: ${caregiver.experience_years} years
Rating: ${caregiver.rating}/5

Respond in ${language === 'hi' ? 'Hindi' : 'English'} in a helpful, reassuring tone.
Keep it concise (max 50 words). Provide only the explanation text, no additional formatting.
`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    return text?.trim() || (language === 'hi' 
      ? 'आपकी आवश्यकताओं के लिए उपयुक्त'
      : 'Good match for your needs');
  } catch (error) {
    console.error('AI reasoning error:', error);
    return language === 'hi' 
      ? 'आपकी आवश्यकताओं के लिए उपयुक्त'
      : 'Good match for your needs';
  }
}

// Calculate match score based on various factors
function calculateMatchScore(
  caregiver: any,
  medicalInfo: any,
  userLat?: number,
  userLon?: number
): number {
  let score = 0;

  // Base score from rating
  score += (caregiver.rating / 5) * 0.3;

  // Experience bonus
  if (caregiver.experience_years >= 10) score += 0.2;
  else if (caregiver.experience_years >= 5) score += 0.1;

  // Verification bonus
  if (caregiver.is_verified) score += 0.1;

  // Caregiver type match
  if (medicalInfo.caregiver_type === caregiver.type) {
    score += 0.2;
  }

  // Specialization match
  if (caregiver.specializations && medicalInfo.specializations) {
    const matchingSpecs = caregiver.specializations.filter((spec: string) =>
      medicalInfo.specializations.some((userSpec: string) =>
        spec.toLowerCase().includes(userSpec.toLowerCase()) ||
        userSpec.toLowerCase().includes(spec.toLowerCase())
      )
    );
    score += (matchingSpecs.length / Math.max(caregiver.specializations.length, 1)) * 0.2;
  }

  // Distance penalty (if location provided)
  if (userLat && userLon && caregiver.latitude && caregiver.longitude) {
    const distance = calculateDistance(userLat, userLon, caregiver.latitude, caregiver.longitude);
    if (distance <= 5) score += 0.1;
    else if (distance <= 15) score += 0.05;
    // No penalty for farther distances, just no bonus
  }

  return Math.min(score, 1); // Cap at 1.0
}

// Fallback search without AI
async function fallbackSearch(query: string, language: string, lat?: string, lon?: string) {
  try {
    // Simple keyword-based search
    const caregivers = await searchCaregivers(
      query,
      lat ? parseFloat(lat) : undefined,
      lon ? parseFloat(lon) : undefined,
      undefined,
      10
    );

    const results = caregivers.map(caregiver => {
      const distance = (lat && lon && caregiver.latitude && caregiver.longitude)
        ? calculateDistance(
            parseFloat(lat),
            parseFloat(lon),
            caregiver.latitude,
            caregiver.longitude
          )
        : 0;

      return {
        ...caregiver,
        match_score: caregiver.rating / 5, // Simple score based on rating
        distance_km: distance,
        short_reason: language === 'hi' 
          ? `${caregiver.experience_years} साल का अनुभव, ${caregiver.rating}/5 रेटिंग`
          : `${caregiver.experience_years} years experience, ${caregiver.rating}/5 rating`,
      };
    });

    return NextResponse.json({
      results: results.sort((a, b) => b.match_score - a.match_score),
      fallback_mode: true,
      total_found: caregivers.length,
    });
  } catch (error) {
    console.error('Fallback search error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const language = searchParams.get('lang') || 'en';
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Check if Gemini API key is configured
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      console.warn('Gemini API key not configured, using fallback search');
      return await fallbackSearch(query, language, lat, lon);
    }

    // Extract medical information using AI
    const medicalInfo = await extractMedicalInfo(query, language);

    // Search caregivers from database with enhanced matching
    const caregivers = await searchCaregiversEnhanced(
      query,
      medicalInfo,
      lat ? parseFloat(lat) : undefined,
      lon ? parseFloat(lon) : undefined,
      20 // Get more results for better AI filtering
    );

    if (caregivers.length === 0) {
      return NextResponse.json({ 
        results: [],
        message: language === 'hi' 
          ? 'कोई देखभालकर्ता नहीं मिला'
          : 'No caregivers found'
      });
    }

    // Calculate match scores and distances
    const enrichedResults: SearchResult[] = await Promise.all(
      caregivers.map(async (caregiver) => {
        const matchScore = calculateMatchScore(
          caregiver,
          medicalInfo,
          lat ? parseFloat(lat) : undefined,
          lon ? parseFloat(lon) : undefined
        );

        const distance = (lat && lon && caregiver.latitude && caregiver.longitude)
          ? calculateDistance(
              parseFloat(lat),
              parseFloat(lon),
              caregiver.latitude,
              caregiver.longitude
            )
          : 0;

        const reason = await generateRecommendationReason(
          query,
          caregiver,
          medicalInfo,
          language
        );

        return {
          ...caregiver,
          match_score: matchScore,
          distance_km: distance,
          short_reason: reason,
        };
      })
    );

    // Sort by match score (descending) and limit results
    const sortedResults = enrichedResults
      .sort((a, b) => b.match_score - a.match_score)
      .slice(0, 10);

    return NextResponse.json({
      results: sortedResults,
      query_analysis: medicalInfo,
      total_found: caregivers.length,
    });

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}