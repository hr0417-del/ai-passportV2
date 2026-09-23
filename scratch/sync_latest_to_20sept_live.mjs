import fs from 'fs';
import https from 'https';

const NEW_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbyc6SJB1Qf0x_OjoGw6Qy6rz38aMXwotYtKERw9lPGeslwPdoGOUpURLHBNCZ_iZmB_xg/exec';

const missingList = JSON.parse(fs.readFileSync('scratch/missing_sheet1_entries.json', 'utf8'));

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

async function syncMissingToSept20Tab() {
  console.log(`Starting high-speed automated sync of ${missingList.length} registrants into '20 sept live' tab...`);
  
  let successCount = 0;
  let duplicateCount = 0;
  let failCount = 0;

  for (let i = 0; i < missingList.length; i++) {
    const item = missingList[i];

    if (!item.email || !item.email.includes('@')) continue;

    let cleanMobile = (item.mobile || '').replace(/[^0-9]/g, '');

    const queryParams = new URLSearchParams({
      action: 'register',
      fullname: item.fullname || 'Citizen Builder',
      email: item.email || '',
      mobile: cleanMobile,
      role: item.role || 'School Teacher',
      organization: item.use_case || '',
      profession: item.profession || '',
      city: item.city || '',
      source: 'Sheet1 Sync',
      skipEmail: 'true'
    }).toString();

    try {
      const res = await fetchUrl(`${NEW_WEBHOOK_URL}?${queryParams}`);
      if (res.data && res.data.success) {
        successCount++;
        console.log(`[${i+1}/${missingList.length}] ✅ Appended: ${item.fullname} (${item.email}) -> ${res.data.passportId}`);
      } else if (res.data && res.data.duplicate) {
        duplicateCount++;
        console.log(`[${i+1}/${missingList.length}] ℹ️ Already present: ${item.fullname} (${item.email})`);
      } else {
        failCount++;
        console.log(`[${i+1}/${missingList.length}] ⚠️ Response for ${item.fullname}:`, res.data || res.body);
      }
    } catch(err) {
      failCount++;
      console.log(`[${i+1}/${missingList.length}] ❌ Error for ${item.fullname}:`, err.message);
    }

    // Politeness delay
    await new Promise(r => setTimeout(r, 200));
  }

  console.log('\n==================================================');
  console.log('🎉 SYNC COMPLETE RESULTS:');
  console.log(`- Successfully Appended to '20 sept live' tab: ${successCount}`);
  console.log(`- Already Present / Skipped: ${duplicateCount}`);
  console.log(`- Failed: ${failCount}`);
  console.log('==================================================');
}

syncMissingToSept20Tab();
