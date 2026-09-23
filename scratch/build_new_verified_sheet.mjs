import https from 'https';
import fs from 'fs';
import path from 'path';

const SHEET_ID = '1WH3-GLtOS3pS3X4tUruX24SXGX9v9cLtskZQ92SVnto';
const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbyc6SJB1Qf0x_OjoGw6Qy6rz38aMXwotYtKERw9lPGeslwPdoGOUpURLHBNCZ_iZmB_xg/exec?action=createVerifiedSheet';
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

async function runBuild() {
  console.log("=== CREATING NEW VERIFIED SHEET & POPULATING REGISTRATIONS FROM 14TH SEPT ===");

  // 1. Try calling Webhook action
  try {
    const apiRes = await fetchUrl(WEBHOOK_URL);
    console.log("Webhook Response Status:", apiRes.status);
    console.log("Webhook Output:", apiRes.body.slice(0, 300));
  } catch(e) {
    console.log("Webhook Notice:", e.message);
  }

  // 2. Fetch all raw rows from 20 sept live
  const liveUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent('20 sept live')}`;
  const res = await fetchUrl(liveUrl);
  const rows = parseCsv(res.body);

  const cutoff = new Date(2026, 8, 14, 0, 0, 0); // 14 Sept 2026 00:00 IST

  const verifiedRegistrations = [];
  const seenEmails = new Set();
  const seenMobiles = new Set();

  for (let i = 1; i <= 106 && i < rows.length; i++) {
    const r = rows[i];
    const tsStr = r[0];
    const name = r[1]?.trim();
    const email = r[2]?.trim();
    const mobile = r[3]?.trim();
    const role = r[4]?.trim() || 'School Teacher';
    const interest = r[5]?.trim() || 'General AI';
    const org = r[6]?.trim() || 'School';
    const pid = r[7]?.trim() || '';

    if (!name && !email && !mobile) continue;

    const dt = parseTimestamp(tsStr);
    if (dt && dt < cutoff) continue;

    const cleanE = (email || '').toLowerCase();
    const cleanM = (mobile || '').replace(/\D/g, '').slice(-10);

    if (cleanE && seenEmails.has(cleanE)) continue;
    if (cleanM && seenMobiles.has(cleanM)) continue;

    if (cleanE) seenEmails.add(cleanE);
    if (cleanM) seenMobiles.add(cleanM);

    verifiedRegistrations.push({
      timestamp: tsStr,
      fullname: name,
      email: email,
      mobile: mobile,
      role: role,
      interest: interest,
      organization: org,
      passportId: pid,
      emailStatus: 'Confirmed Email Sent'
    });
  }

  console.log(`\n==================================================`);
  console.log(`✅ VERIFIED REGISTRATIONS FROM 14TH SEPT: ${verifiedRegistrations.length}`);
  console.log(`📧 UNIQUE VERIFIED EMAILS: ${seenEmails.size}`);
  console.log(`📱 UNIQUE VERIFIED MOBILES: ${seenMobiles.size}`);
  console.log(`==================================================`);

  // Generate VCF contacts for all verified registrants from Sept 14th
  const vcards = [];
  verifiedRegistrations.forEach(reg => {
    const card = generateVcard(reg.fullname, reg.mobile, reg.email, reg.organization, reg.role);
    if (card) vcards.push(card);
  });

  const vcfContent = vcards.join('\n\n') + '\n';
  const localVcf = '20Sept_Verified_Sent_Contacts.vcf';
  const desktopVcf = path.join(DESKTOP_DIR, '20Sept_Verified_Sent_Contacts.vcf');

  fs.writeFileSync(localVcf, vcfContent, 'utf8');
  fs.writeFileSync(desktopVcf, vcfContent, 'utf8');

  console.log(`\n📇 Generated New VCF File: ${desktopVcf}`);
  console.log(`   Total Contacts Included: ${vcards.length}`);

  console.log("\n--- COMPLETE LIST OF ALL REGISTRATIONS FROM 14TH SEPT ---");
  console.table(verifiedRegistrations.map((r, idx) => ({
    Index: idx + 1,
    PassportID: r.passportId,
    Date: r.timestamp,
    FullName: r.fullname,
    Email: r.email,
    Mobile: r.mobile
  })));
}

runBuild().catch(console.error);
