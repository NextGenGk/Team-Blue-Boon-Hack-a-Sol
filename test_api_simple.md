# Simple API Tests

## Test 1: Check if any caregivers exist (no filters)
```
http://localhost:3000/api/search/caregivers?symptoms=headache
```

## Test 2: Check without location
```
http://localhost:3000/api/search/caregivers?symptoms=headache&type=doctor
```

## Test 3: Check with very large radius
```
http://localhost:3000/api/search/caregivers?symptoms=headache&type=doctor&lat=28.5672&lng=77.2100&radius=1000
```

## Test 4: Check all caregiver types
```
http://localhost:3000/api/search/caregivers?symptoms=headache&lat=28.5672&lng=77.2100&radius=50
```

## Expected Issues:
1. **No data loaded** - Run the healthcare_complete.sql file first
2. **Function not found** - The search function wasn't created
3. **No location data** - Caregivers don't have lat/lng coordinates
4. **Wrong parameters** - Function signature mismatch

## Quick Fix - Load Sample Data:
Run this in Supabase SQL Editor:
```sql
-- Quick check if data exists
SELECT COUNT(*) as caregiver_count FROM caregivers;
SELECT COUNT(*) as user_count FROM users;

-- If counts are 0, run the full healthcare_complete.sql file
```