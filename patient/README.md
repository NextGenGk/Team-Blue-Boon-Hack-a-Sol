# AyurSutra - Healthcare PWA

A comprehensive healthcare Progressive Web Application (PWA) that connects patients with nurses and caregivers using AI-powered search and real-time features.

## Features

### 🏥 Core Healthcare Features
- **RAG-Powered Search**: Advanced AI search using external RAG service for finding healthcare professionals
- **Dual Dashboard System**: Separate interfaces for patients and nurses
- **Government Mitanin Integration**: Free community health worker services
- **Private Nurse Booking**: Paid professional nursing services
- **Real-time Notifications**: In-app notifications for appointments and updates
- **Progress Tracking**: Patient health progress monitoring with checklists
- **Video Consultations**: Built-in video calling for remote consultations
- **Payment Integration**: Razorpay integration for secure payments

### 🌐 Technical Features
- **Progressive Web App**: Installable, offline-capable web application
- **Bilingual Support**: English and Hindi language support
- **Real-time Updates**: Live notifications and status updates
- **Responsive Design**: Works seamlessly on mobile and desktop
- **Secure Authentication**: Supabase-powered user authentication
- **End-to-End Encryption**: Secure handling of medical data

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Payments**: Razorpay
- **Video Calls**: WebRTC (with ZegoCloud integration ready)
- **AI/ML**: External RAG service for intelligent search
- **PWA**: Service Worker, Web App Manifest
- **Deployment**: Vercel-ready

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Razorpay account (for payments)

### 1. Clone and Install
```bash
git clone <repository-url>
cd ayursutra-hackasol
npm install
```

### 2. Database Setup
```bash
# Run the database schema
# Copy the contents of dropschema_creation_policy_seed.sql
# and execute it in your Supabase SQL editor
```

### 3. Environment Configuration
Create `.env.local` with your credentials:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# RAG Search Service
RAG_SEARCH_URL=https://ayur-sutra-rag.vercel.app/ragsearch

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Application Structure

### Patient Flow
1. **Landing Page** (`/`) - AI-powered symptom search
2. **Patient Dashboard** (`/patient-dashboard`) - Symptom selection and caregiver booking
3. **Booking Process** - Select service type, schedule, and payment
4. **Progress Tracking** - Monitor health progress with checklists

### Nurse Flow
1. **Nurse Dashboard** (`/nurse-dashboard`) - Patient management and appointments
2. **Video Consultations** - Built-in video calling system
3. **Progress Monitoring** - Track patient progress and provide updates
4. **Payment Management** - View earnings and payment history

### Key Components

#### Core Components
- `SearchBar` - AI-powered symptom search
- `CaregiverCard` - Display caregiver information
- `BookingModal` - Appointment booking interface
- `VideoCall` - Video consultation component
- `NotificationCenter` - Real-time notifications

#### API Routes
- `/api/search` - RAG-powered caregiver search
- `/api/appointments/book` - Appointment booking
- `/api/payments/*` - Payment processing
- `/api/progress/update` - Progress tracking
- `/api/notifications` - Notification management

## Database Schema

The application uses a comprehensive PostgreSQL schema with:

- **Users & Authentication**: User profiles and roles
- **Caregivers**: Nurse profiles with specializations and availability
- **Patients**: Patient profiles with medical history
- **Appointments**: Booking system with payment integration
- **Progress Tracking**: Health monitoring with checklists
- **Notifications**: Real-time notification system
- **Finance & Payments**: Transaction and receipt management

## Key Features Implementation

### 1. RAG-Powered Search
```typescript
// External RAG search integration
const ragResponse = await fetch(`${RAG_SEARCH_URL}?query=${query}&lang=${language}`);
const searchResults = await ragResponse.json();
```

### 2. Payment Integration
```typescript
// Razorpay integration
const options = {
  key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  amount: amount * 100, // Convert to paise
  currency: 'INR',
  name: 'AyurSutra',
  // ... payment options
};
```

### 3. Real-time Notifications
```typescript
// Supabase real-time subscriptions
const subscription = supabase
  .channel('notifications')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'notifications'
  }, handleNewNotification)
  .subscribe();
```

### 4. Progress Tracking
```typescript
// Checklist-based progress tracking
const checklistTypes = ['medication', 'diet', 'exercise', 'vitals'];
const completionPercentage = (completedItems / totalItems) * 100;
```

## Deployment

### Vercel Deployment
```bash
npm run build
# Deploy to Vercel
vercel --prod
```

### Environment Variables
Ensure all environment variables are configured in your deployment platform.

### Database Migration
Run the SQL schema in your production Supabase instance.

## PWA Features

- **Installable**: Can be installed on mobile devices and desktop
- **Offline Support**: Basic offline functionality with service worker
- **Push Notifications**: Real-time notifications even when app is closed
- **App-like Experience**: Full-screen, native app feel

## Security Features

- **Row Level Security (RLS)**: Database-level access control
- **End-to-End Encryption**: Medical data encryption
- **Secure Authentication**: Supabase Auth with JWT tokens
- **Payment Security**: PCI-compliant payment processing

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team

---

**AyurSutra** - Bridging the gap between patients and healthcare providers through technology.