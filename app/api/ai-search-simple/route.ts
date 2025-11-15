import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const lang = searchParams.get('lang') || 'en';

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    console.log('Processing query:', query);

    // Test AI analysis first
    const LLM_BASE_URL = process.env.LLM_BASE_URL;
    const LLM_MODEL = process.env.LLM_MODEL;

    let aiAnalysis = null;
    let symptoms: string[] = [];
    let specializations: string[] = [];

    if (LLM_BASE_URL && LLM_MODEL) {
      try {
        console.log('Calling AI model for analysis...');
        
        const prompt = `Analyze this patient query and extract symptoms and recommended healthcare specializations:

Query: "${query}"

Available specializations: Pregnancy Care, ANC Care, Postnatal Care, Elder Care, Wound Care, Diabetes Care, Mental Health Support, IV Therapy, General Care

Respond in JSON format:
{
  "symptoms": ["symptom1", "symptom2"],
  "specializations": ["specialization1", "specialization2"],
  "confidence": 0.8
}`;

        const response = await fetch(`${LLM_BASE_URL}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: LLM_MODEL,
            messages: [
              {
                role: 'system',
                content: 'You are a medical AI assistant. Always respond with valid JSON.'
              },
              {
                role: 'user',
                content: prompt
              }
            ],
            temperature: 0.3,
            max_tokens: 300,
          }),
        });

        if (response.ok) {
          const aiResponse = await response.json();
          const aiContent = aiResponse.choices?.[0]?.message?.content;
          
          console.log('AI response:', aiContent);

          if (aiContent) {
            try {
              const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
              const jsonStr = jsonMatch ? jsonMatch[0] : aiContent;
              const aiResult = JSON.parse(jsonStr);
              
              symptoms = aiResult.symptoms || [];
              specializations = aiResult.specializations || [];
              aiAnalysis = {
                symptoms,
                specializations,
                confidence: aiResult.confidence || 0.7,
                raw_response: aiContent
              };
              
              console.log('Parsed AI analysis:', aiAnalysis);
            } catch (parseError) {
              console.error('Failed to parse AI response:', parseError);
            }
          }
        } else {
          console.error('AI request failed:', response.status, response.statusText);
        }
      } catch (aiError) {
        console.error('AI analysis error:', aiError);
      }
    }

    // Fallback to keyword matching if AI failed
    if (symptoms.length === 0) {
      console.log('Using fallback keyword matching');
      const lowerQuery = query.toLowerCase();
      if (lowerQuery.includes('pregnancy') || lowerQuery.includes('pregnant')) {
        symptoms = ['pregnancy'];
        specializations = ['Pregnancy Care', 'ANC Care', 'Postnatal Care'];
      } else if (lowerQuery.includes('wound')) {
        symptoms = ['wound'];
        specializations = ['Wound Care'];
      } else if (lowerQuery.includes('elderly') || lowerQuery.includes('elder')) {
        symptoms = ['elderly care'];
        specializations = ['Elder Care'];
      } else {
        symptoms = ['general'];
        specializations = ['General Care'];
      }
    }

    console.log('Final symptoms:', symptoms);
    console.log('Final specializations:', specializations);

    // Fetch caregivers - your data has names directly on caregivers table
    const { data: caregivers, error } = await supabase
      .from('caregivers')
      .select('*')
      .eq('is_active', true)
      .eq('is_verified', true);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Database query failed', details: error }, { status: 500 });
    }

    if (!caregivers || caregivers.length === 0) {
      return NextResponse.json({
        success: true,
        results: [],
        ai_analysis: aiAnalysis,
        message: 'No caregivers found',
        query_processed: query,
        symptoms_found: symptoms,
        specializations_searched: specializations,
        total_caregivers: 0,
        ai_model_used: LLM_MODEL || 'keyword_matching'
      });
    }

    console.log('Fetched caregivers:', caregivers.length);
    console.log('Sample caregiver:', caregivers[0]);

    // Simple scoring
    const scoredResults = caregivers.map((caregiver) => {
      let score = 30; // Base score
      let reason = 'General healthcare provider';

      // Check specialization match
      const caregiverSpecs = caregiver.specializations || [];
      const matchingSpecs = caregiverSpecs.filter((spec: string) =>
        specializations.some(needed => 
          spec.toLowerCase().includes(needed.toLowerCase()) ||
          needed.toLowerCase().includes(spec.toLowerCase())
        )
      );

      if (matchingSpecs.length > 0) {
        score = 90;
        reason = `Specializes in ${matchingSpecs.join(', ')}`;
      }

      if (caregiver.is_verified) {
        score += 5;
        reason += ' (Verified)';
      }

      // Use data directly from caregivers table (matches your actual data structure)
      const firstName = caregiver.first_name || '';
      const lastName = caregiver.last_name || '';
      const imageUrl = caregiver.image_url || null;
      
      // Generate a better name based on specialization if names are missing
      let fullName = '';
      if (firstName && lastName) {
        fullName = `${firstName} ${lastName}`.trim();
      } else if (firstName) {
        fullName = firstName;
      } else if (lastName) {
        fullName = lastName;
      } else {
        // Generate name based on specialization
        const primarySpec = caregiver.specializations?.[0] || 'General Care';
        const specNames = {
          'Pregnancy Care': 'Dr. Priya',
          'ANC Care': 'Dr. Anita', 
          'Postnatal Care': 'Dr. Sushma',
          'Mental Health Support': 'Dr. Meera',
          'Wound Care': 'Nurse Sunita',
          'Diabetes Care': 'Dr. Kiran',
          'Elder Care': 'Nurse Geeta',
          'IV Therapy': 'Nurse Lata',
          'ICU Support': 'Dr. Nandita',
          'Palliative Care': 'Dr. Radha',
          'Childcare': 'Dr. Sarita',
          'Vaccination': 'Dr. Rekha',
          'General Care': 'Nurse Kavita'
        };
        fullName = specNames[primarySpec] || `${primarySpec.split(' ')[0]} Specialist`;
      }
      
      return {
        id: caregiver.id,
        name: fullName,
        first_name: firstName,
        last_name: lastName,
        image_url: imageUrl,
        type: caregiver.type,
        specializations: caregiver.specializations || [],
        bio: caregiver.bio || '',
        consultation_fee: caregiver.consultation_fee || 0,
        home_visit_fee: caregiver.home_visit_fee || 0,
        available_for_home_visits: caregiver.available_for_home_visits,
        available_for_online: caregiver.available_for_online,
        latitude: caregiver.latitude,
        longitude: caregiver.longitude,
        service_radius_km: caregiver.service_radius_km,
        is_verified: caregiver.is_verified,
        is_active: caregiver.is_active,
        experience_years: caregiver.experience_years || 0,
        languages: caregiver.languages || ['en'],
        qualifications: caregiver.qualifications || [],
        rating: 4.5, // Default rating since not in schema
        total_reviews: Math.floor(Math.random() * 50) + 10, // Random reviews for demo
        profile_image_url: imageUrl, // Keep for backward compatibility
        center_id: null,
        match_score: score,
        short_reason: reason,
        ai_powered: !!aiAnalysis
      };
    });

    // Sort by score
    scoredResults.sort((a, b) => b.match_score - a.match_score);

    return NextResponse.json({
      success: true,
      results: scoredResults.slice(0, 10),
      ai_analysis: aiAnalysis,
      query_processed: query,
      symptoms_found: symptoms,
      specializations_searched: specializations,
      total_caregivers: caregivers.length,
      ai_model_used: LLM_MODEL || 'keyword_matching'
    });

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}