# 🔧 Next.js Environment Variables Setup

## Quick Fix for Your .env File

Your `.env` file needs to be updated for Next.js compatibility. Here's exactly what you need:

---

## ✅ **Required Variables:**

### 1. DATABASE_URL (Server-only)
```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.rsnysvtjnqwxbgdnhxwu.supabase.co:5432/postgres
```

**Where to get it:**
- Supabase Dashboard → Settings → Database → Connection String → URI
- Replace `[YOUR-PASSWORD]` with your actual password
- **URL-encode special characters!**

### 2. GEMINI_API_KEY (Server-only)
```env
GEMINI_API_KEY=AIzaSy...
```

**Where to get it:**
- https://makersuite.google.com/app/apikey
- Click "Create API Key"

---

## 📝 **Optional Variables (for future features):**

### 3. NEXT_PUBLIC_SUPABASE_URL (Client + Server)
```env
NEXT_PUBLIC_SUPABASE_URL=https://rsnysvtjnqwxbgdnhxwu.supabase.co
```

### 4. NEXT_PUBLIC_SUPABASE_ANON_KEY (Client + Server)
```env
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

**Note:** Variables with `NEXT_PUBLIC_` prefix are exposed to the browser. Use them only for public data!

---

## 🎯 **Complete .env File Example:**

```env
# Required for API routes (server-only, secure)
DATABASE_URL=postgresql://postgres:MyP%40ss%23123@db.rsnysvtjnqwxbgdnhxwu.supabase.co:5432/postgres
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Optional (for future client-side features)
NEXT_PUBLIC_SUPABASE_URL=https://rsnysvtjnqwxbgdnhxwu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Server config
PORT=3000
NODE_ENV=development
```

---

## ⚠️ **Important: URL-Encode Your Password!**

If your password has special characters, encode them:

| Character | Encoded |
|-----------|---------|
| `@` | `%40` |
| `#` | `%23` |
| `%` | `%25` |
| `&` | `%26` |
| `+` | `%2B` |
| `/` | `%2F` |
| `=` | `%3D` |

**Example:**
```
Password: MyP@ss#123
Encoded:  MyP%40ss%23123
```

---

## 🧪 **Test Your Configuration:**

```bash
npm run check
```

This will validate your `.env` file and show any errors.

---

## 🔄 **After Updating .env:**

1. **Save the file**
2. **Restart the dev server:**
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```
3. **Test at:** http://localhost:3000

---

## 📚 **Next.js Environment Variables Guide:**

### Server-Only (Secure)
- `DATABASE_URL` - Never exposed to browser
- `GEMINI_API_KEY` - Never exposed to browser
- Any variable without `NEXT_PUBLIC_` prefix

### Client + Server (Public)
- `NEXT_PUBLIC_SUPABASE_URL` - Safe to expose
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Safe to expose (it's public anyway)
- Any variable with `NEXT_PUBLIC_` prefix

---

## 🚨 **Common Mistakes:**

❌ **DON'T:**
```env
DATABASE_URL="postgresql://..."  # No quotes!
DATABASE_URL = postgresql://...  # No spaces around =
```

✅ **DO:**
```env
DATABASE_URL=postgresql://...
```

---

## 💡 **Pro Tip:**

Use the setup script to create your `.env` file:

```bash
npm run setup
```

It will ask for each value and automatically URL-encode your password!

---

**Once your `.env` is configured, Next.js will automatically load it!** 🎉
