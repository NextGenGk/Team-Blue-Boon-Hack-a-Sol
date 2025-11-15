-- Fix RLS policies for development/demo
-- Run this in Supabase SQL Editor

-- 1. Drop existing restrictive policies
DROP POLICY IF EXISTS users_select_own ON public.users;
DROP POLICY IF EXISTS caregivers_public_read ON public.caregivers;

-- 2. Create more permissive policies for development
-- Allow public read access to users table (for demo purposes)
CREATE POLICY users_public_read ON public.users FOR SELECT USING (true);

-- Allow authenticated users to update their own records
CREATE POLICY users_update_own ON public.users FOR UPDATE USING (auth.uid() = auth_id);

-- Allow public read access to caregivers (for search functionality)
CREATE POLICY caregivers_public_read ON public.caregivers FOR SELECT USING (is_active = true);

-- Allow caregivers to update their own data
CREATE POLICY caregivers_update_own ON public.caregivers FOR UPDATE USING (
  user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
);

-- 3. Make patients table more accessible for demo
DROP POLICY IF EXISTS patients_select ON public.patients;
CREATE POLICY patients_public_read ON public.patients FOR SELECT USING (true);

-- 4. Make appointments accessible for demo
DROP POLICY IF EXISTS appointments_select ON public.appointments;
CREATE POLICY appointments_public_read ON public.appointments FOR SELECT USING (true);

-- 5. Make other tables accessible for demo
DROP POLICY IF EXISTS prescriptions_select ON public.prescriptions;
CREATE POLICY prescriptions_public_read ON public.prescriptions FOR SELECT USING (true);

DROP POLICY IF EXISTS progress_select ON public.progress_tracking;
CREATE POLICY progress_public_read ON public.progress_tracking FOR SELECT USING (true);

DROP POLICY IF EXISTS finance_select ON public.finance_log;
CREATE POLICY finance_public_read ON public.finance_log FOR SELECT USING (true);

DROP POLICY IF EXISTS receipts_select ON public.receipts;
CREATE POLICY receipts_public_read ON public.receipts FOR SELECT USING (true);

DROP POLICY IF EXISTS notifications_select ON public.notifications;
CREATE POLICY notifications_public_read ON public.notifications FOR SELECT USING (true);

-- AI queries already allow public access, so no changes needed

-- Note: These policies are for development/demo purposes only
-- In production, you should implement proper user-specific access controls