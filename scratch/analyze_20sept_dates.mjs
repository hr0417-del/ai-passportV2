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
  // Format could be "17/09/2026 14:14:32" or ISO "2026-09-17..."
  const match = tsStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{1,2}):(\d{1,2})/);
  if (match) {
    const [_, d, m, y, hh, mm, ss] = match;
    return new Date(parseInt(y), parseInt(m) - 1, parseInt(d), parseInt(hh), parseInt(mm), parseInt(ss));
  }
  const isoDate = new Date(tsStr);
  if (!isNaN(isoDate.getTime())) return isoDate;
  return null;
}

async function analyze20SeptDates() {
  const liveUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent('20 sept live')}`;
  const res = await fetchUrl(liveUrl);
  const rows = parseCsv(res.body);

  const cutoff = new Date(2026, 8, 14, 16, 55, 46); // 14 Sept 2026 16:55:46 IST

  console.log(`=== ANALYZING DATES IN '20 sept live' TAB ===`);
  console.log(`Cutoff Date: 14/09/2026 16:55:46`);
  console.log(`Total Rows in Tab: ${rows.length - 1}`);

  let beforeCutoff = 0;
  let afterCutoff = 0;
  let invalidTimestamp = 0;

  const beforeCutoffRows = [];
  const afterCutoffRows = [];

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const tsStr = r[0];
    const dt = parseTimestamp(tsStr);

    if (!dt) {
      invalidTimestamp++;
      afterCutoffRows.push({ rowNum: i + 1, data: r, reason: 'Invalid / Missing Timestamp (Keep)' });
      continue;
    }

    if (dt < cutoff) {
      beforeCutoff++;
      beforeCutoffRows.push({ rowNum: i + 1, ts: tsStr, name: r[1], email: r[2] });
    } else {
      afterCutoff++;
      afterCutoffRows.push({ rowNum: i + 1, ts: tsStr, name: r[1], email: r[2] });
    }
  }

  console.log(`\nBefore Cutoff (< 14/09/2026 16:55:46): ${beforeCutoff}`);
  console.log(`After Cutoff (>= 14/09/2026 16:55:46): ${afterCutoff}`);
  console.log(`Invalid / Unparseable Timestamp: ${invalidTimestamp}`);

  if (beforeCutoff > 0) {
    console.log('\n--- SAMPLE BEFORE CUTOFF ROWS TO REMOVE ---');
    console.table(beforeCutoffRows.slice(0, 10));
  }
}

analyze20SeptDates().catch(console.error);
