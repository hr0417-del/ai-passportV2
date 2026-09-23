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

async function inspectAllTabs() {
  const tabs = ['Dashboard', '20 sept live', 'Sheet1', 'Registrations'];
  for (const tab of tabs) {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tab)}`;
    const res = await fetchUrl(url);
    if (res.status === 200 && res.body && !res.body.includes('<!DOCTYPE html>')) {
      const rows = parseCsv(res.body);
      console.log(`Tab "${tab}": ${rows.length} total rows (${rows.length - 1} data entries)`);
    } else {
      console.log(`Tab "${tab}": Not found or error (${res.status})`);
    }
  }
}

inspectAllTabs().catch(console.error);
