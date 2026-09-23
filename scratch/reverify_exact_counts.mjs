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

async function reverifyAll() {
  console.log("=== GRANULAR RE-VERIFICATION OF SPREADSHEET TABS ===");

  const liveUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent('20 sept live')}`;
  const dashUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent('Dashboard')}`;

  const liveRes = await fetchUrl(liveUrl);
  const dashRes = await fetchUrl(dashUrl);

  const liveRows = parseCsv(liveRes.body);
  const dashRows = parseCsv(dashRes.body);

  console.log(`\n1. '20 sept live' Tab Total Raw Rows: ${liveRows.length} (Header + ${liveRows.length - 1} entries)`);
  console.log(`2. 'Dashboard' Tab Total Raw Rows: ${dashRows.length} (Header + ${dashRows.length - 1} entries)`);

  const cutoff = new Date(2026, 8, 14, 16, 55, 46); // 14/09/2026 16:55:46 IST

  let countDirectSubmissions = 0; // Original rows submitted to 20 sept live
  let countDashboardSynced = 0;   // Rows synced from Dashboard tab
  let countBeforeCutoff = 0;
  let countAfterCutoff = 0;

  const emailSet = new Set();
  const phoneSet = new Set();

  liveRows.slice(1).forEach((r, idx) => {
    const rowNum = idx + 2;
    const tsStr = r[0];
    const dt = parseTimestamp(tsStr);
    const source = r[9] || r[8] || '';

    if (source.includes('Dashboard Sync')) {
      countDashboardSynced++;
    } else {
      countDirectSubmissions++;
    }

    if (dt) {
      if (dt < cutoff) {
        countBeforeCutoff++;
      } else {
        countAfterCutoff++;
      }
    }

    const email = extractEmail(r);
    if (email) emailSet.add(email);

    for (const cell of r) {
      if (typeof cell === 'string') {
        const digits = cell.replace(/\D/g, '');
        if (digits.length === 10 && /^[6789]/.test(digits)) {
          phoneSet.add(digits);
        }
      }
    }
  });

  console.log(`\n--- BREAKDOWN OF 20 SEPT LIVE TAB ---`);
  console.log(`Direct Website Submissions: ${countDirectSubmissions}`);
  console.log(`Synced from Dashboard: ${countDashboardSynced}`);
  console.log(`Entries Before Cutoff (< 14/09/2026 16:55:46): ${countBeforeCutoff}`);
  console.log(`Entries On/After Cutoff (>= 14/09/2026 16:55:46): ${countAfterCutoff}`);
  console.log(`Unique Email Addresses Found: ${emailSet.size}`);
  console.log(`Unique Mobile Numbers Found: ${phoneSet.size}`);

  console.log(`\n--- INSPECTING ROWS 90 TO 115 IN 20 SEPT LIVE ---`);
  liveRows.slice(89, 115).forEach((r, idx) => {
    console.log(`Row ${90 + idx}: TS="${r[0]}", Name="${r[1]}", Email="${r[2]}", Source="${r[9]}"`);
  });
}

reverifyAll().catch(console.error);
