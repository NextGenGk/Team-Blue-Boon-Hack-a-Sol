# 🔧 Quick Fix Guide for Database Connection Error

## Error: "SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string"

This error means your DATABASE_URL has an issue with the password format.

---

## ✅ Solution Steps:

### Step 1: Run the diagnostic tool
```bash
npm run check
```

This will tell you exactly what's wrong.

---

### Step 2: Fix your .env file

Your `.env` file should look like this:

```env
# Supabase Configuration
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD_HERE@db.xxxxx.supabase.co:5432/postgres

# Gemini AI API Key
GEMINI_API_KEY=AIzaSy...

# Server Configuration
PORT=3000
NODE_ENV=development
```

---

### Step 3: Get your Supabase credentials

1. Go to [supabase.com](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **Database**
4. Find **Connection String** → **URI**
5. Copy the entire connection string
6. Replace `[YOUR-PASSWORD]` with your actual database password

**Important:** If your password has special characters, you need to URL-encode them!

---

## 🔐 URL Encoding Special Characters

If your password contains these characters, replace them:

| Character | Replace With |
|-----------|--------------|
| `@` | `%40` |
| `#` | `%23` |
| `%` | `%25` |
| `&` | `%26` |
| `+` | `%2B` |
| `/` | `%2F` |
| `=` | `%3D` |
| `?` | `%3F` |
| `:` | `%3A` |

### Example:
If your password is: `MyP@ss#123`  
It should be: `MyP%40ss%23123`

Your DATABASE_URL becomes:
```
postgresql://postgres:MyP%40ss%23123@db.xxxxx.supabase.co:5432/postgres
```

---

## 📝 Complete .env Example

```env
# Get these from Supabase Dashboard → Settings → API
SUPABASE_URL=https://abcdefghijklmnop.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzMjE1MDAwMCwiZXhwIjoxOTQ3NzI2MDAwfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Get this from Supabase Dashboard → Settings → Database → Connection String
# Replace [YOUR-PASSWORD] with your actual password (URL-encoded if needed)
DATABASE_URL=postgresql://postgres:your_encoded_password@db.abcdefghijklmnop.supabase.co:5432/postgres

# Get this from Google AI Studio: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Server settings
PORT=3000
NODE_ENV=development
```

---

## 🧪 Test Your Configuration

After updating your `.env` file:

```bash
# 1. Run the diagnostic
npm run check

# 2. If all checks pass, start the server
npm run dev

# 3. Open browser
# http://localhost:3000
```

---

## 🆘 Still Having Issues?

### Common Problems:

1. **Password has quotes around it**
   - ❌ `DATABASE_URL=postgresql://postgres:"mypassword"@...`
   - ✅ `DATABASE_URL=postgresql://postgres:mypassword@...`

2. **Missing password**
   - ❌ `DATABASE_URL=postgresql://postgres:@db...`
   - ✅ `DATABASE_URL=postgresql://postgres:actual_password@db...`

3. **Wrong format**
   - ❌ `DATABASE_URL=postgres://...` (missing 'ql')
   - ✅ `DATABASE_URL=postgresql://...`

4. **Spaces in the URL**
   - ❌ `DATABASE_URL=postgresql://postgres: mypassword @...`
   - ✅ `DATABASE_URL=postgresql://postgres:mypassword@...`

---

## 📞 Need Help?

Run this command to see detailed diagnostics:
```bash
npm run check
```

It will tell you exactly what's wrong! 🎯
