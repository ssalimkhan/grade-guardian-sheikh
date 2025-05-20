
import { createClient } from '@supabase/supabase-js';

// To be configured after Supabase integration
// The actual URL and key will be provided by the Supabase integration
const supabaseUrl = 'https://your-project-url.supabase.co';
const supabaseAnonKey = 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
