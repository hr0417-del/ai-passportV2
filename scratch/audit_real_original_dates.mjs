import https from 'https';

const SHEET_ID = '1WH3-GLtOS3pS3X4tUruX24SXGX9v9cLtskZQ92SVnto';

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

function parseCsv(csvText) {
  const lines = csvText.split('\n').filter(l => l.trim().length > 0);
  const rows = [];
  for (const line of lines) {
    const row = [];
    let inQuotes = false;
    let cur = '';
    for (const c of line) {
      if (c === '"') inQuotes = !inQuotes;
      else if (c === ',' && !inQuotes) { row.push(cur.trim()); cur = ''; }
      else cur += c;
    }
    row.push(cur.trim());
    rows.push(row);
  }
  return rows;
}

async function auditRealDates() {
  const liveUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent('20 sept live')}`;
  const sheet1Url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent('Sheet1')}`;

  const liveRes = await fetchUrl(liveUrl);
  const sheet1Res = await fetchUrl(sheet1Url);

  const liveRows = parseCsv(liveRes.body);
  const sheet1Rows = parseCsv(sheet1Res.body);

  console.log("=== ORIGINAL '20 sept live' TAB ROWS (Before bulk push rows) ===");
  // Rows 2 to 106 in '20 sept live' were the authentic entries for 20 Sept live workshop!
  const originalLiveRows = liveRows.slice(1, 106);
  console.log(`Original Live Tab Registrations count: ${originalLiveRows.length}`);

  const originalEmails = new Set(originalLiveRows.map(r => r[2]?.toLowerCase().trim()).filter(Boolean));
  const originalMobiles = new Set(originalLiveRows.map(r => r[3]?.replace(/\D/g, '').slice(-10)).filter(Boolean));

  console.log(`Unique Emails in Original Live Cohort: ${originalEmails.size}`);
  console.log(`Unique Mobiles in Original Live Cohort: ${originalMobiles.size}`);

  console.log("\nFirst 3 Registrants in Original Live Cohort:");
  originalLiveRows.slice(0, 3).forEach(r => console.log(`- Date: ${r[0]} | Name: ${r[1]} | Email: ${r[2]} | ID: ${r[7]}`));

  console.log("\nLast 5 Registrants in Original Live Cohort:");
  originalLiveRows.slice(-5).forEach(r => console.log(`- Date: ${r[0]} | Name: ${r[1]} | Email: ${r[2]} | ID: ${r[7]}`));
}

auditRealDates().catch(console.error);
