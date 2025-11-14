-- Migration script to update database for Clerk authentication
-- Run this in your Supabase SQL Editor

-- 1. Add clerk_id column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS clerk_id TEXT;

-- 2. Create index on clerk_id for better performance
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);

-- 3. Update RLS policies to use clerk_id instead of auth_id
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- Create new policies that don't rely on auth.uid() since we're using Clerk
-- Note: You'll need to handle authorization in your application code now
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Optional: If you want to keep RLS but handle it differently
-- You can create policies based on your application logic
-- For now, we'll disable RLS and handle permissions in the application

-- 4. Update any foreign key constraints or triggers if needed
-- (This depends on your specific schema)

-- 5. Clean up: You can remove auth_id column after migrating data
-- ALTER TABLE users DROP COLUMN IF EXISTS auth_id;

-- Note: Make sure to update your application code to use clerk_id before running the cleanup