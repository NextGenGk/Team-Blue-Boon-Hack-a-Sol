import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// AI Search Prompt Template
const AI_SEARCH_PROMPT = `
You are a medical AI assistant helping patients find the right caregivers in India. 
Analyze the user's query and provide structured recommendations.

User Query: {query}
User Location: {location}
Available Caregivers: {caregivers}
Language: {language}

Instructions:
1. Extract symptoms, medical conditions, and context from the query
2. Consider user's location for distance calculations
3. Match symptoms to appropriate specialist types
4. Rank caregivers by relevance, distance, and rating
5. Provide clear reasoning for each recommendation
6. Respond in {language} language
7. Include confidence score (0-1)

Response format (JSON):
{
  "extracted_symptoms": ["symptom1", "symptom2"],
  "recommended_specialist": "doctor|nurse|therapist",
  "matches": [
    {
      "caregiver_id": "uuid",
      "match_score": 0.95,
      "reasoning": "Brief explanation",
      "distance_km": 2.5
    }
  ],
  "confidence": 0.85,
  "language": "en|hi"
}

Temperature: 0.2 for consistent ranking
`;

// Prakriti Diet Suggestion Prompt Template
const PRAKRITI_DIET_PROMPT = `
You are an Ayurvedic nutrition expert. Generate personalized diet recommendations based on prakriti assessment.

Patient Details:
- Prakriti: {prakriti}
- Current Symptoms: {symptoms}
- Allergies: {allergies}
- Pregnancy Status: {pregnancy}
- Age Group: {age_group}
- Language: {language}

RAG Context: {rag_context}

Instructions:
1. Consider the patient's prakriti (Vata/Pitta/Kapha constitution)
2. Address current symptoms with appropriate foods
3. Avoid allergenic foods completely
4. Modify recommendations for pregnancy if applicable
5. Include meal timings and preparation methods
6. Suggest herbal supplements (mark as "requires doctor approval")
7. Provide contraindications and warnings
8. Respond in {language} language

Response format (JSON):
{
  "diet_plan": {
    "recommended_foods": ["food1", "food2"],
    "foods_to_avoid": ["food1", "food2"],
    "meal_timings": {
      "breakfast": "6-8 AM",
      "lunch": "12-1 PM",
      "dinner": "6-7 PM"
    },
    "preparation_methods": ["steaming", "boiling"],
    "herbal_suggestions": [
      {
        "herb": "Triphala",
        "dosage": "1 tsp with warm water",
        "timing": "before bed",
        "requires_approval": true
      }
    ]
  },
  "contraindications": ["warning1", "warning2"],
  "confidence": 0.8,
  "requires_doctor_approval": true,
  "language": "en|hi"
}

Temperature: 0.7 for creative but safe suggestions
`;

// Triage Symptom Checker Prompt Template
const TRIAGE_PROMPT = `
You are a medical triage assistant. Assess symptom urgency and provide guidance.

Symptoms: {symptoms}
Patient Age: {age}
Gender: {gender}
Pregnancy: {pregnancy}
Current Medications: {medications}
Language: {language}

Instructions:
1. Assess urgency level: emergency, urgent, routine, self-care
2. Provide immediate care instructions if needed
3. Recommend appropriate caregiver type
4. Include red flag symptoms to watch for
5. Respond in {language} language
6. Always recommend professional consultation for serious symptoms

Response format (JSON):
{
  "urgency_level": "emergency|urgent|routine|self_care",
  "immediate_actions": ["action1", "action2"],
  "recommended_caregiver": "doctor|nurse|emergency",
  "red_flags": ["symptom1", "symptom2"],
  "self_care_tips": ["tip1", "tip2"],
  "follow_up_timeframe": "immediately|24h|3days|1week",
  "confidence": 0.9,
  "disclaimer": "This is not a substitute for professional medical advice",
  "language": "en|hi"
}

Temperature: 0.1 for conservative medical advice
`;

export interface AISearchResult {
  extracted_symptoms: string[];
  recommended_specialist: string;
  matches: Array<{
    caregiver_id: string;
    match_score: number;
    reasoning: string;
    distance_km: number;
  }>;
  confidence: number;
  language: string;
}

export interface PrakritiDietResult {
  diet_plan: {
    recommended_foods: string[];
    foods_to_avoid: string[];
    meal_timings: Record<string, string>;
    preparation_methods: string[];
    herbal_suggestions: Array<{
      herb: string;
      dosage: string;
      timing: string;
      requires_approval: boolean;
    }>;
  };
  contraindications: string[];
  confidence: number;
  requires_doctor_approval: boolean;
  language: string;
}

export interface TriageResult {
  urgency_level: 'emergency' | 'urgent' | 'routine' | 'self_care';
  immediate_actions: string[];
  recommended_caregiver: string;
  red_flags: string[];
  self_care_tips: string[];
  follow_up_timeframe: string;
  confidence: number;
  disclaimer: string;
  language: string;
}

// RAG Document Retrieval
export const retrieveRAGDocuments = async (
  query: string,
  language: string = 'en',
  limit: number = 5
): Promise<string[]> => {
  try {
    // In a real implementation, you would:
    // 1. Convert query to embeddings
    // 2. Search vector database for similar documents
    // 3. Return relevant document chunks
    
    // For now, return mock RAG context
    const mockRAGDocs = [
      "Ayurvedic principles suggest that Vata constitution benefits from warm, moist foods",
      "Pitta types should avoid spicy and acidic foods, prefer cooling foods",
      "Kapha constitution requires light, warm, and spicy foods to balance",
      "Pregnancy requires avoiding certain herbs like Ashwagandha in first trimester",
      "Digestive symptoms often indicate need for gastroenterologist consultation"
    ];
    
    return mockRAGDocs.slice(0, limit);
  } catch (error) {
    console.error('RAG retrieval error:', error);
    return [];
  }
};

// AI-powered caregiver search
export const performAISearch = async (
  query: string,
  caregivers: any[],
  location?: { lat: number; lon: number },
  language: string = 'en'
): Promise<AISearchResult> => {
  try {
    const ragDocs = await retrieveRAGDocuments(query, language);
    
    const prompt = AI_SEARCH_PROMPT
      .replace('{query}', query)
      .replace('{location}', location ? `${location.lat}, ${location.lon}` : 'Not provided')
      .replace('{caregivers}', JSON.stringify(caregivers))
      .replace('{language}', language);

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a medical AI assistant. Respond only with valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'mixtral-8x7b-32768',
      temperature: 0.2,
      max_tokens: 1000,
    });

    const result = JSON.parse(completion.choices[0]?.message?.content || '{}');
    return result as AISearchResult;
  } catch (error) {
    console.error('AI search error:', error);
    // Return fallback result
    return {
      extracted_symptoms: [],
      recommended_specialist: 'doctor',
      matches: [],
      confidence: 0.1,
      language
    };
  }
};

// Generate Ayurvedic diet suggestions
export const generatePrakritiDiet = async (
  prakriti: string,
  symptoms: string[],
  allergies: string[],
  pregnancy: boolean,
  language: string = 'en'
): Promise<PrakritiDietResult> => {
  try {
    const ragContext = await retrieveRAGDocuments(
      `${prakriti} prakriti diet ${symptoms.join(' ')}`,
      language
    );

    const prompt = PRAKRITI_DIET_PROMPT
      .replace('{prakriti}', prakriti)
      .replace('{symptoms}', symptoms.join(', '))
      .replace('{allergies}', allergies.join(', '))
      .replace('{pregnancy}', pregnancy.toString())
      .replace('{age_group}', 'adult') // Could be dynamic
      .replace('{language}', language)
      .replace('{rag_context}', ragContext.join('\n'));

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an Ayurvedic nutrition expert. Respond only with valid JSON. Always mark herbal suggestions as requiring doctor approval.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'mixtral-8x7b-32768',
      temperature: 0.7,
      max_tokens: 1500,
    });

    const result = JSON.parse(completion.choices[0]?.message?.content || '{}');
    return result as PrakritiDietResult;
  } catch (error) {
    console.error('Prakriti diet generation error:', error);
    throw error;
  }
};

// Triage symptom assessment
export const performTriage = async (
  symptoms: string[],
  patientInfo: {
    age?: number;
    gender?: string;
    pregnancy?: boolean;
    medications?: string[];
  },
  language: string = 'en'
): Promise<TriageResult> => {
  try {
    const prompt = TRIAGE_PROMPT
      .replace('{symptoms}', symptoms.join(', '))
      .replace('{age}', patientInfo.age?.toString() || 'not provided')
      .replace('{gender}', patientInfo.gender || 'not provided')
      .replace('{pregnancy}', patientInfo.pregnancy?.toString() || 'false')
      .replace('{medications}', patientInfo.medications?.join(', ') || 'none')
      .replace('{language}', language);

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a medical triage assistant. Be conservative and always recommend professional consultation for concerning symptoms. Respond only with valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'mixtral-8x7b-32768',
      temperature: 0.1,
      max_tokens: 1000,
    });

    const result = JSON.parse(completion.choices[0]?.message?.content || '{}');
    return result as TriageResult;
  } catch (error) {
    console.error('Triage error:', error);
    throw error;
  }
};