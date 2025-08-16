import { createClient } from '@supabase/supabase-js';

// It's crucial to use VITE_ prefix for environment variables to be exposed to the client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key:', supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and/or anonymous key are not provided in environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('Supabase client created successfully.');
