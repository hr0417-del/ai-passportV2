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

async function printTimestamps() {
  const liveUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent('20 sept live')}`;
  const dashUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent('Dashboard')}`;

  const liveRes = await fetchUrl(liveUrl);
  const dashRes = await fetchUrl(dashUrl);

  const liveRows = parseCsv(liveRes.body);
  const dashRows = parseCsv(dashRes.body);

  console.log("--- FIRST 20 TIMESTAMPS IN 20 SEPT LIVE TAB ---");
  liveRows.slice(1, 20).forEach((r, idx) => {
    console.log(`Row ${idx + 2}: TS="${r[0]}", Name="${r[1]}", Email="${r[2]}"`);
  });

  console.log("\n--- FIRST 20 TIMESTAMPS IN DASHBOARD TAB ---");
  dashRows.slice(1, 20).forEach((r, idx) => {
    console.log(`Row ${idx + 2}: TS="${r[0]}", Name="${r[1]}", Email="${r[2]}"`);
  });
}

printTimestamps().catch(console.error);
