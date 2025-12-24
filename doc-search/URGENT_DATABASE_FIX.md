# 🚨 URGENT FIX: Database Connection Error

## The Problem

Your DATABASE_URL is malformed or missing, causing the error:
```
Error: getaddrinfo ENOTFOUND 3
```

This means the connection string is not properly formatted.

---

## ✅ SOLUTION: Use the Fix Script

Run this command and enter your database password when prompted:

```bash
npm run fix-db-url
```

The script will:
1. Ask for your database password
2. Automatically URL-encode special characters
3. Generate the correct DATABASE_URL
4. Update your .env file
5. The dev server will auto-reload

---

## 🔐 Where to Get Your Password

1. Go to https://supabase.com/dashboard
2. Select project: **rsnysvtjmelnojkubdqu**
3. Go to **Settings** → **Database**
4. Find **Database Password**
5. Copy it (or reset if you don't have it)

---

## 📝 Manual Fix (Alternative)

If you prefer to edit manually, your DATABASE_URL should be:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.rsnysvtjmelnojkubdqu.supabase.co:5432/postgres
```

**Replace `YOUR_PASSWORD` with your actual password**

### ⚠️ URL-Encode Special Characters:

| Character | Replace With |
|-----------|--------------|
| `@` | `%40` |
| `#` | `%23` |
| `%` | `%25` |
| `&` | `%26` |
| `+` | `%2B` |
| `:` | `%3A` |

**Example:**
```
Password: MyP@ss#123
Encoded:  MyP%40ss%23123

DATABASE_URL=postgresql://postgres:MyP%40ss%23123@db.rsnysvtjmelnojkubdqu.supabase.co:5432/postgres
```

---

## 🧪 After Fixing

1. Save your .env file
2. Dev server will auto-reload
3. Try your search again!
4. You should see doctor results! 🎉

---

## 🎉 Good News!

Your Gemini 2.5 Flash AI is working perfectly! Look at this excellent response:

```json
{
  "specialization": "Cardiology",
  "symptoms": ["chest pain", "breathing issues"],
  "urgency": "high",
  "preferredMode": "any",
  "searchKeywords": [
    "chest pain doctor",
    "breathing issues specialist",
    "cardiology",
    "pulmonology",
    "heart specialist",
    "lung specialist"
  ],
  "explanation": "The patient is experiencing acute symptoms of chest pain and breathing difficulties, indicating a need for urgent consultation with a heart or lung specialist."
}
```

Once you fix the DATABASE_URL, you'll see matching doctors! 🚀

---

## 🆘 Still Having Issues?

Run the diagnostic:
```bash
npm run check
```

This will show exactly what's wrong with your .env file.

---

**Quick Fix:** Run `npm run fix-db-url` and enter your password! ⚡
