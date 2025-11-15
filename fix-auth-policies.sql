-- Fix infinite recursion in RLS policies
-- This script fixes the authentication issues by updating the RLS policies
-- Safe version that handles existing policies

-- 1. Temporarily disable RLS to avoid recursion issues
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_tracking DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_log DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.caregivers DISABLE ROW LEVEL SECURITY;

-- 2. Drop ALL existing policies to start fresh
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on all tables
    FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
    END LOOP;
END $$;

-- 3. Re-enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.caregivers ENABLE ROW LEVEL SECURITY;

-- 4. Create simple, non-recursive policies for users table
CREATE POLICY users_select_own ON public.users FOR SELECT USING (auth_id = auth.uid());
CREATE POLICY users_update_own ON public.users FOR UPDATE USING (auth_id = auth.uid());
CREATE POLICY users_insert_own ON public.users FOR INSERT WITH CHECK (auth_id = auth.uid());
CREATE POLICY users_service_role ON public.users FOR ALL USING (auth.role() = 'service_role');

-- 5. Create simple policies for patients (avoiding subqueries that cause recursion)
-- For now, allow authenticated users to access patient data
CREATE POLICY patients_auth_access ON public.patients FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY patients_service_role ON public.patients FOR ALL USING (auth.role() = 'service_role');

-- 6. Create simple policies for appointments
CREATE POLICY appointments_auth_access ON public.appointments FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY appointments_service_role ON public.appointments FOR ALL USING (auth.role() = 'service_role');

-- 7. Create simple policies for other tables (avoiding complex subqueries)
CREATE POLICY finance_auth_access ON public.finance_log FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY finance_service_role ON public.finance_log FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY notifications_auth_access ON public.notifications FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY notifications_service_role ON public.notifications FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY prescriptions_auth_access ON public.prescriptions FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY prescriptions_service_role ON public.prescriptions FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY progress_auth_access ON public.progress_tracking FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY progress_service_role ON public.progress_tracking FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY receipts_auth_access ON public.receipts FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY receipts_service_role ON public.receipts FOR ALL USING (auth.role() = 'service_role');

-- 8. Caregivers - allow public read for directory, auth for modifications
CREATE POLICY caregivers_public_read ON public.caregivers FOR SELECT USING (is_active = true);
CREATE POLICY caregivers_auth_modify ON public.caregivers FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY caregivers_auth_update ON public.caregivers FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY caregivers_service_role ON public.caregivers FOR ALL USING (auth.role() = 'service_role');

-- 9. AI queries - allow public inserts, auth for reads
CREATE POLICY ai_queries_public_insert ON public.ai_queries_log FOR INSERT WITH CHECK (true);
CREATE POLICY ai_queries_auth_read ON public.ai_queries_log FOR SELECT USING (auth.uid() IS NOT NULL OR user_id IS NULL);
CREATE POLICY ai_queries_service_role ON public.ai_queries_log FOR ALL USING (auth.role() = 'service_role');