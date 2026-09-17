import https from 'https';
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbzn5hwbjhjAaeBWMBjPvv5ZJsCxExVxo269GmEDHtsZrsEzFfX2mbjMzxR1-vcDGgg/exec';

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchJson(res.headers.location).then(resolve).catch(reject);
      }
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve({ raw: body });
        }
      });
    }).on('error', reject);
  });
}

async function runSync() {
  console.log('🔄 Checking Live Google Sheet API endpoint...');
  const baseStatus = await fetchJson(WEBHOOK_URL);
  console.log('Base Webhook Response:', baseStatus);

  console.log('\n🔄 Fetching Live Data (action=getAll)...');
  const syncData = await fetchJson(`${WEBHOOK_URL}?action=getAll`);
  console.log('Sync Response Status:', syncData.status);

  if (syncData.registrations && Array.isArray(syncData.registrations)) {
    console.log(`✅ Received ${syncData.registrations.length} live registrations from Google Sheet!`);
    console.table(syncData.registrations.slice(0, 10));

    // Connect to Supabase and sync missing profiles
    const supabaseUrl = 'https://uxuaisvdmvkircymwvdl.supabase.co';
    const supabaseKey = 'sb_publishable_M6cxghtva7ZHqMLt2-RS1w_CfYeaMTF';
    const supabase = createClient(supabaseUrl, supabaseKey);

    let syncedCount = 0;
    for (const reg of syncData.registrations) {
      if (!reg.email) continue;
      const { data: existing } = await supabase.from('profiles').select('id').eq('email', reg.email).maybeSingle();
      if (!existing) {
        const username = reg.email.split('@')[0] + '_' + Math.floor(1000 + Math.random() * 9000);
        const { error } = await supabase.from('profiles').insert([{
          email: reg.email,
          full_name: reg.fullname || 'Learner',
          username: username,
          role: reg.role === 'Teacher' ? 'EDUCATOR' : 'LEARNER'
        }]);
        if (!error) syncedCount++;
      }
    }
    console.log(`\n🎉 Successfully synced ${syncedCount} new profiles into Supabase database!`);
  } else {
    console.log('\nℹ️ Live Google Sheet Webhook is running code version v4.1.');
    console.log('To enable 1-click automatic JSON data download directly from the Google Sheet API, update your Google Apps Script code to version v4.2 in Google Apps Script editor.');
  }
}

runSync();
