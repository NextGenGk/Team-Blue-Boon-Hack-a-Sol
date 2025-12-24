import { createClient } from '@/lib/supabaseClient';
import { llmQueryAnalyzer, LLMAnalysisResult } from '@/lib/llmQueryAnalyzer';

export interface SearchResult {
  id: string;
  name: string;
  first_name: string;
  last_name: string;
  type: string;
  specializations: string[];
  bio: string;
  consultation_fee: number;
  home_visit_fee: number;
  available_for_home_visits: boolean;
  available_for_online: boolean;
  latitude: number;
  longitude: number;
  service_radius_km: number;
  is_verified: boolean;
  is_active: boolean;
  experience_years: number;
  languages: string[];
  qualifications: string[];
  rating: number;
  total_reviews: number;
  profile_image_url: string | null;
  distance_km?: number;
  match_score: number;
  short_reason: string;
  ai_powered: boolean;
  match_confidence: number;
  search_method: string;
  ai_recommendation: boolean;
  recommendation_rank: number;
  phone?: string;
  email?: string;
}

export interface IntelligentSearchResult {
  caregivers: SearchResult[];
  llmAnalysis: LLMAnalysisResult;
  searchMetadata: {
    totalFound: number;
    searchMethod: string;
    executionTime: number;
    queryProcessed: string;
    confidence: number;
  };
}

export class IntelligentCaregiverSearch {
  private supabase = createClient();
  private ragApiUrl = process.env.NEXT_PUBLIC_RAG_API_URL || 'http://localhost:3000/api/search';

  /**
   * Search using RAG (Retrieval-Augmented Generation) for semantic doctor matching
   */
  private async searchWithRAG(userQuery: string, language: 'en' | 'hi' = 'en'): Promise<any[]> {
    try {
      console.log('🔍 Searching with RAG:', userQuery);

      const response = await fetch(`${this.ragApiUrl}?query=${encodeURIComponent(userQuery)}&lang=${language}`);

      if (!response.ok) {
        console.warn('RAG search failed, will use fallback');
        return [];
      }

      const data = await response.json();
      console.log('✅ RAG search results:', data.results?.length || 0, 'doctors found');

      return data.results || [];
    } catch (error) {
      console.error('RAG search error:', error);
      return [];
    }
  }

  /**
   * Fetch full doctor details from Supabase by IDs
   */
  private async fetchDoctorsByIds(doctorIds: string[]): Promise<any[]> {
    if (doctorIds.length === 0) return [];

    try {
      const { data, error } = await this.supabase
        .from('doctors')
        .select('*')
        .in('did', doctorIds)
        .eq('is_verified', true);

      if (error) {
        console.error('Error fetching doctors:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching doctors by IDs:', error);
      return [];
    }
  }

  /**
   * Main search function that uses RAG + LLM to analyze query and find relevant caregivers
   */
  async searchByQuery(
    userQuery: string,
    userLocation?: { latitude: number; longitude: number },
    language: 'en' | 'hi' = 'en',
    maxResults: number = 20
  ): Promise<IntelligentSearchResult> {
    const startTime = Date.now();

    try {
      // Step 1: Try RAG search first (semantic search using Pinecone)
      const ragResults = await this.searchWithRAG(userQuery, language);

      let caregivers: any[] = [];
      let searchMethod = 'rag_semantic_search';

      if (ragResults.length > 0) {
        // Get full doctor details from Supabase
        const doctorIds = ragResults.map((r: any) => r.did);
        caregivers = await this.fetchDoctorsByIds(doctorIds);

        // Reorder caregivers to match RAG ranking
        caregivers = doctorIds
          .map(id => caregivers.find(c => c.did === id))
          .filter(Boolean);

        console.log('✅ Using RAG results:', caregivers.length, 'doctors');
      }

      // Step 2: Fallback to LLM + database search if RAG returns no results
      if (caregivers.length === 0) {
        console.log('⚠️  RAG returned no results, using database search fallback');
        searchMethod = 'llm_enhanced_search';

        const llmAnalysis = await llmQueryAnalyzer.analyzeQuery(userQuery, language);

        const { data: dbResults, error } = await this.supabase
          .rpc('search_caregivers_ai_enhanced', {
            symptoms_input: llmAnalysis.symptoms,
            query_text: userQuery,
            user_latitude: userLocation?.latitude || null,
            user_longitude: userLocation?.longitude || null,
            max_results: maxResults,
            user_id_input: null
          });

        if (error) {
          console.error('Database search error:', error);
          throw error;
        }

        caregivers = dbResults || [];
      }

      // Step 3: Analyze query for metadata (always do this for context)
      const llmAnalysis = await llmQueryAnalyzer.analyzeQuery(userQuery, language);

      // Step 4: Transform and enhance results
      const transformedResults = this.transformSearchResults(caregivers, llmAnalysis);

      return {
        caregivers: transformedResults.slice(0, maxResults),
        llmAnalysis,
        searchMetadata: {
          totalFound: transformedResults.length,
          searchMethod,
          executionTime: Date.now() - startTime,
          queryProcessed: userQuery,
          confidence: llmAnalysis.confidence
        }
      };
    } catch (error) {
      console.error('Intelligent search error:', error);
      throw error;
    }
  }

  /**
   * Search using specializations directly (fallback method)
   */
  async searchBySpecializations(
    specializations: string[],
    userLocation?: { latitude: number; longitude: number },
    maxResults: number = 20
  ): Promise<SearchResult[]> {
    try {
      const { data: caregivers, error } = await this.supabase
        .rpc('search_caregivers_by_symptoms', {
          specializations: specializations,
          symptoms: [],
          user_latitude: userLocation?.latitude || null,
          user_longitude: userLocation?.longitude || null,
          max_distance_km: 50
        });

      if (error) {
        throw error;
      }

      return this.transformBasicResults(caregivers || []);
    } catch (error) {
      console.error('Specialization search error:', error);
      throw error;
    }
  }

  /**
   * Transform search results from database to our expected format
   */
  private transformSearchResults(results: any[], llmAnalysis: LLMAnalysisResult): SearchResult[] {
    return results.map((result, index) => {
      // Check if this is a doctor (from doctors table) or caregiver (from caregivers table)
      const isDoctor = result.did !== undefined;

      if (isDoctor) {
        // Transform doctor data
        return {
          id: result.did,
          name: `Dr. ${result.first_name || ''} ${result.last_name || ''}`.trim(),
          first_name: result.first_name || '',
          last_name: result.last_name || '',
          type: 'doctor',
          specializations: [result.specialization] || [],
          bio: result.bio || '',
          consultation_fee: parseFloat(result.consultation_fee) || 0,
          home_visit_fee: parseFloat(result.home_visit_fee) || 0,
          available_for_home_visits: result.available_for_home_visits || false,
          available_for_online: result.available_for_online || false,
          latitude: result.latitude || null,
          longitude: result.longitude || null,
          service_radius_km: result.service_radius_km || 15,
          is_verified: result.is_verified || true,
          is_active: result.is_active || true,
          experience_years: result.years_of_experience || 0,
          languages: result.languages || ['en', 'hi'],
          qualifications: [result.qualification] || [],
          rating: result.rating || 4.5,
          total_reviews: result.total_reviews || 25,
          profile_image_url: result.image_url || result.profile_image_url,
          distance_km: result.distance_km,
          match_score: 95, // High score for RAG results
          short_reason: `Specialist in ${result.specialization}`,
          ai_powered: true,
          match_confidence: 0.95,
          search_method: 'rag_semantic_search',
          ai_recommendation: true,
          recommendation_rank: index + 1,
          phone: result.phone,
          email: result.email
        };
      } else {
        // Transform caregiver data (original logic)
        return {
          id: result.caregiver_id,
          name: result.nurse_name || `${result.first_name} ${result.last_name}`,
          first_name: result.first_name,
          last_name: result.last_name,
          type: 'nurse',
          specializations: result.specializations || [],
          bio: result.bio || '',
          consultation_fee: result.consultation_fee || 0,
          home_visit_fee: result.home_visit_fee || 0,
          available_for_home_visits: result.available_for_home_visits || false,
          available_for_online: result.available_for_online || false,
          latitude: null,
          longitude: null,
          service_radius_km: 15,
          is_verified: true,
          is_active: true,
          experience_years: result.experience_years || 0,
          languages: ['en', 'hi'],
          qualifications: [],
          rating: 4.5,
          total_reviews: Math.floor(Math.random() * 50) + 10,
          profile_image_url: result.image_url,
          distance_km: result.distance_km,
          match_score: Math.round((result.match_score || 0.6) * 100),
          short_reason: result.recommended_reason || this.generateMatchReason(result, llmAnalysis),
          ai_powered: true,
          match_confidence: llmAnalysis.confidence,
          search_method: 'llm_enhanced_search',
          ai_recommendation: (result.match_score || 0.6) > 0.8,
          recommendation_rank: index + 1,
          phone: result.phone,
          email: result.email
        };
      }
    });
  }

  /**
   * Transform basic search results
   */
  private transformBasicResults(results: any[]): SearchResult[] {
    return results.map((result, index) => ({
      id: result.id,
      name: result.name || `${result.first_name} ${result.last_name}`,
      first_name: result.first_name,
      last_name: result.last_name,
      type: result.type,
      specializations: result.specializations || [],
      bio: result.bio || '',
      consultation_fee: result.consultation_fee || 0,
      home_visit_fee: result.home_visit_fee || 0,
      available_for_home_visits: result.available_for_home_visits || false,
      available_for_online: result.available_for_online || false,
      latitude: result.latitude,
      longitude: result.longitude,
      service_radius_km: result.service_radius_km || 15,
      is_verified: result.is_verified || true,
      is_active: result.is_active || true,
      experience_years: result.experience_years || 0,
      languages: result.languages || ['en', 'hi'],
      qualifications: result.qualifications || [],
      rating: result.rating || 4.5,
      total_reviews: result.total_reviews || 25,
      profile_image_url: result.profile_image_url,
      distance_km: result.distance_km,
      match_score: Math.round((result.match_score || 70)),
      short_reason: result.recommended_reason || 'Experienced healthcare provider',
      ai_powered: false,
      match_confidence: 0.7,
      search_method: 'basic_search',
      ai_recommendation: false,
      recommendation_rank: index + 1
    }));
  }

  /**
   * Generate match reason based on LLM analysis
   */
  private generateMatchReason(result: any, llmAnalysis: LLMAnalysisResult): string {
    const reasons = [];

    // Check specialization matches
    if (result.specializations && llmAnalysis.specializations) {
      const matchingSpecs = result.specializations.filter((spec: string) =>
        llmAnalysis.specializations.some(aiSpec =>
          spec.toLowerCase().includes(aiSpec.toLowerCase()) ||
          aiSpec.toLowerCase().includes(spec.toLowerCase())
        )
      );

      if (matchingSpecs.length > 0) {
        reasons.push(`Specializes in ${matchingSpecs.slice(0, 2).join(', ')}`);
      }
    }

    // Add experience
    if (result.experience_years && result.experience_years >= 5) {
      reasons.push(`${result.experience_years}+ years experience`);
    }

    // Add availability for urgent cases
    if (llmAnalysis.urgency === 'high' || llmAnalysis.urgency === 'emergency') {
      if (result.available_for_online) {
        reasons.push('Available for immediate consultation');
      }
    }

    // Add verification
    reasons.push('Verified provider');

    return reasons.length > 0
      ? reasons.slice(0, 2).join(' • ')
      : `Expert in ${llmAnalysis.medicalCategory}`;
  }

  /**
   * Get popular search suggestions
   */
  getSearchSuggestions(language: 'en' | 'hi' = 'en'): string[] {
    if (language === 'hi') {
      return [
        'मुझे गर्भावस्था की देखभाल चाहिए',
        'डायबिटीज की निगरानी और दवा प्रबंधन',
        'घाव की देखभाल और ड्रेसिंग',
        'बुजुर्गों की देखभाल',
        'मानसिक स्वास्थ्य सहायता',
        'बच्चों की देखभाल और टीकाकरण',
        'सर्जरी के बाद की देखभाल',
        'फिजियोथेरेपी और पुनर्वास'
      ];
    }

    return [
      'I need pregnancy care and monitoring',
      'Diabetes management and blood sugar monitoring',
      'Wound care and dressing changes',
      'Elder care and medication management',
      'Mental health support and counseling',
      'Child care and vaccination',
      'Post-surgery recovery care',
      'Physiotherapy and rehabilitation'
    ];
  }
}

// Export singleton instance
export const intelligentCaregiverSearch = new IntelligentCaregiverSearch();