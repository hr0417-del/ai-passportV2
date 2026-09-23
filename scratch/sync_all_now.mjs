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

async function runMasterSync() {
  console.log("=== COMPREHENSIVE LIVE SYNC & VERIFICATION ENGINE ===");

  const dashUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent('Dashboard')}`;
  const liveUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent('20 sept live')}`;

  const dashRes = await fetchUrl(dashUrl);
  const liveRes = await fetchUrl(liveUrl);

  const dashRows = parseCsv(dashRes.body);
  const liveRows = parseCsv(liveRes.body);

  console.log(`📥 Loaded Dashboard Tab: ${dashRows.length - 1} entries`);
  console.log(`📥 Loaded 20 Sept Live Tab: ${liveRows.length - 1} entries`);

  const liveEmails = new Set(liveRows.slice(1).map(r => r[2]?.toLowerCase().trim()).filter(Boolean));
  const liveMobiles = new Set(liveRows.slice(1).map(r => r[3]?.replace(/\D/g, '').slice(-10)).filter(Boolean));

  const cutoff = new Date(2026, 8, 14, 16, 55, 46); // 14 Sept 2026 16:55:46 IST

  let addedCount = 0;
  let skippedCount = 0;

  for (let i = 1; i < dashRows.length; i++) {
    const row = dashRows[i];
    const tsStr = row[0];
    const fullname = row[1]?.trim() || '';
    const email = row[2]?.trim() || '';
    const mobile = row[3]?.trim() || '';

    if (!fullname && !email && !mobile) continue;

    // Check cutoff date filter: 14/09/2026 16:55:46
    if (tsStr) {
      let regDate = null;
      const match = tsStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{1,2}):(\d{1,2})/);
      if (match) {
        regDate = new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]), parseInt(match[4]), parseInt(match[5]), parseInt(match[6]));
      } else {
        const d = new Date(tsStr);
        if (!isNaN(d.getTime())) regDate = d;
      }

      if (regDate && regDate < cutoff) {
        // Skip historical entry prior to 14/09/2026 16:55:46
        skippedCount++;
        continue;
      }
    }

    const cleanEmail = email.toLowerCase();
    const cleanMobile = mobile.replace(/\D/g, '').slice(-10);

    const isDuplicate = (cleanEmail && liveEmails.has(cleanEmail)) || (cleanMobile && liveMobiles.has(cleanMobile));

    if (!isDuplicate) {
      console.log(`🚀 Syncing new entry from Dashboard to 20 sept live: "${fullname}" (${email} / ${mobile})`);
      const payload = {
        action: 'register',
        fullname: fullname,
        email: email,
        mobile: mobile,
        role: row[4] || 'School Teacher',
        use_case: row[5] || 'General AI',
        organization: row[6] || 'School',
        city: row[8] || '',
        source: 'Dashboard Live Sync',
        skipEmail: 'true'
      };

      try {
        const postRes = await postUrl(WEBHOOK_URL, payload);
        console.log(`   Response: ${postRes.body}`);
        addedCount++;
        if (cleanEmail) liveEmails.add(cleanEmail);
        if (cleanMobile) liveMobiles.add(cleanMobile);
      } catch (err) {
        console.error(`   Failed to sync "${fullname}":`, err.message);
      }
    } else {
      skippedCount++;
    }
  }

  console.log(`\n✅ Dashboard Sync Summary: Added ${addedCount}, Verified & Skipped Duplicates ${skippedCount}`);

  // Fetch updated live tab for VCF generation
  const updatedLiveRes = await fetchUrl(liveUrl);
  const updatedLiveRows = parseCsv(updatedLiveRes.body);

  const vcards = [];
  let count = 0;

  for (let r = 1; r < updatedLiveRows.length; r++) {
    const row = updatedLiveRows[r];
    const name = row[1];
    const email = row[2];
    const mobile = row[3];
    const role = row[4];
    const org = row[6];

    if (!name && !mobile && !email) continue;

    const vcardStr = generateVcard(name, mobile, email, org, role);
    if (vcardStr) {
      vcards.push(vcardStr);
      count++;
    }
  }

  const vcfContent = vcards.join('\n\n') + '\n';
  const vcfPathLocal = '20Sept_Live_Tab_Contacts.vcf';
  const vcfPathDesktop = path.join(DESKTOP_DIR, '20Sept_Live_Tab_Contacts.vcf');

  fs.writeFileSync(vcfPathLocal, vcfContent, 'utf8');
  fs.writeFileSync(vcfPathDesktop, vcfContent, 'utf8');

  console.log(`\n📇 Generated VCF file with ${count} contacts!`);
  console.log(`   Saved locally: ${vcfPathLocal}`);
  console.log(`   Saved on Desktop: ${vcfPathDesktop}`);
}

runMasterSync().catch(console.error);
