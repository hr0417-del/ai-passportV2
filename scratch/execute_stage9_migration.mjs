import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

let supabaseUrl = 'https://uxuaisvdmvkircymwvdl.supabase.co';
let supabaseKey = '';

try {
  const envContent = fs.readFileSync('c:/Users/HP/Downloads/AIPASS/.env', 'utf8');
  envContent.split('\n').forEach(line => {
    if (line.startsWith('VITE_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim();
    if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) supabaseKey = line.split('=')[1].trim();
  });
} catch(e){}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyStage9() {
  console.log('=== VERIFYING STAGE 9 PRODUCTION SCHEMA ===');

  // Check authority_events table accessibility / RLS
  const { data: authEvents, error: authEventsErr } = await supabase.from('authority_events').select('*').limit(1);
  console.log('authority_events:', authEvents, 'Err:', authEventsErr);

  // Check capability_history table accessibility / RLS
  const { data: capHist, error: capHistErr } = await supabase.from('capability_history').select('*').limit(1);
  console.log('capability_history:', capHist, 'Err:', capHistErr);

  // Check profiles roles
  const { data: profs, error: profsErr } = await supabase.from('profiles').select('id, email, role');
  console.log('profiles:', profs, 'Err:', profsErr);
}

verifyStage9();
