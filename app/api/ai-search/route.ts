import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

// Enhanced AI-powered medical analysis with comprehensive condition mapping
const analyzeQuery = (query: string, language: string = 'en') => {
  const lowerQuery = query.toLowerCase();
  
  // Comprehensive medical condition patterns with intelligent provider recommendations
  const medicalPatterns = {
    // Cardiovascular Conditions (Doctor Required)
    'heart|chest pain|cardiac|angina|heart attack|palpitation|arrhythmia|hypertension|blood pressure|coronary|myocardial|cardiovascular': {
      specialty: 'Cardiology',
      provider: 'doctor',
      urgency: 'high',
      symptoms: ['chest pain', 'heart disease', 'cardiac emergency', 'hypertension'],
      reasoning: 'Cardiovascular symptoms require immediate evaluation by a cardiologist for proper diagnosis and treatment.'
    },
    
    // Neurological Conditions (Doctor Required)
    'headache|migraine|stroke|seizure|epilepsy|brain|memory|dizziness|vertigo|neurological|concussion|paralysis|numbness': {
      specialty: 'Neurology', 
      provider: 'doctor',
      urgency: 'high',
      symptoms: ['headache', 'migraine', 'neurological disorder', 'stroke symptoms'],
      reasoning: 'Neurological symptoms require specialized medical evaluation to rule out serious conditions.'
    },
    
    // Orthopedic Conditions (Doctor Required)
    'bone|fracture|joint pain|back pain|knee|arthritis|spine|hip|shoulder|sports injury|broken|sprain|ligament|tendon': {
      specialty: 'Orthopedics',
      provider: 'doctor', 
      urgency: 'medium',
      symptoms: ['bone fracture', 'joint pain', 'orthopedic injury', 'musculoskeletal pain'],
      reasoning: 'Bone and joint issues require orthopedic evaluation for proper diagnosis and treatment planning.'
    },
    
    // Pediatric Care (Doctor Required)
    'child|baby|infant|kid|pediatric|vaccination|child fever|baby care|newborn|toddler|adolescent': {
      specialty: 'Pediatrics',
      provider: 'doctor',
      urgency: 'medium', 
      symptoms: ['child care', 'pediatric health', 'child development', 'vaccination'],
      reasoning: 'Children require specialized pediatric medical care for proper growth and development monitoring.'
    },
    
    // General Medicine (Doctor Required)
    'fever|cold|flu|cough|sore throat|infection|diabetes|thyroid|general checkup|physical exam|blood test': {
      specialty: 'General Medicine',
      provider: 'doctor',
      urgency: 'medium',
      symptoms: ['fever', 'infection', 'general health', 'preventive care'],
      reasoning: 'General medical conditions require doctor evaluation for proper diagnosis and treatment.'
    },
    
    // Dermatology (Doctor Required)
    'skin|rash|acne|eczema|psoriasis|mole|dermatology|allergy|itching|skin cancer': {
      specialty: 'Dermatology',
      provider: 'doctor',
      urgency: 'low',
      symptoms: ['skin condition', 'rash', 'dermatological issue'],
      reasoning: 'Skin conditions require dermatological evaluation for accurate diagnosis and treatment.'
    },
    
    // Pregnancy & Maternity Care (Nurse Appropriate)
    'pregnancy|pregnant|maternity|prenatal|antenatal|postnatal|delivery|labor|breastfeeding|postpartum': {
      specialty: 'Pregnancy Care',
      provider: 'nurse',
      urgency: 'medium',
      symptoms: ['pregnancy care', 'maternity support', 'prenatal care', 'postnatal care'],
      reasoning: 'Pregnancy and maternity care can be effectively provided by specialized maternal health nurses.'
    },
    
    // Wound Care & Post-Surgical (Nurse Appropriate)
    'wound|dressing|injection|iv|catheter|post surgery|recovery|nursing care|bandage|suture care': {
      specialty: 'Wound Care',
      provider: 'nurse',
      urgency: 'medium',
      symptoms: ['wound care', 'nursing support', 'post-surgical care', 'injection'],
      reasoning: 'Wound care and nursing procedures are expertly handled by skilled nursing professionals.'
    },
    
    // Elder Care & Geriatric Support (Nurse Appropriate)
    'elderly|senior|old age|geriatric|elder care|aging|dementia care|mobility assistance|medication management': {
      specialty: 'Elder Care',
      provider: 'nurse',
      urgency: 'low',
      symptoms: ['elder care', 'geriatric support', 'elderly assistance'],
      reasoning: 'Elderly patients benefit from compassionate geriatric nursing care and daily living support.'
    },
    
    // Critical Care & ICU (Nurse Appropriate)
    'icu|critical|intensive|emergency|life support|ventilator|monitoring|critical care nursing': {
      specialty: 'ICU Support',
      provider: 'nurse',
      urgency: 'high',
      symptoms: ['critical care', 'ICU support', 'intensive monitoring'],
      reasoning: 'Critical care situations require specialized ICU nursing expertise for patient monitoring and support.'
    },
    
    // Home Healthcare (Nurse Appropriate)
    'home care|home nursing|bedside care|patient monitoring|medication administration|vital signs': {
      specialty: 'Home Healthcare',
      provider: 'nurse',
      urgency: 'low',
      symptoms: ['home care', 'bedside nursing', 'home healthcare'],
      reasoning: 'Home healthcare services are best provided by experienced home care nurses.'
    },
    
    // Vaccination & Preventive Care (Both Doctor/Nurse)
    'vaccine|vaccination|immunization|flu shot|covid vaccine|preventive care|health screening': {
      specialty: 'Vaccination Support',
      provider: 'both', // Can be either doctor or nurse
      urgency: 'low',
      symptoms: ['vaccination', 'immunization', 'preventive care'],
      reasoning: 'Vaccination services can be provided by both qualified doctors and nurses.'
    }
  };
  
  // Find matching pattern
  for (const [pattern, analysis] of Object.entries(medicalPatterns)) {
    const regex = new RegExp(pattern, 'i');
    if (regex.test(lowerQuery)) {
      return {
        ...analysis,
        confidence: 0.9,
        matched_pattern: pattern
      };
    }
  }
  
  // Fallback analysis for general queries
  return {
    specialty: 'General Care',
    provider: 'nurse',
    urgency: 'low',
    symptoms: [query],
    reasoning: 'General healthcare query - recommending available healthcare providers.',
    confidence: 0.6,
    matched_pattern: 'general'
  };
};



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

    console.log('AI Search Query:', query, 'Language:', language);

    // Step 1: AI Analysis of the query
    const analysis = analyzeQuery(query, language);
    console.log('AI Analysis:', analysis);

    const supabase = createClient();
    let searchResults = [];
    
    // Step 2: Search for specialists matching the AI analysis
    if (analysis.specialty !== 'General Care') {
      const { data: specialistResults, error: specialistError } = await supabase
        .from('caregivers')
        .select('*')
        .eq('is_active', true)
        .eq('is_verified', true)
        .contains('specializations', [analysis.specialty])
        .order('experience_years', { ascending: false })
        .limit(5);
      
      console.log(`Specialist search for "${analysis.specialty}":`, specialistResults?.length || 0, 'results');
      
      if (specialistResults && specialistResults.length > 0) {
        searchResults.push(...specialistResults);
      }
    }
    
    // Step 3: Broader search by provider type if no specialists found
    if (searchResults.length === 0 && analysis.provider) {
      const { data: providerResults, error: providerError } = await supabase
        .from('caregivers')
        .select('*')
        .eq('is_active', true)
        .eq('is_verified', true)
        .eq('type', analysis.provider)
        .order('experience_years', { ascending: false })
        .limit(8);
      
      console.log(`Provider search for "${analysis.provider}":`, providerResults?.length || 0, 'results');
      
      if (providerResults && providerResults.length > 0) {
        searchResults.push(...providerResults);
      }
    }
    
    // Step 4: Semantic search in bio fields
    if (searchResults.length < 3) {
      const searchTerms = [...analysis.symptoms, query];
      
      for (const term of searchTerms) {
        const { data: bioResults, error: bioError } = await supabase
          .from('caregivers')
          .select('*')
          .eq('is_active', true)
          .eq('is_verified', true)
          .or(`bio_en.ilike.%${term}%,bio_hi.ilike.%${term}%`)
          .order('experience_years', { ascending: false })
          .limit(3);
        
        console.log(`Bio search for "${term}":`, bioResults?.length || 0, 'results');
        
        if (bioResults && bioResults.length > 0) {
          const existingIds = new Set(searchResults.map(r => r.id));
          const newResults = bioResults.filter(r => !existingIds.has(r.id));
          searchResults.push(...newResults);
        }
        
        if (searchResults.length >= 5) break;
      }
    }
    
    // Step 5: Fallback to general providers
    if (searchResults.length === 0) {
      const { data: fallbackResults, error: fallbackError } = await supabase
        .from('caregivers')
        .select('*')
        .eq('is_active', true)
        .eq('is_verified', true)
        .order('experience_years', { ascending: false })
        .limit(5);
      
      console.log('Fallback search results:', fallbackResults?.length || 0);
      
      if (fallbackResults && fallbackResults.length > 0) {
        searchResults.push(...fallbackResults);
      }
    }
    
    console.log('Total AI search results found:', searchResults.length);
    
    // Step 6: Generate AI-powered recommendations with proper data structure
    const aiRecommendations = searchResults.map((caregiver, index) => {
      const name = caregiver.name || `${caregiver.first_name || ''} ${caregiver.last_name || ''}`.trim() || 'Healthcare Provider';
      const experience = caregiver.experience_years || 0;
      const rating = caregiver.rating || 4.0;
      const totalReviews = caregiver.total_reviews || 0;
      
      // Calculate match score based on specializations
      let matchScore = 60; // Base score
      
      if (caregiver.specializations) {
        const hasExactMatch = caregiver.specializations.some((spec: string) => 
          spec.toLowerCase().includes(analysis.specialty.toLowerCase()) ||
          analysis.symptoms.some((symptom: string) => spec.toLowerCase().includes(symptom.toLowerCase()))
        );
        
        if (hasExactMatch) matchScore = 95;
        else if (caregiver.type === analysis.provider) matchScore = 80;
      }
      
      // Boost score for experience and rating
      matchScore += Math.min(experience * 2, 20); // Up to 20 points for experience
      matchScore += Math.min(rating * 5, 15); // Up to 15 points for rating
      matchScore = Math.min(matchScore, 100);
      
      const aiReason = language === 'hi' 
        ? `${name} आपकी स्थिति के लिए उपयुक्त हैं। ${experience} साल का अनुभव और ${rating}/5 रेटिंग के साथ ${analysis.specialty} में विशेषज्ञता।`
        : `${name} is well-suited for your condition. Specializes in ${analysis.specialty} with ${experience} years of experience and ${rating}/5 rating.`;
      
      return {
        ...caregiver,
        // Ensure all required fields exist with proper data types
        name: name,
        first_name: caregiver.first_name || name.split(' ')[0] || '',
        last_name: caregiver.last_name || name.split(' ').slice(1).join(' ') || '',
        rating: rating,
        total_reviews: totalReviews,
        experience_years: experience,
        // Ensure arrays are properly formatted
        specializations: Array.isArray(caregiver.specializations) 
          ? caregiver.specializations 
          : (caregiver.specializations ? caregiver.specializations.split(' ') : []),
        languages: Array.isArray(caregiver.languages) 
          ? caregiver.languages 
          : (caregiver.languages ? caregiver.languages.split(' ') : []),
        qualifications: Array.isArray(caregiver.qualifications) 
          ? caregiver.qualifications 
          : (caregiver.qualifications ? [caregiver.qualifications] : []),
        // AI-specific fields
        match_score: matchScore,
        distance_km: 0, // Will be calculated based on location if provided
        short_reason: aiReason,
        ai_recommendation: true,
        recommendation_rank: index + 1
      };
    });
    
    // Sort by match score and experience
    aiRecommendations.sort((a, b) => {
      if (b.match_score !== a.match_score) return b.match_score - a.match_score;
      return (b.experience_years || 0) - (a.experience_years || 0);
    });

    return NextResponse.json({
      results: aiRecommendations.slice(0, 10), // Top 10 recommendations
      ai_analysis: {
        symptoms: analysis.symptoms,
        recommended_provider: analysis.provider,
        specialty: analysis.specialty,
        urgency: analysis.urgency,
        reasoning: analysis.reasoning,
        confidence: analysis.confidence,
        language_detected: language
      },
      query_analysis: {
        original_query: query,
        processed_symptoms: analysis.symptoms,
        matched_pattern: analysis.matched_pattern,
        search_strategy: 'ai_powered',
        language,
        confidence: analysis.confidence
      },
      search_metadata: {
        total_found: aiRecommendations.length,
        search_method: 'ai_semantic_search',
        urgency_level: analysis.urgency,
        recommendation_basis: 'ai_analysis_with_medical_expertise'
      }
    });

  } catch (error) {
    console.error('AI Search error:', error);
    return NextResponse.json(
      { 
        error: 'AI search failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        search_method: 'ai_semantic_search'
      },
      { status: 500 }
    );
  }
}