import fs from 'fs';
import https from 'https';

const SHEET_ID = '1WH3-GLtOS3pS3X4tUruX24SXGX9v9cLtskZQ92SVnto';
const NEW_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbyc6SJB1Qf0x_OjoGw6Qy6rz38aMXwotYtKERw9lPGeslwPdoGOUpURLHBNCZ_iZmB_xg/exec';

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrl(res.headers.location).then(resolve).catch(reject);
      }
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    }).on('error', reject);
  });
}

const dashboardRows = [
  { timestamp: "17/09/2026 14:14:32", fullname: "Joya Lal", email: "educoach2025@gmail.com", mobile: "9650157029", role: "School Teacher", use_case: "Lesson Planning" },
  { timestamp: "19/09/2026 10:30:41", fullname: "Rashmi Rawal", email: "rash.2567@gmail.com", mobile: "9972525115", role: "Academic Coordinator", use_case: "Lesson Planning" },
  { timestamp: "19/09/2026 10:32:17", fullname: "Kallappa Bajantri", email: "kallappabajantri7890@gmail.com", mobile: "8660879870", role: "Education / Training Professional", use_case: "AI Skills Development" },
  { timestamp: "19/09/2026 11:14:40", fullname: "SHREEPADAGOUDA PATIL", email: "shreepad591@gmail.com", mobile: "9738859591", role: "Academic Coordinator", use_case: "Content Creation" },
  { timestamp: "19/09/2026 11:56:08", fullname: "UMMUL HAIRA K A", email: "hairahussain08@gmail.com", mobile: "9746075301", role: "School Teacher", use_case: "Student Support" },
  { timestamp: "19/09/2026 13:30:07", fullname: "Manjunath y sandaraki", email: "manumanu67776@gmail.com", mobile: "7676430260", role: "School Teacher", use_case: "Content Creation" },
  { timestamp: "19/09/2026 14:56:19", fullname: "Suruchi Taneja", email: "tanejasuruchi71@gmail.com", mobile: "9810813610", role: "Principal / School Leader", use_case: "Lesson Planning" },
  { timestamp: "19/09/2026 14:57:00", fullname: "Manesh N M", email: "mnmmathsworld6@gmail.com", mobile: "7204832538", role: "School Teacher", use_case: "Student Support" },
  { timestamp: "19/09/2026 15:01:06", fullname: "Manisha Sharma", email: "manisha.Rsharma1356@gmail.com", mobile: "9675347470", role: "Education / Training Professional", use_case: "Administrative Work" },
  { timestamp: "19/09/2026 15:30:53", fullname: "Mayuresh Kamalnayan Agrawal", email: "mayureshagrawal4@gmail.com", mobile: "9981622735", role: "School Teacher", use_case: "Student Support" },
  { timestamp: "19/09/2026 15:57:16", fullname: "Heena", email: "heena527@gmail.com", mobile: "8431894987", role: "School Teacher", use_case: "AI Skills Development" },
  { timestamp: "19/09/2026 18:14:05", fullname: "Shilpi Mahendru", email: "shilpimahendru@gmail.com", mobile: "9822200786", role: "School Teacher", use_case: "Lesson Planning" },
  { timestamp: "19/09/2026 19:32:58", fullname: "Ram Sudhakar Gore", email: "ramgore2008@gmail.com", mobile: "9890851125", role: "Academic Coordinator", use_case: "AI Skills Development" }
];

async function syncDashboardEntries() {
  console.log(`Starting sync of ${dashboardRows.length} Dashboard entries into '20 sept live' tab...`);
  let addedCount = 0;
  let dupCount = 0;

  for (let i = 0; i < dashboardRows.length; i++) {
    const item = dashboardRows[i];
    const queryParams = new URLSearchParams({
      action: 'register',
      fullname: item.fullname,
      email: item.email,
      mobile: item.mobile,
      role: item.role,
      organization: item.use_case,
      source: 'Dashboard Sync',
      skipEmail: 'true'
    }).toString();

    try {
      const res = await fetchUrl(`${NEW_WEBHOOK_URL}?${queryParams}`);
      if (res.data && res.data.success) {
        addedCount++;
        console.log(`[${i+1}/${dashboardRows.length}] ✅ Added to '20 sept live': ${item.fullname} (${item.email}) -> Passport ID: ${res.data.passportId}`);
      } else if (res.data && res.data.duplicate) {
        dupCount++;
        console.log(`[${i+1}/${dashboardRows.length}] ℹ️ Already in '20 sept live': ${item.fullname} (${item.email})`);
      } else {
        console.log(`[${i+1}/${dashboardRows.length}] ⚠️ Result for ${item.fullname}:`, res.data || res.body);
      }
    } catch(err) {
      console.log(`[${i+1}/${dashboardRows.length}] ❌ Error for ${item.fullname}:`, err.message);
    }

    await new Promise(r => setTimeout(r, 300));
  }

  console.log('\n==================================================');
  console.log(`🎉 DASHBOARD SYNC COMPLETE RESULTS:`);
  console.log(`- Successfully Added to '20 sept live': ${addedCount}`);
  console.log(`- Already Present / Skipped: ${dupCount}`);
  console.log('==================================================');
}

syncDashboardEntries();
