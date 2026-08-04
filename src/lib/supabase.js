/* ==========================================================================
   MY AI PASSPORT™ — SUPABASE CLIENT & AUTH API LAYER
   ========================================================================== */

import { createClient } from '@supabase/supabase-js';

// Production credentials — the anon/publishable key is intentionally public.
// See: https://supabase.com/docs/guides/api/api-keys
const PROD_URL = 'https://uxuaisvdmvkircymwvdl.supabase.co';
const PROD_ANON_KEY = 'sb_publishable_M6cxghtva7ZHqMLt2-RS1w_CfYeaMTF';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || PROD_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || PROD_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('your-project-ref')
);

// Initialize production Supabase client
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);

/* --- Helper API Methods --- */

export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    return user;
  } catch (err) {
    return null;
  }
}

export async function getLearnerProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

export async function getPassportCard(userId) {
  const { data, error } = await supabase
    .from('passport_cards')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data;
}
