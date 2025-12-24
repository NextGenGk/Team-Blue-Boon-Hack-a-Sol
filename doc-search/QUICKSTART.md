# 🚀 Quick Start Guide

## Step 1: Install Dependencies ✅
```bash
npm install
```

## Step 2: Configure Environment Variables

1. Create a `.env` file:
```bash
cp .env.example .env
```

2. Get your Supabase credentials:
   - Go to [supabase.com](https://supabase.com)
   - Create a new project or use existing one
   - Go to **Project Settings** → **API**
   - Copy:
     - Project URL → `SUPABASE_URL`
     - Anon/Public Key → `SUPABASE_ANON_KEY`
   - Go to **Project Settings** → **Database**
   - Copy Connection String → `DATABASE_URL`

3. Get your Gemini API Key:
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Click "Create API Key"
   - Copy the key → `GEMINI_API_KEY`

4. Update your `.env` file:
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres
GEMINI_API_KEY=AIzaSy...
PORT=3000
NODE_ENV=development
```

## Step 3: Setup Database

1. Open Supabase SQL Editor
2. Run `create_query.sql` (creates schema)
3. Run `seed_data.sql` (adds sample doctors)

## Step 4: Start the Server

```bash
npm run dev
```

## Step 5: Open in Browser

Navigate to: **http://localhost:3000**

## 🎉 You're Ready!

Try searching:
- "I have chest pain and breathing issues"
- "Need a skin doctor for acne"
- "Looking for diabetes specialist"
- "Pregnancy checkup consultation"

---

## 🐛 Troubleshooting

### Database Connection Error
- Check your `DATABASE_URL` is correct
- Ensure Supabase project is active
- Verify database password

### Gemini API Error
- Verify your API key is valid
- Check you have API quota remaining
- Ensure no extra spaces in `.env` file

### Port Already in Use
- Change `PORT` in `.env` to another port (e.g., 3001)
- Or kill the process using port 3000

---

## 📚 Next Steps

1. Customize the UI colors in `public/styles.css`
2. Add more doctors to your database
3. Implement booking flow
4. Add authentication
5. Deploy to production!

Happy coding! 🚀
