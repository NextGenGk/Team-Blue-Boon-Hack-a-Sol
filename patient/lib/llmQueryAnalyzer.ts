// LLM Query Analyzer for Healthcare Search
// This service analyzes user queries and extracts relevant medical information

export interface LLMAnalysisResult {
  symptoms: string[];
  conditions: string[];
  specializations: string[];
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  confidence: number;
  reasoning: string;
  caregiverType: 'nurse' | 'doctor' | 'both';
  searchKeywords: string[];
  medicalCategory: string;
}

export class LLMQueryAnalyzer {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    // You can use any LLM service - OpenAI, Groq, Claude, etc.
    this.apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY || '';
    this.baseUrl = 'https://api.groq.com/openai/v1';
  }

  /**
   * Analyze user query using LLM to extract medical information
   */
  async analyzeQuery(userQuery: string, language: 'en' | 'hi' = 'en'): Promise<LLMAnalysisResult> {
    try {
      const prompt = this.buildAnalysisPrompt(userQuery, language);
      
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mixtral-8x7b-32768',
          messages: [
            {
              role: 'system',
              content: 'You are a medical AI assistant that analyzes patient queries and extracts relevant medical information. Always respond with valid JSON only.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        throw new Error(`LLM API error: ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No response from LLM');
      }

      // Parse the JSON response
      const analysis = JSON.parse(content);
      
      // Validate and normalize the response
      return this.validateAndNormalizeResponse(analysis);
      
    } catch (error) {
      console.error('LLM Analysis Error:', error);
      
      // Fallback to rule-based analysis if LLM fails
      return this.fallbackAnalysis(userQuery);
    }
  }

  /**
   * Build the analysis prompt for the LLM
   */
  private buildAnalysisPrompt(userQuery: string, language: 'en' | 'hi'): string {
    return `
Analyze this healthcare query and extract medical information. The user is looking for healthcare providers (nurses/doctors).

User Query: "${userQuery}"
Language: ${language}

Based on your database schema, these are the available specializations:
- Pregnancy Care, ANC Care, Postnatal Care, Lactation Support
- Mental Health Support, Anxiety Treatment, Depression Care, Counseling, Therapy
- Diabetes Care, Hypertension, Chronic Disease Management, Diet Counseling
- Elder Care, Geriatric Care, Physiotherapy Support, Palliative Care
- Wound Care, Post-Surgery Care, Dressing, Plastic Surgery, Burn Care
- Childcare, Pediatrics, Vaccination, Newborn Care
- ICU Support, Critical Care, Emergency Medicine, IV Therapy, Monitoring
- General Care, Family Medicine, Preventive Care, Health Monitoring
- Physiotherapy, Rehabilitation, Sports Medicine, Exercise Therapy
- Vaccination, Immunization, Travel Medicine
- Ayurvedic Medicine, Herbal Treatment, Holistic Care
- Home Nursing, Patient Care, Medication Administration
- Dermatology, Skin Care, Cosmetic Treatment
- Cardiology, Heart Care
- Oncology Support, Cancer Care

Respond with ONLY a JSON object in this exact format:
{
  "symptoms": ["list of symptoms mentioned"],
  "conditions": ["possible medical conditions"],
  "specializations": ["matching specializations from the list above"],
  "urgency": "low|medium|high|emergency",
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation of analysis",
  "caregiverType": "nurse|doctor|both",
  "searchKeywords": ["relevant search terms"],
  "medicalCategory": "primary medical category"
}

Rules:
1. Only use specializations from the provided list
2. Match symptoms to appropriate specializations
3. Set urgency based on severity (emergency for chest pain, breathing issues)
4. All caregivers in the database are nurses who can provide medical care
5. Confidence should reflect how certain you are about the matches
6. Include relevant search keywords for database matching
`;
  }

  /**
   * Validate and normalize the LLM response
   */
  private validateAndNormalizeResponse(analysis: any): LLMAnalysisResult {
    return {
      symptoms: Array.isArray(analysis.symptoms) ? analysis.symptoms : [],
      conditions: Array.isArray(analysis.conditions) ? analysis.conditions : [],
      specializations: Array.isArray(analysis.specializations) ? analysis.specializations : [],
      urgency: ['low', 'medium', 'high', 'emergency'].includes(analysis.urgency) ? analysis.urgency : 'low',
      confidence: typeof analysis.confidence === 'number' ? Math.max(0, Math.min(1, analysis.confidence)) : 0.7,
      reasoning: typeof analysis.reasoning === 'string' ? analysis.reasoning : 'Analysis completed',
      caregiverType: ['nurse', 'doctor', 'both'].includes(analysis.caregiverType) ? analysis.caregiverType : 'nurse',
      searchKeywords: Array.isArray(analysis.searchKeywords) ? analysis.searchKeywords : [],
      medicalCategory: typeof analysis.medicalCategory === 'string' ? analysis.medicalCategory : 'General Care'
    };
  }

  /**
   * Fallback rule-based analysis if LLM fails
   */
  private fallbackAnalysis(userQuery: string): LLMAnalysisResult {
    const query = userQuery.toLowerCase();
    
    // Pregnancy-related
    if (query.includes('pregnancy') || query.includes('pregnant') || query.includes('anc') || query.includes('postnatal')) {
      return {
        symptoms: ['pregnancy symptoms'],
        conditions: ['pregnancy', 'maternal health'],
        specializations: ['Pregnancy Care', 'ANC Care', 'Postnatal Care'],
        urgency: 'medium',
        confidence: 0.8,
        reasoning: 'Pregnancy-related query detected',
        caregiverType: 'nurse',
        searchKeywords: ['pregnancy', 'maternal', 'anc'],
        medicalCategory: 'Maternal Health'
      };
    }
    
    // Mental health
    if (query.includes('mental') || query.includes('anxiety') || query.includes('depression') || query.includes('stress')) {
      return {
        symptoms: ['mental health concerns'],
        conditions: ['anxiety', 'depression'],
        specializations: ['Mental Health Support', 'Anxiety Treatment', 'Depression Care'],
        urgency: 'medium',
        confidence: 0.8,
        reasoning: 'Mental health query detected',
        caregiverType: 'nurse',
        searchKeywords: ['mental', 'anxiety', 'depression'],
        medicalCategory: 'Mental Health'
      };
    }
    
    // Diabetes
    if (query.includes('diabetes') || query.includes('blood sugar') || query.includes('diabetic')) {
      return {
        symptoms: ['diabetes symptoms'],
        conditions: ['diabetes'],
        specializations: ['Diabetes Care', 'Chronic Disease Management'],
        urgency: 'medium',
        confidence: 0.9,
        reasoning: 'Diabetes-related query detected',
        caregiverType: 'nurse',
        searchKeywords: ['diabetes', 'blood sugar'],
        medicalCategory: 'Chronic Care'
      };
    }
    
    // Wound care
    if (query.includes('wound') || query.includes('dressing') || query.includes('surgery') || query.includes('cut')) {
      return {
        symptoms: ['wound care needs'],
        conditions: ['wound management'],
        specializations: ['Wound Care', 'Post-Surgery Care', 'Dressing'],
        urgency: 'medium',
        confidence: 0.8,
        reasoning: 'Wound care query detected',
        caregiverType: 'nurse',
        searchKeywords: ['wound', 'dressing', 'surgery'],
        medicalCategory: 'Wound Care'
      };
    }
    
    // Elder care
    if (query.includes('elder') || query.includes('elderly') || query.includes('senior') || query.includes('old age')) {
      return {
        symptoms: ['elderly care needs'],
        conditions: ['aging-related issues'],
        specializations: ['Elder Care', 'Geriatric Care'],
        urgency: 'low',
        confidence: 0.8,
        reasoning: 'Elder care query detected',
        caregiverType: 'nurse',
        searchKeywords: ['elder', 'elderly', 'geriatric'],
        medicalCategory: 'Elder Care'
      };
    }
    
    // Child care
    if (query.includes('child') || query.includes('baby') || query.includes('pediatric') || query.includes('kid')) {
      return {
        symptoms: ['pediatric concerns'],
        conditions: ['child health'],
        specializations: ['Childcare', 'Pediatrics', 'Vaccination'],
        urgency: 'medium',
        confidence: 0.8,
        reasoning: 'Pediatric query detected',
        caregiverType: 'nurse',
        searchKeywords: ['child', 'pediatric', 'baby'],
        medicalCategory: 'Pediatric Care'
      };
    }
    
    // Default general care
    return {
      symptoms: [userQuery],
      conditions: ['general health concern'],
      specializations: ['General Care', 'Family Medicine'],
      urgency: 'low',
      confidence: 0.6,
      reasoning: 'General healthcare query',
      caregiverType: 'nurse',
      searchKeywords: [userQuery],
      medicalCategory: 'General Care'
    };
  }
}

// Export singleton instance
export const llmQueryAnalyzer = new LLMQueryAnalyzer();