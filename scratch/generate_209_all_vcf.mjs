import https from 'https';
import fs from 'fs';
import path from 'path';

const SHEET_ID = '1WH3-GLtOS3pS3X4tUruX24SXGX9v9cLtskZQ92SVnto';
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

function generateVcard(name, phone, email) {
  const cleanName = (name || 'Educator').trim();
  const rawDigits = (phone || '').replace(/\D/g, '');
  let formattedPhone = '';
  
  if (rawDigits.length === 10) {
    formattedPhone = `+91${rawDigits}`;
  } else if (rawDigits.length > 0) {
    formattedPhone = `+${rawDigits}`;
  }

  const vcard = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:;209. ${cleanName};;;`,
    `FN:209. ${cleanName}`
  ];

  if (formattedPhone) {
    vcard.push(`TEL;TYPE=CELL:${formattedPhone}`);
  }
  if (email && email.includes('@')) {
    vcard.push(`EMAIL;TYPE=INTERNET:${email.trim()}`);
  }
  vcard.push('END:VCARD');
  return vcard.join('\n');
}

async function run() {
  const liveUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent('20 sept live')}`;
  const res = await fetchUrl(liveUrl);
  const liveRows = parseCsv(res.body);

  const cutoff = new Date(2026, 8, 14, 0, 0, 0);

  const vcards = [];
  const seenEmails = new Set();
  const seenMobiles = new Set();

  for (let i = 1; i < liveRows.length; i++) {
    const r = liveRows[i];
    const tsStr = r[0];
    const name = r[1]?.trim();
    const email = r[2]?.trim();
    const mobile = r[3]?.trim();

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

    const card = generateVcard(name, mobile, email);
    if (card) vcards.push(card);
  }

  const vcfContent = vcards.join('\n\n') + '\n';
  const desktopFile = path.join(DESKTOP_DIR, '209_All_Verified_Contacts.vcf');

  fs.writeFileSync(desktopFile, vcfContent, 'utf8');
  console.log(`✅ Saved Full 209 VCF with ${vcards.length} contacts on Desktop: ${desktopFile}`);
}

run().catch(console.error);
