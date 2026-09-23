import https from 'https';
import fs from 'fs';

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

async function main() {
  console.log('Comparing Sheet1 (326 rows) vs 20 sept live tab (93 rows)...');

  // Load Sheet1
  const sheet1Res = await fetchUrl(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent('Sheet1')}`);
  const sheet1Rows = parseCsv(sheet1Res.body);

  // Load 20 sept live
  const sept20Res = await fetchUrl(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent('20 sept live')}`);
  const sept20Rows = parseCsv(sept20Res.body);

  const sept20Emails = new Set();
  const sept20Mobiles = new Set();

  for (let i = 1; i < sept20Rows.length; i++) {
    const r = sept20Rows[i];
    const email = (r[2] || r[3] || '').toLowerCase();
    const mobile = (r[3] || r[4] || '').replace(/[^0-9]/g, '');
    if (email && email.includes('@')) sept20Emails.add(email);
    if (mobile && mobile.length >= 8) sept20Mobiles.add(mobile);
  }

  console.log(`'20 sept live' Unique Emails: ${sept20Emails.size}`);
  console.log(`Sheet1 Total Rows: ${sheet1Rows.length - 1}`);

  const missingInSept20 = [];

  for (let i = 1; i < sheet1Rows.length; i++) {
    const r = sheet1Rows[i];
    if (!r || r.length < 3) continue;

    // Sheet1 col order: [0] Timestamp, [1] Passport ID, [2] Full Name, [3] Email, [4] Mobile, [5] Role, [6] Org, [7] Profession, [8] City
    const timestamp = r[0];
    const passportId = r[1];
    const fullname = r[2];
    const email = (r[3] || '').toLowerCase();
    const mobile = (r[4] || '').replace(/[^0-9]/g, '');
    const role = r[5] || 'School Teacher';
    const use_case = r[6] || '';
    const profession = r[7] || '';
    const city = r[8] || '';

    if (email && email.includes('@') && !sept20Emails.has(email)) {
      missingInSept20.push({
        timestamp,
        passportId,
        fullname,
        email,
        mobile: r[4] || '',
        role,
        use_case,
        profession,
        city
      });
    }
  }

  console.log(`\n==================================================`);
  console.log(`TOTAL REGISTRANTS IN SHEET1 MISSING FROM '20 sept live': ${missingInSept20.length}`);
  console.log(`==================================================\n`);

  if (missingInSept20.length > 0) {
    console.log('Sample Missing Registrants (First 5):');
    console.table(missingInSept20.slice(0, 5));
    console.log('\nSample Latest Missing Registrants (Last 5):');
    console.table(missingInSept20.slice(-5));

    fs.writeFileSync('scratch/missing_sheet1_entries.json', JSON.stringify(missingInSept20, null, 2));
  }
}

main();
