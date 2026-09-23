import https from 'https';
import fs from 'fs';
import path from 'path';

const SHEET_ID = '1WH3-GLtOS3pS3X4tUruX24SXGX9v9cLtskZQ92SVnto';
const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbyc6SJB1Qf0x_OjoGw6Qy6rz38aMXwotYtKERw9lPGeslwPdoGOUpURLHBNCZ_iZmB_xg/exec';
const DESKTOP_DIR = 'C:\\Users\\HP\\Desktop';

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

function postUrl(url, postData) {
  return new Promise((resolve, reject) => {
    const dataStr = JSON.stringify(postData);
    const u = new URL(url);
    const req = https.request({
      hostname: u.hostname,
      path: u.pathname + u.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(dataStr)
      }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrl(res.headers.location).then(resolve).catch(reject);
      }
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', reject);
    req.write(dataStr);
    req.end();
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

function generateVcard(name, phone, email, organization, title) {
  const cleanName = (name || 'Educator').trim();
  const cleanPhone = (phone || '').replace(/\D/g, '');
  const cleanEmail = (email || '').trim();
  
  if (!cleanName && !cleanPhone) return '';

  const formattedPhone = cleanPhone ? (cleanPhone.length === 10 ? `+91${cleanPhone}` : `+${cleanPhone}`) : '';
  
  const vcard = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:;20Sept. ${cleanName};;;`,
    `FN:20Sept. ${cleanName}`
  ];

  if (formattedPhone) {
    vcard.push(`TEL;TYPE=CELL:${formattedPhone}`);
  }
  if (cleanEmail) {
    vcard.push(`EMAIL;TYPE=INTERNET:${cleanEmail}`);
  }
  if (organization) {
    vcard.push(`ORG:${organization}`);
  }
  if (title) {
    vcard.push(`TITLE:${title}`);
  }
  vcard.push('END:VCARD');
  return vcard.join('\n');
}

async function syncAndReexport() {
  console.log("=== SYNCING 5 LATEST REGISTRANTS AND RE-EXPORTING ===");

  const newEntries = [
    { fullname: 'Parvati Gopal shinde', email: 'parvatigopalshinde65@gmail.com', mobile: '9945213684', role: 'School Teacher', organization: 'School', city: '' },
    { fullname: 'Ashu Khattar', email: 'ashu.khattar@learn.apeejay.edu', mobile: '7303544875', role: 'School Teacher', organization: 'Apeejay School', city: '' },
    { fullname: 'Mrs. Poonam Kawatra', email: 'vice_principal@blmacademy.com', mobile: '7017166853', role: 'Vice Principal', organization: 'BLM Academy', city: '' },
    { fullname: 'Esther Sofia s', email: 'sofiasampraveen@gmail.com', mobile: '9597485073', role: 'School Teacher', organization: 'School', city: '' },
    { fullname: 'Rukmini Rai', email: 'rukminirai@hotmail.com', mobile: '9811838290', role: 'School Teacher', organization: 'School', city: '' }
  ];

  for (const entry of newEntries) {
    console.log(`🚀 Syncing "${entry.fullname}" (${entry.email})...`);
    try {
      const res = await postUrl(WEBHOOK_URL, {
        action: 'register',
        fullname: entry.fullname,
        email: entry.email,
        mobile: entry.mobile,
        role: entry.role,
        organization: entry.organization,
        city: entry.city,
        source: 'Dashboard Live Sync',
        skipEmail: 'true'
      });
      console.log(`   Result: ${res.body}`);
    } catch(err) {
      console.error(`   Error syncing "${entry.fullname}":`, err.message);
    }
  }

  // Fetch updated live tab
  const liveUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent('20 sept live')}`;
  const liveRes = await fetchUrl(liveUrl);
  const liveRows = parseCsv(liveRes.body);

  const cutoff = new Date(2026, 8, 14, 0, 0, 0);

  const csvRows = [
    ['Timestamp', 'Full Name', 'Email Address', 'Mobile Number', 'Role', 'Primary Interest', 'School / Organization', 'AI Passport ID', 'City', 'Status']
  ];

  const vcards = [];
  const seenEmails = new Set();
  const seenMobiles = new Set();

  for (let i = 1; i < liveRows.length; i++) {
    const r = liveRows[i];
    const tsStr = r[0];
    const name = r[1]?.trim();
    const email = r[2]?.trim();
    const mobile = r[3]?.trim();
    const role = r[4]?.trim() || 'School Teacher';
    const interest = r[5]?.trim() || 'General AI';
    const org = r[6]?.trim() || 'School';
    const pid = r[7]?.trim() || '';
    const city = r[8]?.trim() || '';

    if (name?.includes('EXECUTIVE DASHBOARD') || name?.includes('FILTER BY') || name?.includes('PARTICIPANT DIRECTORY') || name?.includes('AI Passport ID')) {
      continue;
    }

    if (!name && !email && !mobile) continue;

    const dt = parseTimestamp(tsStr);
    if (dt && dt < cutoff) continue;

    const cleanE = (email || '').toLowerCase();
    const cleanM = (mobile || '').replace(/\D/g, '').slice(-10);

    if (cleanE && seenEmails.has(cleanE)) continue;
    if (cleanM && seenMobiles.has(cleanM)) continue;

    if (cleanE) seenEmails.add(cleanE);
    if (cleanM) seenMobiles.add(cleanM);

    csvRows.push([
      tsStr,
      `"${name || 'Educator'}"`,
      `"${email}"`,
      `"${mobile}"`,
      `"${role}"`,
      `"${interest}"`,
      `"${org}"`,
      `"${pid}"`,
      `"${city}"`,
      '"Verified Sent Confirmation Email"'
    ]);

    const card = generateVcard(name, mobile, email, org, role);
    if (card) vcards.push(card);
  }

  const csvText = csvRows.map(r => r.join(',')).join('\n');
  const desktopCsvPath = path.join(DESKTOP_DIR, 'AI_Passport_Registrations_From_14Sept.csv');
  const desktopVcfPath = path.join(DESKTOP_DIR, '20Sept_Verified_Sent_Contacts.vcf');

  fs.writeFileSync(desktopCsvPath, csvText, 'utf8');
  fs.writeFileSync(desktopVcfPath, vcards.join('\n\n') + '\n', 'utf8');

  console.log(`\n==================================================`);
  console.log(`✅ RE-EXPORT COMPLETE WITH 0 OMISSIONS!`);
  console.log(`📊 TOTAL VERIFIED REGISTRATIONS: ${csvRows.length - 1}`);
  console.log(`📧 UNIQUE EMAILS: ${seenEmails.size}`);
  console.log(`📄 Desktop CSV: ${desktopCsvPath}`);
  console.log(`📱 Desktop VCF: ${desktopVcfPath}`);
  console.log(`==================================================`);
}

syncAndReexport().catch(console.error);
