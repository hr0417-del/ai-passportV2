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

function parseTimestamp(tsStr) {
  if (!tsStr) return null;
  const match = tsStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{1,2}):(\d{1,2})/);
  if (match) {
    const [_, d, m, y, hh, mm, ss] = match;
    return new Date(parseInt(y), parseInt(m) - 1, parseInt(d), parseInt(hh), parseInt(mm), parseInt(ss));
  }
  const isoDate = new Date(tsStr);
  if (!isNaN(isoDate.getTime())) return isoDate;
  return null;
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

function extractPassportId(row) {
  for (const cell of row) {
    if (typeof cell === 'string' && cell.startsWith('AIP-2026-')) return cell;
  }
  return 'N/A';
}

async function analyzeAllEmails() {
  const liveUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent('20 sept live')}`;
  const res = await fetchUrl(liveUrl);
  const rows = parseCsv(res.body);

  const cutoff = new Date(2026, 8, 14, 16, 55, 46);

  let totalPostCutoff = 0;
  const uniqueEmails = new Set();
  const missingEmailRows = [];

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const tsStr = r[0];
    const dt = parseTimestamp(tsStr);

    if (!dt || dt >= cutoff) {
      totalPostCutoff++;
      const email = extractEmail(r);
      const name = extractName(r);
      const pid = extractPassportId(r);

      if (email) {
        uniqueEmails.add(email);
      } else {
        missingEmailRows.push({ row: i + 1, name, pid, data: r });
      }
    }
  }

  console.log("==================================================");
  console.log(`📊 TOTAL REGISTRATIONS FROM 14/09/2026 16:55:46: ${totalPostCutoff}`);
  console.log(`📧 TOTAL UNIQUE EMAIL ADDRESSES VERIFIED: ${uniqueEmails.size}`);
  console.log(`⚠️ REGISTRATIONS MISSING EMAIL: ${missingEmailRows.length}`);
  console.log("==================================================");

  if (missingEmailRows.length > 0) {
    console.log("\n--- REGISTRATIONS WITHOUT EMAIL ---");
    console.table(missingEmailRows);
  }
}

analyzeAllEmails().catch(console.error);
