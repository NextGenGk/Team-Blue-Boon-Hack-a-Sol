-- =====================================================
-- Supabase Trigger to Auto-Sync Doctors to RAG System
-- =====================================================
-- This script creates a database trigger that automatically
-- calls a webhook whenever a new doctor is inserted into
-- the doctors table, syncing it to the RAG (Pinecone) system.

-- Step 1: Create a function to call the webhook
CREATE OR REPLACE FUNCTION notify_doctor_sync()
RETURNS TRIGGER AS $$
DECLARE
  webhook_url TEXT;
  webhook_secret TEXT;
  payload JSONB;
BEGIN
  -- Set your webhook URL (replace with your actual ayur-rag URL)
  -- For local development: http://localhost:3002/api/sync-doctor
  -- For production: https://your-ayur-rag-domain.com/api/sync-doctor
  webhook_url := 'http://localhost:3002/api/sync-doctor';
  
  -- Set your webhook secret (should match WEBHOOK_SECRET in ayur-rag .env)
  webhook_secret := 'your-secret-key-here-change-this';
  
  -- Build the payload with doctor data
  payload := jsonb_build_object(
    'type', TG_OP,
    'table', TG_TABLE_NAME,
    'record', row_to_json(NEW)
  );
  
  -- Make HTTP POST request to webhook
  PERFORM
    net.http_post(
      url := webhook_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || webhook_secret
      ),
      body := payload
    );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Create trigger on doctors table for INSERT
CREATE TRIGGER doctor_insert_sync_trigger
  AFTER INSERT ON doctors
  FOR EACH ROW
  EXECUTE FUNCTION notify_doctor_sync();

-- Step 3: Create trigger on doctors table for UPDATE
CREATE TRIGGER doctor_update_sync_trigger
  AFTER UPDATE ON doctors
  FOR EACH ROW
  EXECUTE FUNCTION notify_doctor_sync();

-- =====================================================
-- To enable this, you need to:
-- 1. Enable the pg_net extension in Supabase:
--    - Go to Database > Extensions in Supabase Dashboard
--    - Enable "pg_net" extension
-- 
-- 2. Update webhook_url with your actual ayur-rag URL
-- 
-- 3. Update webhook_secret with a secure random string
--    and add it to your ayur-rag .env file as WEBHOOK_SECRET
-- =====================================================

-- To test the trigger, insert a test doctor:
-- INSERT INTO doctors (did, uid, specialization, qualification, ...) VALUES (...);

-- To disable the triggers:
-- DROP TRIGGER IF EXISTS doctor_insert_sync_trigger ON doctors;
-- DROP TRIGGER IF EXISTS doctor_update_sync_trigger ON doctors;
-- DROP FUNCTION IF EXISTS notify_doctor_sync();
