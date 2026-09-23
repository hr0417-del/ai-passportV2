import https from 'https';
import fs from 'fs';

const SHEET_ID = '1WH3-GLtOS3pS3X4tUruX24SXGX9v9cLtskZQ92SVnto';
const NEW_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbyc6SJB1Qf0x_OjoGw6Qy6rz38aMXwotYtKERw9lPGeslwPdoGOUpURLHBNCZ_iZmB_xg/exec';

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

// Cutoff Date: 14/09/2026 16:55:46
// DD/MM/YYYY HH:mm:ss format parsing
function parseCustomTimestamp(str) {
  if (!str) return null;
  // Format: "14/09/2026 16:55:46" or "2026-09-14T..."
  const match = str.match(/(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})/);
  if (match) {
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1; // 0-indexed
    const year = parseInt(match[3], 10);
    const hour = parseInt(match[4], 10);
    const min = parseInt(match[5], 10);
    const sec = parseInt(match[6], 10);
    return new Date(year, month, day, hour, min, sec);
  }
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

const CUTOFF_DATE = new Date(2026, 8, 14, 16, 55, 46); // Sept 14, 2026 16:55:46 IST

async function main() {
  console.log('Fetching Dashboard/Master sheet data...');
  console.log('Target Cutoff Filter: AFTER 14/09/2026 16:55:46');

  // Load Dashboard / main tab (gid=0 or Sheet1)
  const masterRes = await fetchUrl(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=0`);
  const masterRows = parseCsv(masterRes.body);

  // Load 20 sept live tab
  const sept20Res = await fetchUrl(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent('20 sept live')}`);
  const sept20Rows = parseCsv(sept20Res.body);

  const sept20Emails = new Set();
  for (let i = 1; i < sept20Rows.length; i++) {
    const email = (sept20Rows[i][2] || sept20Rows[i][3] || '').toLowerCase().trim();
    if (email) sept20Emails.add(email);
  }

  console.log(`Loaded Dashboard/Master: ${masterRows.length - 1} rows`);
  console.log(`Loaded '20 sept live' tab: ${sept20Rows.length - 1} rows (Unique emails: ${sept20Emails.size})`);

  const matchingCandidates = [];
  const missingFromSept20 = [];

  for (let i = 1; i < masterRows.length; i++) {
    const r = masterRows[i];
    if (!r || r.length < 3) continue;

    const rawTimestamp = r[0];
    const passportId = r[1];
    const fullname = r[2];
    const email = (r[3] || '').toLowerCase().trim();
    const mobile = (r[4] || '').trim();
    const role = r[5] || 'School Teacher';
    const use_case = r[6] || '';
    const profession = r[7] || '';
    const city = r[8] || '';

    const dateObj = parseCustomTimestamp(rawTimestamp);

    if (dateObj && dateObj > CUTOFF_DATE) {
      matchingCandidates.push({ rawTimestamp, dateObj, passportId, fullname, email, mobile, role, use_case, profession, city });
      if (email && email.includes('@') && !sept20Emails.has(email)) {
        missingFromSept20.push({ rawTimestamp, passportId, fullname, email, mobile, role, use_case, profession, city });
      }
    }
  }

  console.log('\n==================================================');
  console.log(`TOTAL REGISTRATIONS AFTER 14/09/2026 16:55:46 IN DASHBOARD: ${matchingCandidates.length}`);
  console.log(`TOTAL MISSING FROM '20 sept live' TAB: ${missingFromSept20.length}`);
  console.log('==================================================\n');

  if (matchingCandidates.length > 0) {
    console.log('All Registrations After Cutoff Date (14/09/2026 16:55:46):');
    console.table(matchingCandidates);
  } else {
    console.log('No registrations found strictly after 14/09/2026 16:55:46 in Dashboard.');
  }

  if (missingFromSept20.length > 0) {
    console.log('\nMissing Candidates to Populate into 20 sept live:');
    console.table(missingFromSept20);

    // Populate missing candidates into '20 sept live' tab
    console.log('\nPopulating missing candidates into 20 sept live tab...');
    for (let i = 0; i < missingFromSept20.length; i++) {
      const item = missingFromSept20[i];
      const queryParams = new URLSearchParams({
        action: 'register',
        fullname: item.fullname,
        email: item.email,
        mobile: item.mobile,
        role: item.role,
        organization: item.use_case,
        profession: item.profession,
        city: item.city,
        source: 'Cutoff Sync (Post Sept 14)',
        skipEmail: 'true'
      }).toString();

      const res = await fetchUrl(`${NEW_WEBHOOK_URL}?${queryParams}`);
      if (res.data && res.data.success) {
        console.log(`✅ Appended: ${item.fullname} (${item.email}) -> ${res.data.passportId}`);
      } else {
        console.log(`ℹ️ Result for ${item.fullname}:`, res.data || res.body);
      }
    }
  }
}

main();
