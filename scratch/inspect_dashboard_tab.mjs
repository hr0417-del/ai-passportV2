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

async function inspectDashboardTab() {
  console.log('Fetching exact "Dashboard" tab data from active Google Sheet...');

  const dashboardNames = ['Dashboard', 'dashboard', 'DASHBOARD'];
  let foundData = null;

  for (const name of dashboardNames) {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(name)}`;
    const res = await fetchUrl(url);
    if (res.status === 200 && res.body && !res.body.includes('<!DOCTYPE html>')) {
      const rows = parseCsv(res.body);
      console.log(`✅ Loaded Tab "${name}": ${rows.length} total rows (including header)`);
      foundData = rows;
      break;
    }
  }

  if (foundData) {
    console.log('\n--- ALL ROWS IN DASHBOARD TAB ---');
    console.table(foundData);
    fs.writeFileSync('scratch/dashboard_tab_data.json', JSON.stringify(foundData, null, 2));
  } else {
    console.log('❌ Could not find tab named "Dashboard".');
  }
}

inspectDashboardTab();
