-- Debug queries to check database state

-- 1. Check if users exist
SELECT 'Users count:' as info, COUNT(*) as count FROM users;

-- 2. Check if caregivers exist
SELECT 'Caregivers count:' as info, COUNT(*) as count FROM caregivers;

-- 3. Check caregiver types
SELECT 'Caregivers by type:' as info, type, COUNT(*) as count 
FROM caregivers 
GROUP BY type;

-- 4. Check active and verified caregivers
SELECT 'Active & Verified caregivers:' as info, COUNT(*) as count 
FROM caregivers 
WHERE is_active = true AND is_verified = true;

-- 5. Check if search function exists
SELECT 'Function exists:' as info, proname as function_name
FROM pg_proc 
WHERE proname = 'search_caregivers_by_symptoms';

-- 6. Test the search function directly with simple parameters
SELECT 'Direct function test - simple:' as info;
SELECT COUNT(*) as result_count FROM search_caregivers_by_symptoms(
  ARRAY['headache'], 
  NULL, 
  NULL, 
  NULL, 
  NULL
);

-- 7. Test with location
SELECT 'Direct function test - with location:' as info;
SELECT COUNT(*) as result_count FROM search_caregivers_by_symptoms(
  ARRAY['headache'], 
  28.5672, 
  77.2100, 
  30, 
  'doctor'
);

-- 8. Check sample caregivers with details
SELECT 'Sample caregivers:' as info;
SELECT 
  u.first_name || ' ' || u.last_name as name,
  c.type,
  c.specializations,
  c.is_active,
  c.is_verified,
  c.latitude,
  c.longitude
FROM caregivers c
JOIN users u ON c.user_id = u.id
LIMIT 5;