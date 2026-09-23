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

async function checkEmails() {
  const liveUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent('20 sept live')}`;
  const res = await fetchUrl(liveUrl);
  const rows = parseCsv(res.body);

  const cutoff = new Date(2026, 8, 14, 16, 55, 46); // 14 Sept 2026 16:55:46 IST

  console.log(`=== REGISTRATIONS AFTER 14/09/2026 16:55:46 ===`);
  console.log(`Total raw data rows in '20 sept live': ${rows.length - 1}`);

  const postCutoffEntries = [];
  const uniqueEmails = new Set();
  const duplicateEmails = [];
  const missingEmails = [];

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    const tsStr = r[0];
    const name = r[1]?.trim();
    const email = r[2]?.trim().toLowerCase();
    const mobile = r[3]?.trim();
    const passportId = r[7]?.trim();

    if (!name && !email && !mobile) continue;

    const dt = parseTimestamp(tsStr);
    if (!dt || dt >= cutoff) {
      postCutoffEntries.push({ rowNum: i + 1, ts: tsStr, name, email, mobile, passportId });

      if (email) {
        if (uniqueEmails.has(email)) {
          duplicateEmails.push({ name, email });
        } else {
          uniqueEmails.add(email);
        }
      } else {
        missingEmails.push({ name, mobile });
      }
    }
  }

  console.log(`\n✅ Total Post-Cutoff Registrations: ${postCutoffEntries.length}`);
  console.log(`📧 Total Unique Email Addresses: ${uniqueEmails.size}`);
  console.log(`⚠️ Registrations missing Email: ${missingEmails.length}`);
  console.log(`🔁 Duplicate Email Registrations: ${duplicateEmails.length}`);

  console.log('\n--- LATEST 10 REGISTRATIONS ---');
  postCutoffEntries.slice(-10).forEach(e => {
    console.log(`Passport ID: ${e.passportId || 'N/A'} | Date: ${e.ts} | Name: ${e.name} | Email: ${e.email || 'NO EMAIL'}`);
  });
}

checkEmails().catch(console.error);
