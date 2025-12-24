# 🚨 DATABASE CONNECTION ERROR FIX

## The Problem
Your `.env` file is missing or has incorrect credentials, specifically the DATABASE_URL password.

---

## ✅ SOLUTION - Follow These Steps:

### Step 1: Open your `.env` file
```bash
# If .env doesn't exist, create it:
copy .env.example .env

# Then edit it with your text editor
```

### Step 2: Fill in your Supabase credentials

Go to your Supabase dashboard and get these values:

#### A. Get SUPABASE_URL and SUPABASE_ANON_KEY
1. Open [supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** (gear icon) → **API**
4. Copy:
   - **Project URL** → This is your `SUPABASE_URL`
   - **anon/public key** → This is your `SUPABASE_ANON_KEY`

#### B. Get DATABASE_URL
1. Still in Settings, go to **Database** tab
2. Scroll to **Connection String**
3. Select **URI** tab
4. Copy the connection string
5. **IMPORTANT:** Replace `[YOUR-PASSWORD]` with your actual database password

### Step 3: URL-Encode Your Password (if needed)

If your password contains special characters, encode them:

```
Original: MyP@ss#123
Encoded:  MyP%40ss%23123
```

Common replacements:
- `@` → `%40`
- `#` → `%23`  
- `%` → `%25`
- `&` → `%26`

### Step 4: Your .env should look like this:

```env
SUPABASE_URL=https://abcdefghijklmnop.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzMjE1MDAwMCwiZXhwIjoxOTQ3NzI2MDAwfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
DATABASE_URL=postgresql://postgres:MyP%40ss%23123@db.abcdefghijklmnop.supabase.co:5432/postgres
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
PORT=3000
NODE_ENV=development
```

### Step 5: Get Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click **"Create API Key"**
3. Copy the key
4. Paste it as `GEMINI_API_KEY` in your `.env`

### Step 6: Setup Database Tables

1. Open Supabase SQL Editor
2. Run `create_query.sql` (creates all tables)
3. Run `seed_data.sql` (adds 8 sample doctors)

### Step 7: Test Your Configuration

```bash
npm run check
```

If all checks pass ✅, then run:

```bash
npm run dev
```

---

## 🎯 Quick Checklist

- [ ] Created `.env` file from `.env.example`
- [ ] Added SUPABASE_URL
- [ ] Added SUPABASE_ANON_KEY
- [ ] Added DATABASE_URL with correct password
- [ ] URL-encoded special characters in password
- [ ] Added GEMINI_API_KEY
- [ ] Ran create_query.sql in Supabase
- [ ] Ran seed_data.sql in Supabase
- [ ] Tested with `npm run check`
- [ ] Started server with `npm run dev`

---

## 💡 Pro Tip

You can use this PowerShell command to create .env from template:
```powershell
Copy-Item .env.example .env
```

Then edit `.env` with your favorite text editor and fill in the real values!

---

## Still stuck?

Run the diagnostic:
```bash
npm run check
```

It will tell you exactly what's missing! 🔍
