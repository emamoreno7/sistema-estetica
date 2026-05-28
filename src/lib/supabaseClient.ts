import { createClient } from '@supabase/supabase-js';

// Ponemos los datos reales aquí para que Vercel no tenga que adivinar
const supabaseUrl = 'https://atbbbhpbexrtnlbvvzjb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0YmJiaHBiZXhydG5sYnZ2empiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1MDA3NzcsImV4cCI6MjA5MzA3Njc3N30.S2yO-OATicmNkyZf2KXMiTze3Omdt7RGntT8LfixyhE'; 

export const isSupabaseConfigured = true;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);