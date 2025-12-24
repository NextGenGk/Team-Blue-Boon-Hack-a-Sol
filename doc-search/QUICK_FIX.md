# 🚨 QUICK FIX - Database Password Error

## The error you're seeing means your `.env` file has an incorrect DATABASE_URL

---

## ✅ **EASIEST FIX - Use the Setup Script:**

### Option 1: Interactive Setup (Recommended)
```powershell
npm run setup
```

This will ask you for each credential and automatically create a valid `.env` file with proper password encoding!

### Option 2: PowerShell Script
```powershell
.\setup-env.ps1
```

---

## ✅ **MANUAL FIX - Edit .env Directly:**

1. **Open** `d:\ayursutra-hackasol\doc-search\.env` in Notepad or VS Code

2. **Your .env should look EXACTLY like this:**

```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres
GEMINI_API_KEY=AIzaSy...
PORT=3000
NODE_ENV=development
```

3. **Replace these placeholders:**
   - `xxxxx.supabase.co` → Your actual Supabase project URL
   - `eyJhbGci...` → Your actual Supabase anon key
   - `YOUR_PASSWORD` → Your actual database password (URL-encoded!)
   - `AIzaSy...` → Your actual Gemini API key

4. **IMPORTANT - URL-Encode Special Characters in Password:**

   If your password is: `MyP@ss#123`
   
   Replace:
   - `@` with `%40`
   - `#` with `%23`
   
   So it becomes: `MyP%40ss%23123`
   
   Your DATABASE_URL:
   ```
   postgresql://postgres:MyP%40ss%23123@db.xxxxx.supabase.co:5432/postgres
   ```

---

## 📍 **Where to Get Your Credentials:**

### Supabase (3 values needed):
1. Go to https://supabase.com/dashboard
2. Select your project
3. **Settings → API:**
   - Copy "Project URL" → `SUPABASE_URL`
   - Copy "anon public" key → `SUPABASE_ANON_KEY`
4. **Settings → Database → Connection String → URI:**
   - Copy the connection string
   - This gives you the DATABASE_URL format
   - Replace `[YOUR-PASSWORD]` with your actual password

### Gemini API:
1. Go to https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy it → `GEMINI_API_KEY`

---

## 🧪 **Test Your Fix:**

```powershell
# 1. Test configuration
npm run check

# 2. If all checks pass ✅, start server
npm run dev

# 3. Open browser
# http://localhost:3000
```

---

## 🎯 **Common Mistakes to Avoid:**

❌ **DON'T** put quotes around values:
```env
DATABASE_URL="postgresql://..."  # WRONG!
```

✅ **DO** write values directly:
```env
DATABASE_URL=postgresql://...  # CORRECT!
```

❌ **DON'T** leave spaces:
```env
DATABASE_URL = postgresql://...  # WRONG!
```

✅ **DO** write without spaces:
```env
DATABASE_URL=postgresql://...  # CORRECT!
```

❌ **DON'T** forget to URL-encode special characters in password:
```env
DATABASE_URL=postgresql://postgres:MyP@ss#123@...  # WRONG!
```

✅ **DO** encode them:
```env
DATABASE_URL=postgresql://postgres:MyP%40ss%23123@...  # CORRECT!
```

---

## 🆘 **Still Not Working?**

Run the diagnostic to see exactly what's wrong:
```powershell
npm run check
```

It will tell you:
- ✅ Which variables are set correctly
- ❌ Which variables are missing or incorrect
- 💡 Suggestions to fix them

---

## 📞 **Need More Help?**

Check these files:
- `FIX_DATABASE_ERROR.md` - Detailed fix guide
- `TROUBLESHOOTING.md` - Common issues
- `QUICKSTART.md` - Complete setup guide

---

**TL;DR:** Run `npm run setup` and follow the prompts! 🚀
