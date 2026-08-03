/* ==========================================================================
   MY AI PASSPORT™ — SUPABASE CLIENT & AUTH API LAYER
   ========================================================================== */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if valid credentials exist
export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project-ref.supabase.co' &&
  !supabaseUrl.includes('your-project-ref')
);

if (!isSupabaseConfigured) {
  console.warn(
    '⚠️ [MY AI PASSPORT] Supabase credentials not configured in .env file.\n' +
    'Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.\n' +
    'Demo mode is active for testing the authenticated application shell.'
  );
}

// Initialize real Supabase client or fallback dummy client
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    })
  : createDummyClient();

// Fallback dummy client for build safety and local demo mode
function createDummyClient() {
  const dummyUser = {
    id: 'demo-user-001',
    email: 'learner@aipasport.org',
    user_metadata: { full_name: 'Demo AI Builder' }
  };

  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      signUp: async ({ email, password, options }) => {
        return { 
          data: { user: { ...dummyUser, email, user_metadata: options?.data } }, 
          error: null 
        };
      },
      signInWithPassword: async ({ email }) => {
        return { 
          data: { user: { ...dummyUser, email }, session: { access_token: 'demo-token' } }, 
          error: null 
        };
      },
      signOut: async () => ({ error: null }),
      onAuthStateChange: (callback) => {
        // Return unsubscribe function
        return { data: { subscription: { unsubscribe: () => {} } } };
      }
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: null, error: null }),
          data: [], error: null
        }),
        data: [], error: null
      }),
      insert: async () => ({ data: [], error: null }),
      update: async () => ({ data: [], error: null })
    })
  };
}

/* --- Helper API Methods --- */

export async function getCurrentUser() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (err) {
    return null;
  }
}

export async function getLearnerProfile(userId) {
  if (!isSupabaseConfigured) {
    return {
      id: userId || 'demo-user-001',
      full_name: 'Verified Builder',
      username: 'aip_builder',
      email: 'learner@aipassport.org',
      role: 'LEARNER',
      avatar_url: null,
      bio: 'Practical AI Builder & Practitioner'
    };
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
}

export async function getPassportCard(userId) {
  if (!isSupabaseConfigured) {
    return {
      passport_number: 'AIP-L1-2026-000245',
      status: 'ACTIVE',
      activation_status: 'ACTIVATED',
      issue_date: '2026-01-15'
    };
  }

  const { data, error } = await supabase
    .from('passport_cards')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data;
}
