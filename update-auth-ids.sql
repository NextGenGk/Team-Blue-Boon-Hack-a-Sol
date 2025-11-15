-- Update auth_id values to match your current authenticated user
-- Replace 'YOUR_ACTUAL_AUTH_UID' with your real auth.uid() value
-- You can get this from: SELECT auth.uid();

-- First, get your current auth UID (run this first to get the value)
SELECT auth.uid() as current_user_id;

-- Then update one of the patient users to match your auth UID
-- Replace the UUID below with the result from the query above
UPDATE public.users 
SET auth_id = '2f842cf8-8e9b-4a31-8483-87fce89f837f'  -- Replace with your actual auth.uid()
WHERE email = 'patient01@example.com';

-- Optionally, update a caregiver user as well
UPDATE public.users 
SET auth_id = '2f842cf8-8e9b-4a31-8483-87fce89f837f'  -- Replace with your actual auth.uid()
WHERE email = 'nurse01@example.com';

-- Verify the updates
SELECT id, email, role, auth_id FROM public.users WHERE auth_id IS NOT NULL;