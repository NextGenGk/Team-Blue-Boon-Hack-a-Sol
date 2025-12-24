# ✅ Your .env File Has Been Created!

## 🎉 Supabase Credentials Added Successfully!

Your `.env` file now has:
- ✅ NEXT_PUBLIC_SUPABASE_URL
- ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY  
- ✅ SUPABASE_SERVICE_ROLE_KEY
- ⚠️ DATABASE_URL (needs password)
- ⚠️ GEMINI_API_KEY (needs your key)

---

## 🔐 Step 1: Add Your Database Password

### Get Your Password:
1. Go to https://supabase.com/dashboard
2. Select project: **rsnysvtjmelnojkubdqu**
3. Go to **Settings** → **Database**
4. Scroll to **Database Password**
5. Copy your password (or reset it if you don't have it)

### Update .env:
Open `.env` file and find this line:
```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD_HERE@db.rsnysvtjmelnojkubdqu.supabase.co:5432/postgres
```

Replace `YOUR_PASSWORD_HERE` with your actual password.

### ⚠️ IMPORTANT: URL-Encode Special Characters!

If your password has special characters, encode them:

| Character | Replace With |
|-----------|--------------|
| `@` | `%40` |
| `#` | `%23` |
| `%` | `%25` |
| `&` | `%26` |
| `+` | `%2B` |
| `/` | `%2F` |

**Example:**
```
Password: MyP@ss#123
Encoded:  MyP%40ss%23123

DATABASE_URL=postgresql://postgres:MyP%40ss%23123@db.rsnysvtjmelnojkubdqu.supabase.co:5432/postgres
```

---

## 🤖 Step 2: Add Your Gemini API Key

### Get Your Key:
1. Go to https://makersuite.google.com/app/apikey
2. Click **"Create API Key"**
3. Copy the key

### Update .env:
Find this line:
```env
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
```

Replace `YOUR_GEMINI_API_KEY_HERE` with your actual key:
```env
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

---

## 📝 Your Complete .env File Should Look Like:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://rsnysvtjmelnojkubdqu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzbnlzdnRqbWVsbm9qa3ViZHF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4NjQwNDQsImV4cCI6MjA4MTQ0MDA0NH0.5Fl0bX46yIpN2zR82_BcrOMJkJAvW5UobORJ93TxqyQ
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzbnlzdnRqbWVsbm9qa3ViZHF1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTg2NDA0NCwiZXhwIjoyMDgxNDQwMDQ0fQ.WR1yCGjb9SvhAzAFwrMt8vcdjS6ojtWjbbokkSQPDfk

# Database Configuration
DATABASE_URL=postgresql://postgres:YOUR_ENCODED_PASSWORD@db.rsnysvtjmelnojkubdqu.supabase.co:5432/postgres

# Gemini AI API Key
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Server Configuration
PORT=3000
NODE_ENV=development
```

---

## 🧪 Step 3: Test Your Configuration

After updating both values, run:

```bash
npm run check
```

This will validate your `.env` file and show any errors.

---

## 🚀 Step 4: Start Your Next.js App

Once the check passes:

```bash
npm run dev
```

Then open: **http://localhost:3000**

---

## 📊 Step 5: Setup Database (If Not Done)

If you haven't run the SQL scripts yet:

1. Go to Supabase Dashboard → SQL Editor
2. Run `create_query.sql` (creates tables)
3. Run `seed_data.sql` (adds sample doctors)

---

## ✅ Quick Checklist:

- [ ] Open `.env` file
- [ ] Replace `YOUR_PASSWORD_HERE` with database password (URL-encoded)
- [ ] Replace `YOUR_GEMINI_API_KEY_HERE` with Gemini API key
- [ ] Save the file
- [ ] Run `npm run check`
- [ ] If check passes, run `npm run dev`
- [ ] Open http://localhost:3000
- [ ] Test search: "I have chest pain"

---

## 🆘 Troubleshooting:

### If `npm run check` fails:
- Make sure password is URL-encoded
- Make sure no extra spaces or quotes
- Make sure Gemini API key is valid

### If database connection fails:
- Verify password is correct
- Check if database is active in Supabase
- Make sure you ran `create_query.sql`

### If Gemini AI fails:
- Verify API key is correct
- Check if you have API quota
- Make sure key has no extra spaces

---

## 🎯 You're Almost There!

Just 2 more values to add:
1. **Database password** (from Supabase)
2. **Gemini API key** (from Google AI Studio)

Then run `npm run check` and `npm run dev`! 🚀
