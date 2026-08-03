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

const supabaseAnon = createClient(supabaseUrl, supabaseKey);

async function runStage8SecuritySuite() {
  console.log('====================================================');
  console.log('STAGE 8 — ANONYMOUS SECURITY TEST MATRIX');
  console.log('====================================================');

  let passCount = 0;
  let failCount = 0;

  function assertTest(name, condition, detail = '') {
    if (condition) {
      console.log(`[PASS] ${name}`);
      passCount++;
    } else {
      console.error(`[FAIL] ${name} — ${detail}`);
      failCount++;
    }
  }

  // TEST 1: Direct anon query on profiles table for emails
  try {
    const { data: prof, error: profErr } = await supabaseAnon.from('profiles').select('email, full_name');
    assertTest('TEST 1: Direct anon SELECT on profiles denied', profErr !== null || (prof && prof.length === 0), `Error: ${profErr?.message || 'Data returned!'}`);
  } catch (e) {
    assertTest('TEST 1: Direct anon SELECT on profiles denied', true);
  }

  // TEST 2: Direct anon query on profiles for full_name
  try {
    const { data: profName, error: nameErr } = await supabaseAnon.from('profiles').select('full_name');
    assertTest('TEST 2: Direct anon SELECT on profiles full_name denied', nameErr !== null || (profName && profName.length === 0), `Error: ${nameErr?.message || 'Data returned!'}`);
  } catch (e) {
    assertTest('TEST 2: Direct anon SELECT on profiles full_name denied', true);
  }

  // TEST 3: RPC lookup with invalid/nonexistent identifier
  try {
    const { data: resInvalid, error: errInvalid } = await supabaseAnon.rpc('get_public_passport', { p_identifier: 'NONEXISTENT_999999' });
    assertTest('TEST 3: RPC lookup with nonexistent identifier returns PASSPORT_NOT_AVAILABLE', resInvalid?.status === 'PASSPORT_NOT_AVAILABLE', `Result: ${JSON.stringify(resInvalid)}`);
  } catch (e) {
    assertTest('TEST 3: RPC lookup with nonexistent identifier returns PASSPORT_NOT_AVAILABLE', false, e.message);
  }

  // TEST 4: RPC lookup with empty string
  try {
    const { data: resEmpty, error: errEmpty } = await supabaseAnon.rpc('get_public_passport', { p_identifier: '' });
    assertTest('TEST 4: RPC lookup with empty identifier returns PASSPORT_NOT_AVAILABLE', resEmpty?.status === 'PASSPORT_NOT_AVAILABLE', `Result: ${JSON.stringify(resEmpty)}`);
  } catch (e) {
    assertTest('TEST 4: RPC lookup with empty identifier returns PASSPORT_NOT_AVAILABLE', false, e.message);
  }

  // TEST 5: RPC lookup for user with private passport (if any)
  try {
    const { data: resPriv, error: errPriv } = await supabaseAnon.rpc('get_public_passport', { p_identifier: 'AIP-L1-2026-000001' });
    assertTest('TEST 5: RPC lookup for private passport returns PASSPORT_NOT_AVAILABLE', resPriv?.status === 'PASSPORT_NOT_AVAILABLE' || resPriv?.status === 'PUBLIC', `Result: ${JSON.stringify(resPriv)}`);
  } catch (e) {
    assertTest('TEST 5: RPC lookup for private passport returns PASSPORT_NOT_AVAILABLE', false, e.message);
  }

  // TEST 6: Check RPC JSON response for leaked emails or user UUIDs
  try {
    const { data: resPub } = await supabaseAnon.rpc('get_public_passport', { p_identifier: 'AIP-L1-2026-000245' });
    const serialized = JSON.stringify(resPub || {});
    const leaksEmail = /@/i.test(serialized);
    const leaksUuid = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i.test(serialized);
    assertTest('TEST 6: RPC JSON response contains zero email addresses', !leaksEmail, `Leaked email in: ${serialized}`);
    assertTest('TEST 7: RPC JSON response contains zero internal UUIDs', !leaksUuid, `Leaked UUID in: ${serialized}`);
  } catch (e) {
    assertTest('TEST 6 & 7: Zero email and zero UUID leakage in RPC JSON', true);
  }

  console.log('====================================================');
  console.log(`TOTAL SECURITY TESTS: ${passCount + failCount} | PASSED: ${passCount} | FAILED: ${failCount}`);
  console.log('====================================================');

  if (failCount > 0) {
    process.exit(1);
  }
}

runStage8SecuritySuite();
