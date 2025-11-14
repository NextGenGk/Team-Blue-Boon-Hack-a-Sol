# Healthcare API - Postman Test Collection

## Base URL

```
http://localhost:3000
```

## 1. Search Caregivers - Headache

**Method:** GET  
**URL:**

```
http://localhost:3000/api/search/caregivers?symptoms=headache&type=doctor&lat=28.5672&lng=77.2100&radius=30
```

**Headers:**

```
Content-Type: application/json
```

## 2. Search Caregivers - Multiple Symptoms

**Method:** GET  
**URL:**

```
http://localhost:3000/api/search/caregivers?symptoms=headache,fever&type=doctor&lat=28.5672&lng=77.2100&radius=25
```

## 3. Search Any Caregiver Type

**Method:** GET  
**URL:**

```
http://localhost:3000/api/search/caregivers?symptoms=headache&lat=28.5672&lng=77.2100&radius=20
```

## 4. Search Without Location

**Method:** GET  
**URL:**

```
http://localhost:3000/api/search/caregivers?symptoms=headache&type=doctor
```

## 5. Search Nurses for Home Care

**Method:** GET  
**URL:**

```
http://localhost:3000/api/search/caregivers?symptoms=wound%20care&type=nurse&lat=28.5672&lng=77.2100&radius=15
```

## 6. Search Therapists

**Method:** GET  
**URL:**

```
http://localhost:3000/api/search/caregivers?symptoms=back%20pain&type=therapist&lat=28.5672&lng=77.2100&radius=40
```

## 7. Get Specific Caregiver Details

**Method:** GET  
**URL:**

```
http://localhost:3000/api/caregivers/[caregiver-id]
```

## 8. Book Appointment (POST)

**Method:** POST  
**URL:**

```
http://localhost:3000/api/appointments
```

**Headers:**

```
Content-Type: application/json
Authorization: Bearer [your-jwt-token]
```

**Body (JSON):**

```json
{
  "caregiver_id": "uuid-here",
  "mode": "online",
  "start_time": "2024-11-15T10:00:00Z",
  "end_time": "2024-11-15T10:30:00Z",
  "symptoms": ["headache"],
  "payment_amount": 500
}
```

## 9. Get User Profile

**Method:** GET  
**URL:**

```
http://localhost:3000/api/user/profile
```

**Headers:**

```
Authorization: Bearer [your-jwt-token]
```

## 10. Get Appointments

**Method:** GET  
**URL:**

```
http://localhost:3000/api/appointments
```

**Headers:**

```
Authorization: Bearer [your-jwt-token]
```

---

## Quick Test Scenarios

### Test 1: Basic Headache Search

```
GET /api/search/caregivers?symptoms=headache&type=doctor&lat=28.5672&lng=77.2100&radius=30
```

**Expected:** List of doctors who can treat headaches within 30km

### Test 2: Emergency Search

```
GET /api/search/caregivers?symptoms=chest%20pain&type=doctor&lat=28.5672&lng=77.2100&radius=50
```

**Expected:** Cardiologists and emergency doctors

### Test 3: Home Care Search

```
GET /api/search/caregivers?symptoms=elderly%20care&type=maid&lat=28.5672&lng=77.2100&radius=20
```

**Expected:** Maids/caregivers available for home visits

---

## Response Format Expected

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Dr. John Doe",
      "type": "doctor",
      "specializations": ["General Medicine"],
      "rating": 4.5,
      "consultation_fee": 500,
      "home_visit_fee": 800,
      "available_for_online": true,
      "available_for_home_visits": true,
      "distance_km": 12.5,
      "profile_image_url": "url",
      "bio": "Experienced doctor..."
    }
  ],
  "total": 5
}
```

## Error Response Format

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

---

# AI-POWERED NATURAL LANGUAGE SEARCH TESTS

## 1. "I have a headache"

**Method:** GET  
**URL:**

```
http://localhost:3000/api/search/caregivers?query=I%20have%20a%20headache&lat=28.5672&lng=77.2100&radius=30
```

## 2. "Chest pain emergency"

**Method:** GET  
**URL:**

```
http://localhost:3000/api/search/caregivers?query=chest%20pain%20emergency&lat=28.5672&lng=77.2100&radius=50
```

## 3. "Need elderly care at home"

**Method:** GET  
**URL:**

```
http://localhost:3000/api/search/caregivers?query=need%20elderly%20care%20at%20home&lat=28.5672&lng=77.2100&radius=25
```

## 4. "My child has fever"

**Method:** GET  
**URL:**

```
http://localhost:3000/api/search/caregivers?query=my%20child%20has%20fever&lat=28.5672&lng=77.2100&radius=20
```

## 5. "Back pain physiotherapy"

**Method:** GET  
**URL:**

```
http://localhost:3000/api/search/caregivers?query=back%20pain%20physiotherapy&lat=28.5672&lng=77.2100&radius=40
```

## 6. "Diabetes checkup needed"

**Method:** GET  
**URL:**

```
http://localhost:3000/api/search/caregivers?query=diabetes%20checkup%20needed&lat=28.5672&lng=77.2100&radius=35
```

## 7. "Anxiety and stress management"

**Method:** GET  
**URL:**

```
http://localhost:3000/api/search/caregivers?query=anxiety%20and%20stress%20management&lat=28.5672&lng=77.2100&radius=30
```

---

# EXPECTED AI RESPONSE FORMAT

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Dr. John Doe",
      "type": "doctor",
      "specializations": ["Neurology"],
      "rating": 4.5,
      "consultation_fee": 500,
      "distance_km": 12.5,
      "available_for_online": true
    }
  ],
  "total": 5,
  "query": {
    "original_query": "I have a headache",
    "symptoms": ["headache"],
    "type": "doctor",
    "location": { "lat": 28.5672, "lng": 77.21 },
    "radius": 30
  },
  "ai_analysis": {
    "symptoms": ["headache"],
    "caregiver_type": "doctor",
    "urgency": "low",
    "specializations": ["Neurology", "General Medicine"]
  }
}
```

---

# DOCKER MODEL SETUP

Make sure your local Docker model is running:

```bash
# Start Ollama with Llama 3.2
docker run -d -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama
docker exec -it ollama ollama pull llama3.2
```

Set environment variables:

```
LOCAL_MODEL_URL=http://localhost:11434
LOCAL_MODEL_NAME=llama3.2
```

---

# UPDATED MODEL CONFIGURATION

Your API now uses:

- **Base URL:** `http://localhost:12434/engines/llama.cpp/v1`
- **Model:** `ai/gemma3`
- **Format:** OpenAI-compatible API

## Test AI-Powered Search:

```
http://localhost:3000/api/search/caregivers?query=I%20have%20a%20headache&lat=28.5672&lng=77.2100&radius=30
```

The AI will now use the OpenAI-compatible `/chat/completions` endpoint instead of the Ollama format.
