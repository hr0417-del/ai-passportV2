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

async function breakdown() {
  const dashUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent('Dashboard')}`;
  const res = await fetchUrl(dashUrl);
  const rows = parseCsv(res.body);

  const dataRows = rows.slice(1);
  const dateCounts = {};
  dataRows.forEach(r => {
    const ts = r[0] || '';
    const datePart = ts.split(' ')[0] || 'Unknown';
    dateCounts[datePart] = (dateCounts[datePart] || 0) + 1;
  });

  console.log('=== DASHBOARD REGISTRATION STATS ===');
  console.log(`Total Registrations in Dashboard: ${dataRows.length}`);
  console.log('Breakdown by Date:');
  console.table(dateCounts);
}

breakdown().catch(console.error);
