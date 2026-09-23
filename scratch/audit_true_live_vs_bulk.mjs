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

function extractEmail(row) {
  for (const cell of row) {
    if (typeof cell === 'string' && cell.includes('@') && cell.includes('.')) {
      const match = cell.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (match) return match[0].toLowerCase();
    }
  }
  return null;
}

function extractName(row) {
  for (let i = 1; i < row.length; i++) {
    const val = (row[i] || '').trim();
    if (!val) continue;
    if (val.startsWith('AIP-')) continue;
    if (val.includes('@')) continue;
    if (/^\+?\d+$/.test(val.replace(/[\s-]/g, ''))) continue;
    if (val.length > 2) return val;
  }
  return 'N/A';
}

async function audit() {
  const liveUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent('20 sept live')}`;
  const res = await fetchUrl(liveUrl);
  const rows = parseCsv(res.body);

  const cleanUsers = [];
  const uniqueEmails = new Set();

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const email = extractEmail(r);
    const name = extractName(r);

    if (name === 'AI PASSPORT REGISTRATIONS | EXECUTIVE DASHBOARD' ||
        name === 'FILTER BY COHORT' ||
        name === 'All Roles' ||
        name === 'PARTICIPANT DIRECTORY & COHORT DRILL-DOWN' ||
        name === 'AI Passport ID' ||
        name === 'N/A') {
      continue;
    }

    if (email) {
      uniqueEmails.add(email);
      cleanUsers.push({ row: i + 1, name, email });
    }
  }

  console.log("==================================================");
  console.log(`📊 TOTAL VALID USER REGISTRATIONS IN TAB: ${cleanUsers.length}`);
  console.log(`📧 TOTAL UNIQUE VERIFIED EMAIL ADDRESSES: ${uniqueEmails.size}`);
  console.log("==================================================");

  console.log("\nFirst 5 Valid Users:");
  console.table(cleanUsers.slice(0, 5));

  console.log("\nLast 5 Valid Users:");
  console.table(cleanUsers.slice(-5));
}

audit().catch(console.error);
