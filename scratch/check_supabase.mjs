import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uxuaisvdmvkircymwvdl.supabase.co';
const supabaseKey = 'sb_publishable_M6cxghtva7ZHqMLt2-RS1w_CfYeaMTF';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkConnection() {
  console.log('Testing Supabase Client connection to:', supabaseUrl);
  
  const tables = ['profiles', 'passport_cards', 'capability_states', 'journey_events', 'privacy_settings'];
  
  for (const table of tables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`❌ Table '${table}': Error - ${error.message} (Code: ${error.code})`);
      } else {
        console.log(`✅ Table '${table}': Connected! Count = ${count}`);
      }
    } catch (err) {
      console.log(`❌ Table '${table}': Exception - ${err.message}`);
    }
  }

  // Also query sample profiles to show online registrants/users
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, username, role, created_at')
      .limit(10);
    
    if (error) {
      console.log('Error fetching profiles sample:', error.message);
    } else {
      console.log('\n--- Sample Profiles in Supabase Database ---');
      console.table(profiles);
    }
  } catch(e) {
    console.log('Error querying sample profiles:', e.message);
  }
}

checkConnection();
