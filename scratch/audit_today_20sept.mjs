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

async function runAudit() {
  console.log('=== AI PASSPORT™ REGISTRATION AUDIT FOR 20TH SEPT 2026 ===\n');

  // Fetch '20 sept live'
  const url20 = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent('20 sept live')}`;
  const res20 = await fetchUrl(url20);
  const rows20 = parseCsv(res20.body);
  const header20 = rows20[0] || [];
  const data20 = rows20.slice(1);

  // Fetch 'Sheet1'
  const url1 = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent('Sheet1')}`;
  const res1 = await fetchUrl(url1);
  const rows1 = parseCsv(res1.body);
  const header1 = rows1[0] || [];
  const data1 = rows1.slice(1);

  console.log(`- '20 sept live' tab: ${data20.length} rows`);
  console.log(`- 'Sheet1' (Master) tab: ${data1.length} rows`);

  // Analyze timestamps in '20 sept live'
  let countSept20 = 0;
  let countPrior = 0;
  const sept20Entries = [];

  for (const row of data20) {
    const timestamp = row[0] || '';
    const name = row[1] || '';
    const email = row[2] || '';
    const phone = row[3] || '';
    const passportId = row[7] || '';

    if (timestamp.includes('20/09/2026') || timestamp.includes('2026-09-20') || timestamp.includes('Sep 20, 2026') || timestamp.includes('20 Sept')) {
      countSept20++;
      sept20Entries.push({ timestamp, name, email, phone, passportId });
    } else {
      countPrior++;
    }
  }

  // Deduplicate all emails/phones across both tabs
  const allUniqueEmails = new Set();
  const allUniquePhones = new Set();
  const allUniquePassportIds = new Set();

  [...data20, ...data1].forEach(row => {
    const email = (row[2] || '').toLowerCase().trim();
    const phone = (row[3] || '').trim();
    const pid = (row[7] || row[8] || '').trim();

    if (email && email.includes('@')) allUniqueEmails.add(email);
    if (phone && phone.length >= 7) allUniquePhones.add(phone);
    if (pid && pid.startsWith('AIP-')) allUniquePassportIds.add(pid);
  });

  console.log('\n==================================================');
  console.log(`📊 TOTAL REGISTRATIONS SUMMARY (AS OF 20TH SEPT 2026):`);
  console.log(`- Dedicated '20 sept live' Tab Total: ${data20.length}`);
  console.log(`- Master Sheet (Sheet1) Total: ${data1.length}`);
  console.log(`- Registrations Dated 20th Sept 2026 in Live Tab: ${countSept20}`);
  console.log(`- Unique Email Addresses Registered: ${allUniqueEmails.size}`);
  console.log(`- Unique Mobile Numbers Registered: ${allUniquePhones.size}`);
  console.log(`- Unique Issued Passport IDs: ${allUniquePassportIds.size}`);
  console.log('==================================================\n');

  console.log('Latest Registrants Submitted on 20th Sept 2026:');
  sept20Entries.slice(-10).forEach((entry, idx) => {
    console.log(`${idx + 1}. [${entry.timestamp}] ${entry.name} | ${entry.email} | Phone: ${entry.phone} | ID: ${entry.passportId}`);
  });
}

runAudit().catch(console.error);
