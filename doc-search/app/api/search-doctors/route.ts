import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query || query.trim() === '') {
      return NextResponse.json(
        { error: 'Search query is required', success: false },
        { status: 400 }
      );
    }

    console.log('🔍 Search query:', query);

    // Step 1: Use Gemini AI to extract search intent
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are a medical search assistant. Analyze this patient query and extract relevant search criteria for finding doctors.

Patient Query: "${query}"

Extract and return ONLY a JSON object (no markdown, no explanation) with these fields:
{
  "specialization": "extracted medical specialization or condition (e.g., 'Cardiology', 'Diabetes', 'Skin problems')",
  "symptoms": ["list", "of", "symptoms"],
  "urgency": "low/medium/high",
  "preferredMode": "online/offline/any",
  "searchKeywords": ["relevant", "search", "terms"],
  "explanation": "brief explanation of what the patient is looking for"
}

Return ONLY the JSON object, nothing else.`;

    const result = await model.generateContent(prompt);
    const aiResponse = result.response.text();

    console.log('🤖 AI Response:', aiResponse);

    // Parse AI response
    let searchCriteria: any;
    try {
      const cleanedResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      searchCriteria = JSON.parse(cleanedResponse);
    } catch (parseError) {
      searchCriteria = {
        specialization: query,
        symptoms: [query],
        urgency: 'medium',
        preferredMode: 'any',
        searchKeywords: [query],
        explanation: 'Searching for doctors based on your query'
      };
    }

    // Step 2: Use Supabase to search
    // Since we can't easily do the same complex weighted scoring with simple Supabase filters,
    // we'll fetch matching doctors and calculate relevance in code, or use a simplified query.
    // Ideally, you'd use a Supabase Database Function (RPC) for complex search logic,
    // but for now, let's replicate the logic by fetching candidates.

    const keywords = searchCriteria.searchKeywords;
    const specialization = searchCriteria.specialization;

    // 1. Fetch ALL doctors joined with user data (since dataset is small)
    // In a real app with thousands of doctors, you'd use Supabase .textSearch() or filters.

    const { data: doctorsData, error } = await supabase
      .from('doctors')
      .select(`
        *,
        users:uid (
          name,
          email,
          phone,
          profile_image_url,
          is_active
        )
      `)
      .eq('users.is_active', true);

    if (error) {
      console.error('Supabase fetch error:', error);
      throw error;
    }

    console.log(`📊 Fetched ${doctorsData?.length || 0} doctors from DB.`);

    // 2. Filter and Rank in Javascript - DEEP SEARCH MODE

    const candidates = (doctorsData || []).map((doc: any) => {
      // Flat structure for easier handling
      const doctor = {
        ...doc,
        doctor_name: doc.users?.name || '',
        email: doc.users?.email || '',
        phone: doc.users?.phone || '',
        profile_image_url: doc.users?.profile_image_url
      };

      let score = 0;
      const queryLower = query.toLowerCase();

      // Fields to search (Deep Search)
      const fields = {
        specialization: (doctor.specialization || '').toLowerCase(),
        bio: (doctor.bio || '').toLowerCase(),
        qualification: (doctor.qualification || '').toLowerCase(),
        clinic: (doctor.clinic_name || '').toLowerCase(),
        city: (doctor.city || '').toLowerCase(),
        state: (doctor.state || '').toLowerCase(),
        name: (doctor.doctor_name || '').toLowerCase(),
        languages: (doctor.languages || []).join(' ').toLowerCase()
      };

      const targetSpec = (specialization || '').toLowerCase();

      // 1. AI-Detected Specialization Match (Highest Priority)
      if (
        fields.specialization.includes(targetSpec) ||
        targetSpec.includes(fields.specialization) ||
        targetSpec.split(/[\s,&]+/).some((word: string) => word.length > 3 && fields.specialization.includes(word))
      ) {
        score += 150;
      }

      // 2. Direct Query Match (User text match)
      if (fields.name.includes(queryLower)) score += 200; // Exact name match is best
      if (fields.clinic.includes(queryLower)) score += 100;
      if (fields.specialization.includes(queryLower)) score += 100;
      if (fields.city.includes(queryLower) || fields.state.includes(queryLower)) score += 80;

      // 3. Keyword/Symptom Matching (Contextual Match)
      keywords.forEach((keyword: string) => {
        const k = keyword.toLowerCase();

        // Check ALL fields
        if (fields.specialization.includes(k)) score += 50;
        if (fields.bio.includes(k)) score += 40; // High score for bio match (symptoms often here)
        if (fields.qualification.includes(k)) score += 30;
        if (fields.clinic.includes(k)) score += 20;
        if (fields.languages.includes(k)) score += 20; // "English speaking doctor"
      });

      // 4. Fallback: Search the BIO for any query terms
      // If AI failed to extract keywords, use raw query terms
      const queryTerms = queryLower.split(' ').filter((w: string) => w.length > 3);
      queryTerms.forEach((term: string) => {
        if (fields.bio.includes(term)) score += 10;
        if (fields.specialization.includes(term)) score += 10;
      });

      return { ...doctor, relevanceScore: score };
    });

    // Filter out low relevance and sort
    const results = candidates
      .filter((d: any) => d.relevanceScore > 0)
      .sort((a: any, b: any) => {
        // Sort by score desc, then experience desc
        if (b.relevanceScore !== a.relevanceScore) return b.relevanceScore - a.relevanceScore;
        return (b.years_of_experience || 0) - (a.years_of_experience || 0);
      })
      .slice(0, 50); // Increased limit for broader search results

    // Map to API response format
    const formattedResults = results.map((doctor: any) => ({
      id: doctor.did,
      name: doctor.doctor_name,
      specialization: doctor.specialization,
      qualification: doctor.qualification,
      experience: doctor.years_of_experience,
      consultationFee: parseFloat(doctor.consultation_fee),
      bio: doctor.bio,
      clinicName: doctor.clinic_name,
      location: doctor.city && doctor.state ? `${doctor.city}, ${doctor.state}` : null,
      languages: doctor.languages,
      verified: doctor.is_verified,
      profileImage: doctor.profile_image_url,
      email: doctor.email,
      phone: doctor.phone,
      relevanceScore: doctor.relevanceScore
    }));

    return NextResponse.json({
      success: true,
      query: query,
      searchCriteria: searchCriteria,
      results: formattedResults,
      count: formattedResults.length,
      message: formattedResults.length > 0
        ? `Found ${formattedResults.length} doctor(s) matching your query`
        : 'No doctors found. Try a different search term.'
    });

  } catch (error: any) {
    console.error('❌ Search error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to search doctors',
        message: error.message
      },
      { status: 500 }
    );
  }
}
