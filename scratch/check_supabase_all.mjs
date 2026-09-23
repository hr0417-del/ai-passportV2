import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://uxuaisvdmvkircymwvdl.supabase.co', 'sb_publishable_M6cxghtva7ZHqMLt2-RS1w_CfYeaMTF');

async function checkSupabaseProfiles() {
  const { data: profiles, error } = await supabase.from('profiles').select('*');
  console.log('--- Supabase Profiles Count:', profiles ? profiles.length : 0);
  if (profiles) {
    console.table(profiles);
  }
}

checkSupabaseProfiles();
