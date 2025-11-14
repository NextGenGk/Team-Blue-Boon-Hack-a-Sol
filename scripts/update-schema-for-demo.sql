-- Update caregivers table to allow NULL user_id for demo data
-- Run this in your Supabase SQL Editor

-- First, let's make user_id nullable for demo purposes
ALTER TABLE caregivers ALTER COLUMN user_id DROP NOT NULL;

-- Update RLS policies to allow public read access for demo
DROP POLICY IF EXISTS "Public caregiver search" ON caregivers;
CREATE POLICY "Public caregiver search" ON caregivers FOR SELECT USING (
  is_active = true AND is_verified = true
);

-- Allow anonymous access to search caregivers
DROP POLICY IF EXISTS "Caregivers can view own data" ON caregivers;
CREATE POLICY "Caregivers can view own data" ON caregivers FOR SELECT USING (
  user_id IS NULL OR -- Allow demo data
  user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
);

-- Allow inserting demo data (only in development)
CREATE POLICY "Allow demo data insertion" ON caregivers FOR INSERT WITH CHECK (
  user_id IS NULL -- Only allow demo data without user_id
);