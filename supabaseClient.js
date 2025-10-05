// supabase.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// ⚠️ REPLACE with your Supabase Project URL and Anon Key
const SUPABASE_URL = 'https://winofscuhjtljlzepxfk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indpbm9mc2N1aGp0bGpsemVweGZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5MzY4MzYsImV4cCI6MjA3MzUxMjgzNn0.quRqQP2-i1dKx_9eg4PqMr9tGDmML5Jo-z2cGcaqoeE';

// Export the Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);