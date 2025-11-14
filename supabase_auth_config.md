# Supabase Authentication Configuration

## 1. Site URL Configuration
In your Supabase Dashboard → Authentication → URL Configuration:

**Site URL:** `http://localhost:3000`

**Redirect URLs:** 
- `http://localhost:3000/auth/callback`

## 2. Phone Authentication Setup
Go to Authentication → Settings:
1. Enable Phone authentication
2. Configure SMS provider (Twilio recommended):
   - Add your Twilio Account SID
   - Add your Twilio Auth Token
   - Add your Twilio phone number
3. Set SMS template for OTP messages

## 3. Email Templates (Optional - for Google OAuth)
Go to Authentication → Email Templates to customize:
- Confirm signup
- Reset password
- Magic link

## 3. OAuth Providers (Optional)
To enable Google OAuth:
1. Go to Authentication → Providers
2. Enable Google
3. Add your Google OAuth credentials:
   - Client ID
   - Client Secret

## 4. RLS Policies
Make sure your `users` table has proper RLS policies:

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own data
CREATE POLICY "Users can view own profile" ON users
FOR SELECT USING (auth.uid() = auth_id);

-- Policy for users to update their own data
CREATE POLICY "Users can update own profile" ON users
FOR UPDATE USING (auth.uid() = auth_id);

-- Policy for inserting new users (during signup)
CREATE POLICY "Users can insert own profile" ON users
FOR INSERT WITH CHECK (auth.uid() = auth_id);
```

## 5. Test Authentication
1. Go to `http://localhost:3000/auth/signup`
2. Create a new account
3. Check email for confirmation (if email confirmation is enabled)
4. Login at `http://localhost:3000/auth/login`