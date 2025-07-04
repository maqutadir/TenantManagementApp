// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Supabase URL or Anon Key is missing. " +
    "Make sure you have set REACT_APP_SUPABASE_URL (e.g., https://xlpmsgztmsqrbfyywuck.supabase.co) " +
    "and REACT_APP_SUPABASE_ANON_KEY in your .env file. "
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);