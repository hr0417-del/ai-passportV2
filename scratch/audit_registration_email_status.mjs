import https from 'https';

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

async function runAudit() {
  console.log("Checking live registration & email status from Google Sheet API...");
  try {
    const data = await fetchJson(webhookUrl);
    console.log(`\n=== LIVE REGISTRATION EMAIL STATUS REPORT ===`);
    console.log(`API Status: ${data.status}`);
    console.log(`Tab Name: ${data.tabName}`);
    console.log(`Total Registrations Found: ${data.totalRegistrations || 0}`);

    if (data.registrations && data.registrations.length > 0) {
      console.log(`\n--- LATEST 10 REGISTRATIONS ---`);
      data.registrations.slice(-10).forEach((r, idx) => {
        console.log(`${idx+1}. Name: ${r.fullname} | Email: ${r.email} | Phone: ${r.mobile} | Passport ID: ${r.passportId}`);
      });
    }
  } catch(err) {
    console.error("Audit error:", err.message);
  }
}

runAudit();
