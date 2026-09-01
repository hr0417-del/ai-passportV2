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

export async function ensureLearnerProvisioned(user) {
  if (!user || !user.id) return;

  // 1. Ensure Profile
  try {
    const { data: profile } = await supabase.from('profiles').select('id').eq('id', user.id).maybeSingle();
    if (!profile) {
      const username = (user.email ? user.email.split('@')[0] : 'learner') + '_' + Math.floor(1000 + Math.random() * 9000);
      const fullName = user.user_metadata?.full_name || (user.email ? user.email.split('@')[0] : 'Learner');
      await supabase.from('profiles').insert([{
        id: user.id,
        email: user.email,
        full_name: fullName,
        username: username,
        role: 'LEARNER'
      }]);
    }
  } catch (e) {}

  // 2. Ensure Privacy Settings
  try {
    const { data: priv } = await supabase.from('privacy_settings').select('user_id').eq('user_id', user.id).maybeSingle();
    if (!priv) {
      await supabase.from('privacy_settings').insert([{
        user_id: user.id,
        is_public_passport_enabled: true
      }]);
    }
  } catch (e) {}

  // 3. Ensure Passport Card
  try {
    const { data: card } = await supabase.from('passport_cards').select('id').eq('user_id', user.id).maybeSingle();
    if (!card) {
      const seqNum = Math.floor(100000 + Math.random() * 899999);
      const passportNum = `AIP-L1-2026-${seqNum}`;
      await supabase.from('passport_cards').insert([{
        user_id: user.id,
        passport_number: passportNum,
        status: 'ACTIVE',
        activation_status: 'ACTIVATED'
      }]);
    }
  } catch (e) {}

  // 4. Ensure 5 Capability States
  try {
    const { data: caps } = await supabase.from('capability_states').select('id').eq('user_id', user.id);
    if (!caps || caps.length === 0) {
      const dims = ['UNDERSTAND', 'APPLY', 'CREATE', 'EVALUATE', 'RESPONSIBLE'];
      const rows = dims.map(d => ({
        user_id: user.id,
        dimension: d,
        state: 'EXPLORE'
      }));
      await supabase.from('capability_states').insert(rows);
    }
  } catch (e) {}

  // 5. Ensure Initial Journey Event
  try {
    const { data: events } = await supabase.from('journey_events').select('id').eq('user_id', user.id);
    if (!events || events.length === 0) {
      await supabase.from('journey_events').insert([{
        user_id: user.id,
        event_type: 'JOINED',
        title: 'Joined AI Passport Ecosystem',
        description: 'Issued Digital Passport Identity Space'
      }]);
    }
  } catch (e) {}
}

export async function safeFetch(queryPromise, fallbackData, timeoutMs = 2000) {
  try {
    const timeout = new Promise((resolve) => setTimeout(() => resolve({ data: fallbackData }), timeoutMs));
    const result = await Promise.race([queryPromise, timeout]);
    return (result && result.data) ? result.data : fallbackData;
  } catch (e) {
    return fallbackData;
  }
}



