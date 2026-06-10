import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured =
  typeof supabaseUrl === 'string' &&
  supabaseUrl.length > 0 &&
  typeof supabaseAnonKey === 'string' &&
  supabaseAnonKey.length > 0;

if (!isSupabaseConfigured) {
  // eslint-disable-next-line no-console
  console.error(
    '[supabase] Faltan variables de entorno VITE_SUPABASE_URL y/o VITE_SUPABASE_ANON_KEY. ' +
    'Revisá tu archivo .env.local.',
  );
}

export const supabase = createClient(
  supabaseUrl ?? 'https://invalid.supabase.co',
  supabaseAnonKey ?? 'invalid-key',
);
