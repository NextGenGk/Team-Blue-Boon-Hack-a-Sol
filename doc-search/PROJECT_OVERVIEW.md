# 📁 Project Structure

```
doc-search/
├── 📄 server.js                 # Express API server with Gemini AI integration
├── 📄 package.json              # Dependencies and scripts
├── 📄 .env.example              # Environment variables template
├── 📄 .gitignore                # Git ignore rules
├── 📄 vercel.json               # Vercel deployment config
│
├── 📂 public/                   # Frontend files
│   ├── index.html               # Main UI page
│   ├── styles.css               # Premium dark theme styling
│   └── app.js                   # Frontend JavaScript logic
│
├── 📂 database/
│   ├── create_query.sql         # Database schema (tables, indexes, RLS)
│   └── seed_data.sql            # Sample data (8 doctors, 15 patients)
│
└── 📂 docs/
    ├── README.md                # Main documentation
    ├── QUICKSTART.md            # Quick setup guide
    └── DEPLOYMENT.md            # Deployment instructions
```

---

## 🎯 Key Features Implemented

### ✅ Backend API (server.js)
- **AI-Powered Search Endpoint** (`POST /api/search-doctors`)
  - Natural language processing with Gemini AI
  - Extracts specialization, symptoms, urgency
  - Smart SQL queries with relevance scoring
  
- **Specializations Endpoint** (`GET /api/specializations`)
  - Lists all available specializations
  - Shows doctor count per specialty
  
- **Doctor Details Endpoint** (`GET /api/doctors/:id`)
  - Full doctor profile
  - Clinic information
  - Languages and qualifications

- **Health Check** (`GET /api/health`)
  - API status monitoring

### ✅ Frontend UI (public/)
- **Modern Dark Theme**
  - Gradient backgrounds
  - Glassmorphism effects
  - Smooth animations
  
- **Search Interface**
  - Natural language input
  - Quick suggestion chips
  - Real-time search
  
- **Results Display**
  - Doctor cards with profiles
  - Relevance-based ranking
  - Booking buttons
  
- **Responsive Design**
  - Mobile-first approach
  - Works on all screen sizes

### ✅ Database Schema (create_query.sql)
- **8 Core Tables**
  - users, patients, doctors
  - appointments, prescriptions
  - medication_adherence
  - finance_transactions, receipts
  
- **Security Features**
  - Row Level Security (RLS)
  - Encrypted sensitive data
  - Prepared statements
  
- **Performance**
  - Indexed columns
  - Optimized queries
  - Connection pooling

### ✅ Sample Data (seed_data.sql)
- **8 Verified Doctors**
  - General Medicine
  - Gynecology & Obstetrics
  - Ayurveda & Panchakarma
  - Dental Surgery
  - Cardiology
  - Pediatrics
  - Orthopedics
  - Dermatology
  
- **15 Diverse Patients**
  - Various age groups
  - Different medical conditions
  - Realistic medical histories

---

## 🔄 How It Works

```
User Query
    ↓
"I have chest pain and breathing issues"
    ↓
Gemini AI Analysis
    ↓
{
  specialization: "Cardiology",
  symptoms: ["chest pain", "breathing issues"],
  urgency: "high"
}
    ↓
Smart Database Query
    ↓
Ranked Results
    ↓
Display to User
```

---

## 🛠️ Technologies Used

| Category | Technology |
|----------|-----------|
| **Backend** | Node.js, Express.js |
| **Database** | Supabase (PostgreSQL) |
| **AI** | Google Gemini 1.5 Flash |
| **Frontend** | HTML5, CSS3, Vanilla JS |
| **Deployment** | Vercel, Railway, Render |
| **Version Control** | Git, GitHub |

---

## 📊 API Response Example

**Request:**
```bash
POST /api/search-doctors
{
  "query": "I need a heart specialist for chest pain"
}
```

**Response:**
```json
{
  "success": true,
  "query": "I need a heart specialist for chest pain",
  "searchCriteria": {
    "specialization": "Cardiology",
    "symptoms": ["chest pain"],
    "urgency": "high",
    "preferredMode": "any",
    "searchKeywords": ["heart", "cardiology", "chest pain"],
    "explanation": "Patient needs urgent cardiac evaluation"
  },
  "results": [
    {
      "id": "350e8400-e29b-41d4-a716-446655440005",
      "name": "Dr. Sanjay Nair",
      "specialization": "Interventional Cardiology",
      "qualification": "MBBS, MD (Medicine), DM (Cardiology), FSCAI",
      "experience": 20,
      "consultationFee": 1500,
      "bio": "Senior interventional cardiologist...",
      "clinicName": "Nair Advanced Heart Care Institute",
      "location": "Indore, Madhya Pradesh",
      "languages": ["English", "Hindi", "Malayalam"],
      "verified": true,
      "profileImage": "https://i.pravatar.cc/150?img=52",
      "relevanceScore": 100
    }
  ],
  "count": 1,
  "message": "Found 1 doctor(s) matching your query"
}
```

---

## 🎨 UI Screenshots

### Search Interface
- Hero section with AI badge
- Large search input
- Quick suggestion chips
- Gradient backgrounds

### Search Results
- AI understanding display
- Doctor cards with profiles
- Consultation fees
- Book now buttons

### Doctor Card
- Profile image
- Specialization badge
- Experience years
- Languages spoken
- Location
- Verified badge
- Consultation fee

---

## 🔐 Security Features

1. **Environment Variables** - Sensitive data in `.env`
2. **Row Level Security** - Database-level access control
3. **Input Validation** - Sanitized user inputs
4. **Prepared Statements** - SQL injection prevention
5. **HTTPS** - Encrypted communication
6. **CORS** - Cross-origin protection

---

## 📈 Future Enhancements

- [ ] User authentication (JWT/OAuth)
- [ ] Appointment booking flow
- [ ] Payment integration (Razorpay)
- [ ] Doctor reviews and ratings
- [ ] Real-time chat
- [ ] Video consultation
- [ ] Mobile app (React Native)
- [ ] Admin dashboard
- [ ] Analytics and reporting
- [ ] Email notifications
- [ ] SMS reminders

---

## 📞 Support

For issues or questions:
1. Check the documentation
2. Review the code comments
3. Check Supabase logs
4. Verify environment variables
5. Test API endpoints individually

---

Built with ❤️ using AI-powered technology
