import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pg from 'pg';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Database connection
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection error:', err);
  } else {
    console.log('✅ Database connected successfully');
  }
});

// ============================================
// AI-POWERED DOCTOR SEARCH ENDPOINT
// ============================================

app.post('/api/search-doctors', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || query.trim() === '') {
      return res.status(400).json({ 
        error: 'Search query is required',
        success: false 
      });
    }

    console.log('🔍 Search query:', query);

    // Step 1: Use Gemini AI to extract search intent
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
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

Examples:
- "I have chest pain and breathing issues" → {"specialization": "Cardiology", "symptoms": ["chest pain", "breathing issues"], "urgency": "high", "preferredMode": "any", "searchKeywords": ["heart", "cardiology", "chest pain"], "explanation": "Patient needs urgent cardiac evaluation"}
- "Looking for skin doctor for acne" → {"specialization": "Dermatology", "symptoms": ["acne"], "urgency": "low", "preferredMode": "any", "searchKeywords": ["dermatology", "skin", "acne"], "explanation": "Patient needs dermatologist for acne treatment"}
- "Need online consultation for diabetes checkup" → {"specialization": "General Medicine", "symptoms": ["diabetes"], "urgency": "medium", "preferredMode": "online", "searchKeywords": ["diabetes", "general medicine"], "explanation": "Patient needs diabetes management consultation"}

Return ONLY the JSON object, nothing else.`;

    const result = await model.generateContent(prompt);
    const aiResponse = result.response.text();
    
    console.log('🤖 AI Response:', aiResponse);

    // Parse AI response
    let searchCriteria;
    try {
      // Remove markdown code blocks if present
      const cleanedResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      searchCriteria = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('❌ Failed to parse AI response:', parseError);
      // Fallback: simple keyword search
      searchCriteria = {
        specialization: query,
        symptoms: [query],
        urgency: 'medium',
        preferredMode: 'any',
        searchKeywords: [query],
        explanation: 'Searching for doctors based on your query'
      };
    }

    console.log('📋 Search criteria:', searchCriteria);

    // Step 2: Build dynamic SQL query
    const keywords = searchCriteria.searchKeywords.join('|');
    const specializationPattern = searchCriteria.specialization || '';

    const sqlQuery = `
      SELECT 
        d.did,
        d.specialization,
        d.qualification,
        d.years_of_experience,
        d.consultation_fee,
        d.bio,
        d.clinic_name,
        d.city,
        d.state,
        d.languages,
        d.is_verified,
        u.name as doctor_name,
        u.email,
        u.phone,
        u.profile_image_url,
        -- Calculate relevance score
        (
          CASE 
            WHEN LOWER(d.specialization) LIKE LOWER($1) THEN 100
            WHEN LOWER(d.specialization) ~* $2 THEN 80
            WHEN LOWER(d.bio) ~* $2 THEN 60
            WHEN LOWER(d.qualification) ~* $2 THEN 40
            ELSE 20
          END
        ) as relevance_score
      FROM doctors d
      JOIN users u ON d.uid = u.uid
      WHERE 
        u.is_active = true 
        AND (
          LOWER(d.specialization) LIKE LOWER($1)
          OR LOWER(d.specialization) ~* $2
          OR LOWER(d.bio) ~* $2
          OR LOWER(d.qualification) ~* $2
        )
      ORDER BY relevance_score DESC, d.years_of_experience DESC, d.is_verified DESC
      LIMIT 10;
    `;

    const searchPattern = `%${specializationPattern}%`;
    const regexPattern = keywords;

    const dbResult = await pool.query(sqlQuery, [searchPattern, regexPattern]);

    console.log(`✅ Found ${dbResult.rows.length} doctors`);

    // Step 3: Enhance results with AI recommendations
    const doctors = dbResult.rows.map(doctor => ({
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
      relevanceScore: doctor.relevance_score
    }));

    // Return response
    res.json({
      success: true,
      query: query,
      searchCriteria: searchCriteria,
      results: doctors,
      count: doctors.length,
      message: doctors.length > 0 
        ? `Found ${doctors.length} doctor(s) matching your query` 
        : 'No doctors found. Try a different search term.'
    });

  } catch (error) {
    console.error('❌ Search error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search doctors',
      message: error.message
    });
  }
});

// ============================================
// GET ALL SPECIALIZATIONS
// ============================================

app.get('/api/specializations', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT specialization, COUNT(*) as doctor_count
      FROM doctors d
      JOIN users u ON d.uid = u.uid
      WHERE u.is_active = true
      GROUP BY specialization
      ORDER BY doctor_count DESC, specialization ASC
    `);

    res.json({
      success: true,
      specializations: result.rows
    });
  } catch (error) {
    console.error('❌ Error fetching specializations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch specializations'
    });
  }
});

// ============================================
// GET DOCTOR BY ID
// ============================================

app.get('/api/doctors/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT 
        d.*,
        u.name as doctor_name,
        u.email,
        u.phone,
        u.profile_image_url
      FROM doctors d
      JOIN users u ON d.uid = u.uid
      WHERE d.did = $1 AND u.is_active = true
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Doctor not found'
      });
    }

    const doctor = result.rows[0];

    res.json({
      success: true,
      doctor: {
        id: doctor.did,
        name: doctor.doctor_name,
        specialization: doctor.specialization,
        qualification: doctor.qualification,
        experience: doctor.years_of_experience,
        consultationFee: parseFloat(doctor.consultation_fee),
        bio: doctor.bio,
        clinicName: doctor.clinic_name,
        address: {
          line1: doctor.address_line1,
          line2: doctor.address_line2,
          city: doctor.city,
          state: doctor.state,
          postalCode: doctor.postal_code
        },
        languages: doctor.languages,
        verified: doctor.is_verified,
        profileImage: doctor.profile_image_url,
        email: doctor.email,
        phone: doctor.phone
      }
    });
  } catch (error) {
    console.error('❌ Error fetching doctor:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch doctor details'
    });
  }
});

// ============================================
// HEALTH CHECK
// ============================================

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'AyurSutra Doctor Search API'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════╗
║   🏥 AyurSutra Doctor Search API              ║
║   🚀 Server running on port ${PORT}              ║
║   📍 http://localhost:${PORT}                    ║
║   🤖 AI-Powered Search: Enabled               ║
╚═══════════════════════════════════════════════╝
  `);
});

export default app;
