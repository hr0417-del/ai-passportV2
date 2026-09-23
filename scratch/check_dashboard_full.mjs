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

async function runCheck() {
  const dashUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent('Dashboard')}`;
  const liveUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent('20 sept live')}`;

  const dashRes = await fetchUrl(dashUrl);
  const liveRes = await fetchUrl(liveUrl);

  const dashRows = parseCsv(dashRes.body);
  const liveRows = parseCsv(liveRes.body);

  console.log(`=== DASHBOARD DATA CHECK ===`);
  console.log(`Total rows in Dashboard tab: ${dashRows.length} (Header + ${dashRows.length - 1} data rows)`);
  console.log(`Total rows in 20 sept live tab: ${liveRows.length} (Header + ${liveRows.length - 1} data rows)`);
  
  console.log('\n--- DASHBOARD HEADER ---');
  console.log(dashRows[0]);

  console.log('\n--- LATEST 15 REGISTRATIONS IN DASHBOARD ---');
  const latestDash = dashRows.slice(Math.max(1, dashRows.length - 15));
  latestDash.forEach((r, idx) => {
    console.log(`${dashRows.length - 15 + idx}. Timestamp: "${r[0]}" | Name: "${r[1]}" | Mobile: "${r[3]}" | Email: "${r[2]}" | PassportID: "${r[7] || r[6] || ''}"`);
  });

  // Let's check sync status
  const liveEmails = new Set(liveRows.slice(1).map(r => r[2]?.toLowerCase().trim()));
  const liveMobiles = new Set(liveRows.slice(1).map(r => r[3]?.replace(/\D/g, '').slice(-10)));

  const missingInLive = [];
  dashRows.slice(1).forEach((r, idx) => {
    const email = r[2]?.toLowerCase().trim();
    const mobile = r[3]?.replace(/\D/g, '').slice(-10);
    if (!liveEmails.has(email) && (!mobile || !liveMobiles.has(mobile))) {
      missingInLive.push({ index: idx + 1, row: r });
    }
  });

  console.log(`\n--- SYNC COMPARISON ---`);
  console.log(`Entries in Dashboard missing from 20 sept live: ${missingInLive.length}`);
  if (missingInLive.length > 0) {
    missingInLive.forEach(m => console.log(`Missing Row ${m.index}:`, m.row));
  } else {
    console.log(`✅ 100% SYNCED! All entries in Dashboard exist in 20 sept live tab.`);
  }
}

runCheck().catch(console.error);
