import { createClient } from '@supabase/supabase-js';

// It's crucial to use VITE_ prefix for environment variables to be exposed to the client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and/or anonymous key are not provided in environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
