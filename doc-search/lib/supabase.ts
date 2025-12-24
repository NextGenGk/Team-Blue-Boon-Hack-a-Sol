
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase URL or Key environment variables');
}

// We use the service role key if available for server-side operations to bypass RLS if needed,
// but anon key is fine if RLS policies are set up correctly for public access.
export const supabase = createClient(supabaseUrl, supabaseKey);
