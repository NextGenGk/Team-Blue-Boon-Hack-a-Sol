# 🔧 SOLUTION: Add this line to your .env file

## Your .env file is MISSING the DATABASE_URL line!

### ✅ Add this line to your .env file:

```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.rsnysvtjnqwxbgdnhxwu.supabase.co:5432/postgres
```

### 📍 Where to get YOUR_PASSWORD:

1. Go to https://supabase.com/dashboard
2. Select your project (rsnysvtjnqwxbgdnhxwu)
3. Go to **Settings** → **Database**
4. Scroll down to find your database password
5. Copy it

### ⚠️ IMPORTANT: URL-Encode Special Characters

If your password contains these characters, replace them:

| Character | Replace With |
|-----------|--------------|
| `@` | `%40` |
| `#` | `%23` |
| `%` | `%25` |
| `&` | `%26` |
| `+` | `%2B` |

**Example:**
- Password: `MyP@ss#123`
- Encoded: `MyP%40ss%23123`
- Final: `DATABASE_URL=postgresql://postgres:MyP%40ss%23123@db.rsnysvtjnqwxbgdnhxwu.supabase.co:5432/postgres`

### 📝 Your complete .env file should look like:

```env
SUPABASE_URL=https://rsnysvtjnqwxbgdnhxwu.supabase.co
SUPABASE_ANON_KEY=eyJ... (your existing key)
DATABASE_URL=postgresql://postgres:YOUR_ENCODED_PASSWORD@db.rsnysvtjnqwxbgdnhxwu.supabase.co:5432/postgres
GEMINI_API_KEY=AIzaSy... (your existing key)
PORT=3000
NODE_ENV=development
```

### 🎯 Quick Steps:

1. Open `.env` file in text editor
2. Add the DATABASE_URL line (with your actual password, URL-encoded)
3. Save the file
4. Run: `npm run dev`
5. Open: http://localhost:3000

---

**That's it! Just add the DATABASE_URL line and you're done!** 🚀
