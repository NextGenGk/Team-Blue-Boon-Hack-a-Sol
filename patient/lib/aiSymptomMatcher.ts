import { createClient } from '@/lib/supabaseClient';

export interface AIAnalysisResponse {
  symptoms: string[];
  conditions: string[];
  specializations: string[];
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  confidence: number;
  reasoning: string;
  caregiver_type?: 'doctor' | 'nurse' | 'both';
}

export interface SymptomMatchResult {
  caregivers: any[];
  aiAnalysis: AIAnalysisResponse;
  searchMetadata: {
    totalFound: number;
    searchMethod: string;
    executionTime: number;
  };
}

export class AISymptomMatcher {
  private supabase = createClient();

  /**
   * Find caregivers based on AI-analyzed symptoms
   */
  async findCaregiversBySymptoms(
    aiAnalysis: AIAnalysisResponse,
    userLocation?: { latitude: number; longitude: number },
    maxDistance: number = 50
  ): Promise<SymptomMatchResult> {
    const startTime = Date.now();
    
    try {
      // Use the existing search function from your schema
      const { data: caregivers, error } = await this.supabase
        .rpc('search_caregivers_ai_enhanced', {
          symptoms_input: aiAnalysis.symptoms,
          query_text: aiAnalysis.reasoning,
          user_latitude: userLocation?.latitude || null,
          user_longitude: userLocation?.longitude || null,
          max_results: 20,
          user_id_input: null // Will be set when user is authenticated
        });

      if (error) {
        console.error('Error searching caregivers:', error);
        throw error;
      }

      // Transform the results to match our expected format
      const transformedCaregivers = this.transformSearchResults(caregivers || [], aiAnalysis);

      return {
        caregivers: transformedCaregivers,
        aiAnalysis,
        searchMetadata: {
          totalFound: transformedCaregivers.length,
          searchMethod: 'ai_enhanced_search',
          executionTime: Date.now() - startTime
        }
      };
    } catch (error) {
      console.error('Error in AI symptom matching:', error);
      throw error;
    }
  }

  /**
   * Transform search results from database to our expected format
   */
  private transformSearchResults(results: any[], aiAnalysis: AIAnalysisResponse): any[] {
    return results.map(result => ({
      id: result.caregiver_id,
      name: result.nurse_name,
      first_name: result.first_name,
      last_name: result.last_name,
      type: 'nurse', // All caregivers are nurses in your schema
      specializations: result.specializations || [],
      bio: result.bio,
      consultation_fee: result.consultation_fee,
      home_visit_fee: result.home_visit_fee,
      available_for_home_visits: result.available_for_home_visits,
      available_for_online: result.available_for_online,
      latitude: null, // Not returned by the function
      longitude: null, // Not returned by the function
      service_radius_km: 15, // Default value
      is_verified: true, // All returned caregivers are verified
      is_active: true, // All returned caregivers are active
      experience_years: result.experience_years,
      languages: ['en', 'hi'], // Default languages
      qualifications: [], // Not in the return structure
      rating: 4.5, // Default rating (you may want to add this to your schema)
      total_reviews: Math.floor(Math.random() * 50) + 10, // Mock reviews
      profile_image_url: result.image_url,
      center_id: null,
      match_score: Math.round((result.match_score || 0.6) * 100),
      short_reason: result.recommended_reason,
      ai_powered: true,
      match_confidence: aiAnalysis.confidence,
      distance_km: result.distance_km,
      search_method: 'ai_enhanced_search',
      ai_recommendation: (result.match_score || 0.6) > 0.8,
      recommendation_rank: this.calculateRecommendationRank(result, aiAnalysis),
      phone: result.phone,
      email: result.email
    }));
  }

  /**
   * Get user's current location with permission
   */
  async getUserLocation(): Promise<{ latitude: number; longitude: number } | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.warn('Geolocation error:', error);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  /**
   * Calculate AI-based match score for a caregiver
   */
  private calculateAIMatchScore(caregiver: any, aiAnalysis: AIAnalysisResponse): number {
    let score = 0;
    let maxScore = 0;

    // Specialization matching (40% weight)
    const specializationWeight = 40;
    maxScore += specializationWeight;
    
    if (caregiver.specializations && aiAnalysis.specializations) {
      const matchingSpecs = caregiver.specializations.filter((spec: string) =>
        aiAnalysis.specializations.some(aiSpec => 
          spec.toLowerCase().includes(aiSpec.toLowerCase()) ||
          aiSpec.toLowerCase().includes(spec.toLowerCase())
        )
      );
      score += (matchingSpecs.length / aiAnalysis.specializations.length) * specializationWeight;
    }

    // Experience relevance (20% weight)
    const experienceWeight = 20;
    maxScore += experienceWeight;
    
    if (caregiver.experience_years) {
      // Higher experience gets better score, with diminishing returns
      const experienceScore = Math.min(caregiver.experience_years / 10, 1);
      score += experienceScore * experienceWeight;
    }

    // Rating and reviews (20% weight)
    const ratingWeight = 20;
    maxScore += ratingWeight;
    
    if (caregiver.rating && caregiver.total_reviews) {
      const ratingScore = (caregiver.rating / 5) * Math.min(caregiver.total_reviews / 10, 1);
      score += ratingScore * ratingWeight;
    }

    // Availability matching (10% weight)
    const availabilityWeight = 10;
    maxScore += availabilityWeight;
    
    if (caregiver.available_for_online || caregiver.available_for_home_visits) {
      score += availabilityWeight;
    }

    // Urgency matching (10% weight)
    const urgencyWeight = 10;
    maxScore += urgencyWeight;
    
    if (aiAnalysis.urgency === 'high' || aiAnalysis.urgency === 'emergency') {
      if (caregiver.available_for_online) {
        score += urgencyWeight; // Online availability is crucial for urgent cases
      }
    } else {
      score += urgencyWeight * 0.5; // Less critical for non-urgent cases
    }

    // Normalize to percentage
    return Math.min(Math.round((score / maxScore) * 100), 100);
  }

  /**
   * Generate human-readable match reason
   */
  private generateMatchReason(caregiver: any, aiAnalysis: AIAnalysisResponse): string {
    const reasons = [];

    // Specialization match
    if (caregiver.specializations && aiAnalysis.specializations) {
      const matchingSpecs = caregiver.specializations.filter((spec: string) =>
        aiAnalysis.specializations.some(aiSpec => 
          spec.toLowerCase().includes(aiSpec.toLowerCase()) ||
          aiSpec.toLowerCase().includes(spec.toLowerCase())
        )
      );
      
      if (matchingSpecs.length > 0) {
        reasons.push(`Specializes in ${matchingSpecs.slice(0, 2).join(', ')}`);
      }
    }

    // Experience
    if (caregiver.experience_years && caregiver.experience_years >= 5) {
      reasons.push(`${caregiver.experience_years}+ years experience`);
    }

    // High rating
    if (caregiver.rating && caregiver.rating >= 4.0) {
      reasons.push(`Highly rated (${caregiver.rating.toFixed(1)}★)`);
    }

    // Availability for urgent cases
    if (aiAnalysis.urgency === 'high' || aiAnalysis.urgency === 'emergency') {
      if (caregiver.available_for_online) {
        reasons.push('Available for immediate online consultation');
      }
    }

    // Verification
    if (caregiver.is_verified) {
      reasons.push('Verified provider');
    }

    return reasons.length > 0 
      ? reasons.slice(0, 2).join(' • ')
      : 'Matches your health needs';
  }

  /**
   * Calculate recommendation rank for sorting
   */
  private calculateRecommendationRank(caregiver: any, aiAnalysis: AIAnalysisResponse): number {
    let rank = 0;

    // Primary factors
    if (caregiver.specializations && aiAnalysis.specializations) {
      const hasExactMatch = caregiver.specializations.some((spec: string) =>
        aiAnalysis.specializations.some(aiSpec => 
          spec.toLowerCase() === aiSpec.toLowerCase()
        )
      );
      if (hasExactMatch) rank += 100;
    }

    // Secondary factors
    if (caregiver.is_verified) rank += 50;
    if (caregiver.rating >= 4.5) rank += 30;
    if (caregiver.experience_years >= 10) rank += 20;
    
    // Urgency factors
    if (aiAnalysis.urgency === 'high' || aiAnalysis.urgency === 'emergency') {
      if (caregiver.available_for_online) rank += 40;
    }

    return rank;
  }
}

// Export singleton instance
export const aiSymptomMatcher = new AISymptomMatcher();