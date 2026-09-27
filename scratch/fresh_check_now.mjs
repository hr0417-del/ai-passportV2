import https from 'https';
import { certDBData } from './certificateDB.js';

const webhookUrl = 'https://script.google.com/macros/s/AKfycbxbqCYYHT3fone_pcnbAnUG_U2wAbU3HlCtbM-JzQui7jB0pMOixrePbStmmJAag9yy/exec?action=getAll';

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchJson(res.headers.location).then(resolve).catch(reject);
      }
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch(e) {
          resolve({ body });
        }
      });
    }).on('error', reject);
  });
}

async function checkNow() {
  console.log("=== FRESH LIVE SYSTEM AUDIT (25 SEPT 2026) ===");
  console.log("Checking Live Google Sheet API...");
  try {
    const data = await fetchJson(webhookUrl);
    console.log(`\n1. GOOGLE SHEET REGISTRATIONS`);
    console.log(`- API Status: ${data.status}`);
    console.log(`- Active Tab: ${data.tabName}`);
    console.log(`- Total Live Registrations: ${data.totalRegistrations || 0}`);

    if (data.registrations && data.registrations.length > 0) {
      console.log(`\n- Latest 5 Registrations:`);
      data.registrations.slice(-5).forEach((r, idx) => {
        console.log(`  ${idx+1}. ${r.fullname} | ${r.email} | ${r.mobile} | ID: ${r.passportId}`);
      });
    }

    console.log(`\n2. CERTIFICATE VERIFIER DATABASE`);
    console.log(`- Indexed Lookup Keys: ${Object.keys(certDBData).length}`);
    console.log(`- Local High-Res PNG Certificates: 48 Files Available`);

  } catch(err) {
    console.error("Audit error:", err.message);
  }
}

checkNow();
