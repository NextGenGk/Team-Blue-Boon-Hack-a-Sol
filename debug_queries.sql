-- Debug queries to check database state

-- 1. Check if users exist
SELECT 'Users count:' as info, COUNT(*) as count FROM users;

-- 2. Check if caregivers exist
SELECT 'Caregivers count:' as info, COUNT(*) as count FROM caregivers;

-- 3. Check caregiver types
SELECT 'Caregivers by type:' as info, type, COUNT(*) as count 
FROM caregivers 
GROUP BY type;

-- 4. Check if search function exists
SELECT 'Function exists:' as info, proname as function_name
FROM pg_proc 
WHERE proname = 'search_caregivers_by_symptoms';

-- 5. Test the search function directly
SELECT 'Direct function test:' as info;
SELECT * FROM search_caregivers_by_symptoms(
  ARRAY['headache'], 
  28.5672, 
  77.2100, 
  30, 
  'doctor'
) LIMIT 3;

-- 6. Check active caregivers
SELECT 'Active caregivers:' as info;
SELECT 
  u.first_name || ' ' || u.last_name as name,
  c.type,
  c.specializations,
  c.is_active,
  c.is_verified
FROM caregivers c
JOIN users u ON c.user_id = u.id
WHERE c.is_active = true
LIMIT 5;

-- 7. Check if any caregivers have coordinates
SELECT 'Caregivers with location:' as info, COUNT(*) as count
FROM caregivers 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;