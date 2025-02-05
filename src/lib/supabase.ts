import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Anon Key. Please check your environment variables.');
}

// Validate URL format
if (supabaseUrl && !supabaseUrl.startsWith('https://')) {
  console.error('Invalid Supabase URL format. URL must start with https://');
}

export const supabase = createClient(
  supabaseUrl && supabaseUrl.startsWith('https://') ? supabaseUrl : 'https://placeholder.supabase.co',
  supabaseKey || ''
);