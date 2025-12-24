-- =====================================================
-- Alternative: Supabase Database Webhook (Simpler Approach)
-- =====================================================
-- This approach uses Supabase's built-in Database Webhooks
-- which is more reliable than pg_net extension.
--
-- SETUP INSTRUCTIONS:
-- =====================================================
--
-- 1. Go to your Supabase Dashboard
-- 2. Navigate to Database > Webhooks
-- 3. Click "Create a new hook"
-- 4. Configure as follows:
--
--    Name: doctor-sync-to-rag
--    Table: doctors
--    Events: INSERT, UPDATE
--    Type: HTTP Request
--    Method: POST
--    URL: http://localhost:3002/api/sync-doctor (for local)
--         OR https://your-ayur-rag-domain.com/api/sync-doctor (for production)
--    
--    HTTP Headers:
--      Content-Type: application/json
--      Authorization: Bearer your-secret-key-here
--
-- 5. Click "Create webhook"
--
-- =====================================================
-- TESTING:
-- =====================================================
-- After setting up the webhook, test by inserting a doctor:

-- Example test insert (modify values as needed):
INSERT INTO doctors (
  did, 
  uid, 
  specialization, 
  qualification, 
  registration_number, 
  years_of_experience, 
  consultation_fee, 
  bio, 
  clinic_name, 
  address_line1, 
  city, 
  state, 
  country, 
  postal_code, 
  languages, 
  is_verified
) VALUES (
  '350e8400-e29b-41d4-a716-446655440999',  -- did
  '650e8400-e29b-41d4-a716-446655440999',  -- uid
  'General Medicine',                       -- specialization
  'MBBS, MD',                              -- qualification
  'MCI-99001',                             -- registration_number
  5,                                       -- years_of_experience
  '500.00',                                -- consultation_fee
  'Test doctor for RAG sync',              -- bio
  'Test Clinic',                           -- clinic_name
  '123 Test Street',                       -- address_line1
  'Indore',                                -- city
  'Madhya Pradesh',                        -- state
  'India',                                 -- country
  '452001',                                -- postal_code
  ARRAY['English', 'Hindi'],               -- languages
  TRUE                                     -- is_verified
);

-- Check if the doctor was synced to RAG by checking:
-- 1. The ayur-rag server logs
-- 2. The docters.json file in ayur-rag/data/
-- 3. Pinecone dashboard to verify the vector was added

-- =====================================================
-- ENVIRONMENT VARIABLES:
-- =====================================================
-- Add to your ayur-rag/.env file:
-- WEBHOOK_SECRET=your-secret-key-here
-- (This should match the Authorization header in the webhook)
-- =====================================================
