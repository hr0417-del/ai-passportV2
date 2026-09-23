import fs from 'fs';
import https from 'https';

const NEW_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbyc6SJB1Qf0x_OjoGw6Qy6rz38aMXwotYtKERw9lPGeslwPdoGOUpURLHBNCZ_iZmB_xg/exec';

const missingList = JSON.parse(fs.readFileSync('scratch/missing_registrants.json', 'utf8'));

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrl(res.headers.location).then(resolve).catch(reject);
      }
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch(e) {
          resolve({ status: res.statusCode, body });
        }
      });
    }).on('error', reject);
  });
}

async function syncAllMissing() {
  console.log(`Starting 1-click sync of ${missingList.length} missing registrants into Active Google Sheet...`);
  let successCount = 0;
  let duplicateCount = 0;
  let failCount = 0;

  for (let i = 0; i < missingList.length; i++) {
    const item = missingList[i];
    
    // Clean phone number format
    let cleanMobile = (item.mobile || '').replace(/[^0-9]/g, '');
    if (cleanMobile.startsWith('91') && cleanMobile.length === 12) {
      cleanMobile = cleanMobile.substring(2);
    }
    
    const queryParams = new URLSearchParams({
      action: 'register',
      fullname: item.fullname || 'Citizen Builder',
      email: item.email || '',
      mobile: cleanMobile,
      role: item.role || 'School Teacher',
      organization: item.organization || '',
      city: item.city || '',
      source: 'Restored Backup Sync'
    }).toString();

    try {
      const res = await fetchUrl(`${NEW_WEBHOOK_URL}?${queryParams}`);
      if (res.data && res.data.success) {
        successCount++;
        console.log(`[${i+1}/${missingList.length}] ✅ Added: ${item.fullname} (${item.email}) -> Passport ID: ${res.data.passportId}`);
      } else if (res.data && res.data.duplicate) {
        duplicateCount++;
        console.log(`[${i+1}/${missingList.length}] ℹ️ Already in sheet: ${item.fullname} (${item.email})`);
      } else {
        failCount++;
        console.log(`[${i+1}/${missingList.length}] ⚠️ Error response for ${item.fullname}:`, res.data || res.body);
      }
    } catch(err) {
      failCount++;
      console.log(`[${i+1}/${missingList.length}] ❌ Network error for ${item.fullname}:`, err.message);
    }

    // Small delay to be polite to Google Apps Script API rate limits
    await new Promise(r => setTimeout(r, 400));
  }

  console.log('\n==================================================');
  console.log('🎉 SYNC COMPLETE RESULTS:');
  console.log(`- Successfully Appended: ${successCount}`);
  console.log(`- Already Present / Skipped: ${duplicateCount}`);
  console.log(`- Failed: ${failCount}`);
  console.log('==================================================');
}

syncAllMissing();
