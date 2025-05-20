
import { createClient } from '@supabase/supabase-js';

// Create a single supabase client for interacting with your database
// Note: In production, you should use environment variables for these values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
