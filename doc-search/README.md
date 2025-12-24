# 🏥 AyurSutra - AI Doctor Search (Next.js + Supabase)

An intelligent doctor search platform built with **Next.js 15**, **TypeScript**, **Supabase**, and **Gemini AI**.

## ✨ Features

- 🤖 **AI-Powered Search** - Natural language understanding with Gemini AI
- ⚡ **Next.js 15** - Latest App Router
- 🗄️ **Supabase** - Database & Auth (using supabase-js client)
- 🎨 **Modern UI** - Beautiful dark theme with CSS Modules
- 🔍 **Smart Matching** - Relevance-based doctor ranking

## 🛠️ Tech Stack

- **Framework**: Next.js 15
- **Language**: TypeScript
- **Database**: Supabase
- **AI**: Google Gemini 2.0 Flash
- **Styling**: CSS Modules

## 🚀 Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   Create `.env` file with:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   GEMINI_API_KEY=your-gemini-key
   ```
   *(No database password required!)*

3. **Run Development Server**
   ```bash
   npm run dev
   ```

## 📁 Key Files

- `lib/supabase.ts` - Supabase client initialization
- `app/api/search-doctors/route.ts` - Search logic
- `components/SearchPage.tsx` - Main UI

---

Built with ❤️ using Next.js & Supabase
