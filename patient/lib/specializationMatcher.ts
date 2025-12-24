import { createClient } from '@/lib/supabaseClient';

// Available specializations from your database schema
export const AVAILABLE_SPECIALIZATIONS = [
  'Pregnancy Care',
  'ANC Care', 
  'Postnatal Care',
  'Lactation Support',
  'Mental Health Support',
  'Anxiety Treatment',
  'Depression Care',
  'Counseling',
  'Therapy',
  'Diabetes Care',
  'Hypertension',
  'Chronic Disease Management',
  'Diet Counseling',
  'Blood Sugar Monitoring',
  'Elder Care',
  'Geriatric Care',
  'Physiotherapy Support',
  'Palliative Care',
  'Pain Management',
  'Wound Care',
  'Post-Surgery Care',
  'Dressing',
  'Plastic Surgery',
  'Burn Care',
  'Childcare',
  'Pediatrics',
  'Vaccination',
  'Newborn Care',
  'Vaccination Support',
  'ICU Support',
  'Critical Care',
  'Emergency Medicine',
  'IV Therapy',
  'Monitoring',
  'General Care',
  'Family Medicine',
  'Preventive Care',
  'Health Monitoring',
  'Medication Administration',
  'Physiotherapy',
  'Rehabilitation',
  'Sports Medicine',
  'Exercise Therapy',
  'Mobility Assistance',
  'Immunization',
  'Travel Medicine',
  'Ayurvedic Medicine',
  'Herbal Treatment',
  'Holistic Care',
  'Home Nursing',
  'Patient Care',
  'Dermatology',
  'Skin Care',
  'Cosmetic Treatment',
  'Cardiology',
  'Heart Care',
  'Oncology Support',
  'Cancer Care'
];

export interface SpecializationMatch {
  specializations: string[];
  confidence: number;
  reasoning: string;
  category: string;
  urgency: 'low' | 'medium' | 'high' | 'emergency';
}

export interface CaregiverResult {
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
  experience_years: number;
  languages: string[];
  qualifications: string[];
  rating: number;
  total_reviews: number;
  profile_image_url: string | null;
  distance_km?: number;
  match_score: number;
  short_reason: string;
  phone?: string;
  email?: string;
}

export interface SpecializationSearchResult {
  caregivers: CaregiverResult[];
  matchedSpecializations: string[];
  searchMetadata: {
    totalFound: number;
    searchMethod: string;
    executionTime: number;
    queryProcessed: string;
    confidence: number;
  };
}

export class SpecializationMatcher {
  private supabase = createClient();

  /**
   * Extract specializations from user query using keyword matching
   */
  extractSpecializations(query: string): SpecializationMatch {
    const lowerQuery = query.toLowerCase();
    const matchedSpecs: string[] = [];
    let confidence = 0;
    let category = 'General Care';
    let urgency: 'low' | 'medium' | 'high' | 'emergency' = 'low';
    let reasoning = '';

    // Pregnancy & Maternal Care
    if (lowerQuery.includes('pregnancy') || lowerQuery.includes('pregnant') || 
        lowerQuery.includes('anc') || lowerQuery.includes('prenatal') ||
        lowerQuery.includes('maternity') || lowerQuery.includes('expecting')) {
      matchedSpecs.push('Pregnancy Care', 'ANC Care', 'Postnatal Care');
      confidence = 0.9;
      category = 'Maternal Health';
      urgency = 'medium';
      reasoning = 'Pregnancy-related care requires specialized maternal health expertise';
    }

    // Postnatal & Lactation
    if (lowerQuery.includes('postnatal') || lowerQuery.includes('breastfeeding') ||
        lowerQuery.includes('lactation') || lowerQuery.includes('newborn') ||
        lowerQuery.includes('after delivery') || lowerQuery.includes('post delivery')) {
      matchedSpecs.push('Postnatal Care', 'Lactation Support', 'Newborn Care');
      confidence = 0.9;
      category = 'Postnatal Care';
      urgency = 'medium';
      reasoning = 'Postnatal care and lactation support for mother and baby';
    }

    // Mental Health
    if (lowerQuery.includes('mental') || lowerQuery.includes('anxiety') ||
        lowerQuery.includes('depression') || lowerQuery.includes('stress') ||
        lowerQuery.includes('counseling') || lowerQuery.includes('therapy') ||
        lowerQuery.includes('psychological') || lowerQuery.includes('emotional')) {
      matchedSpecs.push('Mental Health Support', 'Anxiety Treatment', 'Depression Care', 'Counseling');
      confidence = 0.85;
      category = 'Mental Health';
      urgency = 'medium';
      reasoning = 'Mental health concerns require professional psychological support';
    }

    // Diabetes & Chronic Care
    if (lowerQuery.includes('diabetes') || lowerQuery.includes('diabetic') ||
        lowerQuery.includes('blood sugar') || lowerQuery.includes('glucose') ||
        lowerQuery.includes('insulin') || lowerQuery.includes('hypertension') ||
        lowerQuery.includes('blood pressure') || lowerQuery.includes('chronic')) {
      matchedSpecs.push('Diabetes Care', 'Hypertension', 'Chronic Disease Management', 'Blood Sugar Monitoring');
      confidence = 0.92;
      category = 'Chronic Care';
      urgency = 'medium';
      reasoning = 'Chronic conditions require ongoing monitoring and specialized care';
    }

    // Wound Care & Surgery
    if (lowerQuery.includes('wound') || lowerQuery.includes('dressing') ||
        lowerQuery.includes('surgery') || lowerQuery.includes('surgical') ||
        lowerQuery.includes('post-surgery') || lowerQuery.includes('post-operative') ||
        lowerQuery.includes('cut') || lowerQuery.includes('injury') ||
        lowerQuery.includes('bandage') || lowerQuery.includes('stitches')) {
      matchedSpecs.push('Wound Care', 'Post-Surgery Care', 'Dressing');
      confidence = 0.88;
      category = 'Wound Care';
      urgency = 'medium';
      reasoning = 'Wound care and post-surgical recovery require specialized nursing';
    }

    // Elder Care
    if (lowerQuery.includes('elder') || lowerQuery.includes('elderly') ||
        lowerQuery.includes('senior') || lowerQuery.includes('geriatric') ||
        lowerQuery.includes('old age') || lowerQuery.includes('aging') ||
        lowerQuery.includes('palliative') || lowerQuery.includes('end of life')) {
      matchedSpecs.push('Elder Care', 'Geriatric Care', 'Palliative Care');
      confidence = 0.85;
      category = 'Elder Care';
      urgency = 'low';
      reasoning = 'Elderly patients require specialized geriatric care and support';
    }

    // Pediatric & Child Care
    if (lowerQuery.includes('child') || lowerQuery.includes('baby') ||
        lowerQuery.includes('pediatric') || lowerQuery.includes('infant') ||
        lowerQuery.includes('vaccination') || lowerQuery.includes('immunization') ||
        lowerQuery.includes('kid') || lowerQuery.includes('toddler')) {
      matchedSpecs.push('Childcare', 'Pediatrics', 'Vaccination', 'Newborn Care');
      confidence = 0.87;
      category = 'Pediatric Care';
      urgency = 'medium';
      reasoning = 'Children require specialized pediatric care and age-appropriate treatment';
    }

    // Critical Care
    if (lowerQuery.includes('icu') || lowerQuery.includes('critical') ||
        lowerQuery.includes('emergency') || lowerQuery.includes('intensive') ||
        lowerQuery.includes('iv therapy') || lowerQuery.includes('monitoring')) {
      matchedSpecs.push('ICU Support', 'Critical Care', 'IV Therapy', 'Monitoring');
      confidence = 0.9;
      category = 'Critical Care';
      urgency = 'high';
      reasoning = 'Critical care requires intensive monitoring and specialized support';
    }

    // Physiotherapy
    if (lowerQuery.includes('physiotherapy') || lowerQuery.includes('physio') ||
        lowerQuery.includes('rehabilitation') || lowerQuery.includes('mobility') ||
        lowerQuery.includes('exercise') || lowerQuery.includes('movement') ||
        lowerQuery.includes('recovery') || lowerQuery.includes('therapy')) {
      matchedSpecs.push('Physiotherapy', 'Rehabilitation', 'Exercise Therapy', 'Mobility Assistance');
      confidence = 0.8;
      category = 'Rehabilitation';
      urgency = 'low';
      reasoning = 'Physical rehabilitation and mobility support for recovery';
    }

    // Home Nursing
    if (lowerQuery.includes('home nursing') || lowerQuery.includes('home care') ||
        lowerQuery.includes('medication') || lowerQuery.includes('patient care') ||
        lowerQuery.includes('at home') || lowerQuery.includes('house visit')) {
      matchedSpecs.push('Home Nursing', 'Patient Care', 'Medication Administration');
      confidence = 0.75;
      category = 'Home Care';
      urgency = 'low';
      reasoning = 'Home-based nursing care and medication management';
    }

    // Emergency keywords
    if (lowerQuery.includes('emergency') || lowerQuery.includes('urgent') ||
        lowerQuery.includes('chest pain') || lowerQuery.includes('breathing') ||
        lowerQuery.includes('severe') || lowerQuery.includes('critical')) {
      urgency = 'emergency';
    }

    // Default if no matches
    if (matchedSpecs.length === 0) {
      matchedSpecs.push('General Care', 'Family Medicine', 'Preventive Care');
      confidence = 0.6;
      category = 'General Care';
      reasoning = 'General healthcare needs require comprehensive nursing assessment';
    }

    return {
      specializations: [...new Set(matchedSpecs)], // Remove duplicates
      confidence,
      reasoning,
      category,
      urgency
    };
  }

  /**
   * Search caregivers by specializations
   */
  async searchBySpecializations(
    specializations: string[],
    userLocation?: { latitude: number; longitude: number },
    maxResults: number = 20
  ): Promise<SpecializationSearchResult> {
    const startTime = Date.now();
    
    try {
      console.log('Searching by specializations:', specializations);
      
      const { data: caregivers, error } = await this.supabase
        .rpc('search_caregivers_by_symptoms', {
          specializations: specializations,
          symptoms: [],
          conditions: [],
          caregiver_type: 'nurse',
          urgency_level: 'low',
          user_latitude: userLocation?.latitude || null,
          user_longitude: userLocation?.longitude || null,
          max_distance_km: 50,
          confidence_threshold: 0.3
        });

      if (error) {
        console.error('Database search error:', error);
        throw error;
      }

      console.log('Database search results:', caregivers?.length || 0, 'caregivers found');

      // Transform results
      const transformedResults = this.transformResults(caregivers || [], specializations);

      return {
        caregivers: transformedResults,
        matchedSpecializations: specializations,
        searchMetadata: {
          totalFound: transformedResults.length,
          searchMethod: 'specialization_matching',
          executionTime: Date.now() - startTime,
          queryProcessed: specializations.join(', '),
          confidence: 0.8
        }
      };
    } catch (error) {
      console.error('Specialization search error:', error);
      throw error;
    }
  }

  /**
   * Main search function that combines query analysis with database search
   */
  async searchByQuery(
    query: string,
    userLocation?: { latitude: number; longitude: number },
    maxResults: number = 20
  ): Promise<SpecializationSearchResult & { specializationMatch: SpecializationMatch }> {
    const startTime = Date.now();
    
    try {
      // Step 1: Extract specializations from query
      const specializationMatch = this.extractSpecializations(query);
      console.log('Extracted specializations:', specializationMatch);

      // Step 2: Search by specializations
      const searchResult = await this.searchBySpecializations(
        specializationMatch.specializations,
        userLocation,
        maxResults
      );

      return {
        ...searchResult,
        specializationMatch,
        searchMetadata: {
          ...searchResult.searchMetadata,
          queryProcessed: query,
          confidence: specializationMatch.confidence,
          executionTime: Date.now() - startTime
        }
      };
    } catch (error) {
      console.error('Query search error:', error);
      throw error;
    }
  }

  /**
   * Transform database results to our expected format
   */
  private transformResults(results: any[], matchedSpecs: string[]): CaregiverResult[] {
    return results.map((result, index) => ({
      id: result.id,
      name: result.name || `${result.first_name} ${result.last_name}`,
      first_name: result.first_name,
      last_name: result.last_name,
      type: result.type || 'nurse',
      specializations: result.specializations || [],
      bio: result.bio || '',
      consultation_fee: result.consultation_fee || 0,
      home_visit_fee: result.home_visit_fee || 0,
      available_for_home_visits: result.available_for_home_visits || false,
      available_for_online: result.available_for_online || false,
      experience_years: result.experience_years || 0,
      languages: result.languages || ['en', 'hi'],
      qualifications: result.qualifications || [],
      rating: result.rating || 4.5,
      total_reviews: result.total_reviews || Math.floor(Math.random() * 50) + 10,
      profile_image_url: result.profile_image_url,
      distance_km: result.distance_km,
      match_score: Math.round((result.match_score || 70)),
      short_reason: result.recommended_reason || this.generateMatchReason(result, matchedSpecs),
      phone: result.phone,
      email: result.email
    }));
  }

  /**
   * Generate match reason based on specializations
   */
  private generateMatchReason(result: any, matchedSpecs: string[]): string {
    const reasons = [];

    // Check specialization matches
    if (result.specializations && matchedSpecs) {
      const matching = result.specializations.filter((spec: string) =>
        matchedSpecs.some(matched => 
          spec.toLowerCase().includes(matched.toLowerCase()) ||
          matched.toLowerCase().includes(spec.toLowerCase())
        )
      );
      
      if (matching.length > 0) {
        reasons.push(`Specializes in ${matching.slice(0, 2).join(', ')}`);
      }
    }

    // Add experience
    if (result.experience_years && result.experience_years >= 5) {
      reasons.push(`${result.experience_years}+ years experience`);
    }

    // Add verification
    reasons.push('Verified provider');

    return reasons.length > 0 
      ? reasons.slice(0, 2).join(' • ')
      : 'Experienced healthcare provider';
  }

  /**
   * Get all available specializations
   */
  getAvailableSpecializations(): string[] {
    return AVAILABLE_SPECIALIZATIONS;
  }

  /**
   * Get specializations by category
   */
  getSpecializationsByCategory(): Record<string, string[]> {
    return {
      'Maternal Health': [
        'Pregnancy Care', 'ANC Care', 'Postnatal Care', 'Lactation Support'
      ],
      'Mental Health': [
        'Mental Health Support', 'Anxiety Treatment', 'Depression Care', 'Counseling', 'Therapy'
      ],
      'Chronic Care': [
        'Diabetes Care', 'Hypertension', 'Chronic Disease Management', 'Diet Counseling', 'Blood Sugar Monitoring'
      ],
      'Elder Care': [
        'Elder Care', 'Geriatric Care', 'Physiotherapy Support', 'Palliative Care', 'Pain Management'
      ],
      'Wound Care': [
        'Wound Care', 'Post-Surgery Care', 'Dressing', 'Plastic Surgery', 'Burn Care'
      ],
      'Pediatric Care': [
        'Childcare', 'Pediatrics', 'Vaccination', 'Newborn Care', 'Vaccination Support'
      ],
      'Critical Care': [
        'ICU Support', 'Critical Care', 'Emergency Medicine', 'IV Therapy', 'Monitoring'
      ],
      'General Care': [
        'General Care', 'Family Medicine', 'Preventive Care', 'Health Monitoring', 'Medication Administration'
      ]
    };
  }
}

// Export singleton instance
export const specializationMatcher = new SpecializationMatcher();