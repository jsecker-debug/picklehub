// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://epvsdkajmaoekdqzfqjk.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwdnNka2FqbWFvZWtkcXpmcWprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg3Njc1MDIsImV4cCI6MjA1NDM0MzUwMn0.GsPu-bz7-Osu8QSqyOQf1inRV5hFbZG4jmcUxDbZuGg";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);