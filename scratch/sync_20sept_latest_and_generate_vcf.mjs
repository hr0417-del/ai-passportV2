import https from 'https';
import fs from 'fs';
import path from 'path';

const SHEET_ID = '1WH3-GLtOS3pS3X4tUruX24SXGX9v9cLtskZQ92SVnto';
const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbyc6SJB1Qf0x_OjoGw6Qy6rz38aMXwotYtKERw9lPGeslwPdoGOUpURLHBNCZ_iZmB_xg/exec';
const DESKTOP_DIR = 'C:\\Users\\HP\\Desktop';

const newRegistrations = [
  { ts: '20/09/2026 06:30:14', name: 'VIDYADEVI CHAVAN', email: 'vidyachavan1989@gmail.com', mobile: '9844851274', role: 'School Teacher', interest: 'Content Creation', pid: 'AIP-2026-0377' },
  { ts: '20/09/2026 07:10:43', name: 'Pallavi', email: 'pallavifuria@gmail.com', mobile: '8898948455', role: 'Education / Training Professional', interest: 'Assessment', pid: 'AIP-2026-0378' },
  { ts: '20/09/2026 08:54:13', name: 'Sandhya C R', email: 'sandhyacrn1989@gmail.com', mobile: '9591592990', role: 'Academic Coordinator', interest: 'Other', pid: 'AIP-2026-0379' },
  { ts: '20/09/2026 09:58:20', name: 'Rafia Khatoon', email: 'rafia.khatoon@learn.apeejay.edu', mobile: '9811712266', role: 'School Teacher', interest: 'Lesson Planning', pid: 'AIP-2026-0380' },
  { ts: '20/09/2026 10:03:19', name: 'Imran Ahmad', email: 'imransami09@gmail.com', mobile: '9760272810', role: 'School Teacher', interest: 'Student Support', pid: 'AIP-2026-0381' },
  { ts: '20/09/2026 10:11:15', name: 'Reena', email: 'Reena.1@learn.apeejay.edu', mobile: '9118336827', role: 'School Teacher', interest: 'Lesson Planning', pid: 'AIP-2026-0382' },
  { ts: '20/09/2026 10:12:57', name: 'SAKTI PRASAD SAHU', email: 'sakti5680@gmail.com', mobile: '9337355746', role: 'Education / Training Professional', interest: 'Lesson Planning', pid: 'AIP-2026-0383' },
  { ts: '20/09/2026 10:26:39', name: 'Chand Nanda', email: 'hand.nanda@learn.apeejay.edu', mobile: '9899866002', role: 'School Teacher', interest: 'Lesson Planning', pid: 'AIP-2026-0384' },
  { ts: '20/09/2026 10:29:53', name: 'Zenia Dutta', email: 'zenia.dutta@learn.apeejay.edu', mobile: '9811546807', role: 'School Teacher', interest: 'Content Creation', pid: 'AIP-2026-0385' },
  { ts: '20/09/2026 10:33:39', name: 'Sangeeta Handa', email: 'sangeeta.handa@learn.apeejay.edu', mobile: '9810930264', role: 'School Teacher', interest: 'AI Skills Development', pid: 'AIP-2026-0386' },
  { ts: '20/09/2026 10:40:05', name: 'Rachna Magoo', email: 'rachmag123@gmail.com', mobile: '9899859459', role: 'School Teacher', interest: 'Lesson Planning', pid: 'AIP-2026-0387' },
  { ts: '20/09/2026 10:42:46', name: 'Meenu Sehgal', email: 'meenu.sehgal@learn.apeejay.edu', mobile: '9810481304', role: 'School Teacher', interest: 'AI Skills Development', pid: 'AIP-2026-0388' },
  { ts: '20/09/2026 10:43:59', name: 'Pooja Bhardwaj', email: 'pooja.bhardwaj@learn.apeejay.edu', mobile: '8860002518', role: 'School Teacher', interest: 'Lesson Planning', pid: 'AIP-2026-0389' },
  { ts: '20/09/2026 10:51:38', name: 'Onila Mishra', email: 'sumaan92@gmail.com', mobile: '9654769908', role: 'School Teacher', interest: 'Lesson Planning', pid: 'AIP-2026-0390' },
  { ts: '20/09/2026 10:56:32', name: 'K V Hemalatha', email: 'hemlathahindi07@gmail.com', mobile: '9489351027', role: 'School Teacher', interest: 'AI Skills Development', pid: 'AIP-2026-0391' }
];

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

function generateVcard(name, phone, email, prefix) {
  const cleanName = (name || 'Educator').trim();
  const rawDigits = (phone || '').replace(/\D/g, '');
  let formattedPhone = '';
  
  if (rawDigits.length === 10) {
    formattedPhone = `+91${rawDigits}`;
  } else if (rawDigits.length > 0) {
    formattedPhone = `+${rawDigits}`;
  }

  const pfx = prefix ? `${prefix} ` : '';

  const vcard = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:;${pfx}${cleanName};;;`,
    `FN:${pfx}${cleanName}`
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
  console.log("=== PROCESSING 15 LATEST 20 SEPT REGISTRATIONS ===");

  // 1. Sync to Google Sheet
  for (const item of newRegistrations) {
    console.log(`🚀 Syncing "${item.name}" (${item.email})...`);
    try {
      const res = await postUrl(WEBHOOK_URL, {
        action: 'register',
        fullname: item.name,
        email: item.email,
        mobile: item.mobile,
        role: item.role,
        use_case: item.interest,
        source: 'Live Form 20 Sept',
        skipEmail: 'true'
      });
      console.log(`   Result: ${res.body}`);
    } catch(e) {
      console.log(`   Sync notice: ${e.message}`);
    }
  }

  // 2. Generate VCF Files on Desktop
  const vcards20Sept = newRegistrations.map(c => generateVcard(c.name, c.mobile, c.email, '20Sept.'));
  const vcards209 = newRegistrations.map(c => generateVcard(c.name, c.mobile, c.email, '209.'));

  const file20Sept = path.join(DESKTOP_DIR, '20Sept_Latest_20Sept_Registrations.vcf');
  const file209 = path.join(DESKTOP_DIR, '209_Latest_20Sept_Registrations.vcf');
  const fileDirect = path.join(DESKTOP_DIR, 'Latest_20Sept_Registrations.vcf');

  fs.writeFileSync(file20Sept, vcards20Sept.join('\n\n') + '\n', 'utf8');
  fs.writeFileSync(file209, vcards209.join('\n\n') + '\n', 'utf8');
  fs.writeFileSync(fileDirect, vcards20Sept.join('\n\n') + '\n', 'utf8');

  console.log("\n==================================================");
  console.log(`✅ GENERATED VCF FOR ALL 15 LATEST REGISTRATIONS!`);
  console.log(`📁 Saved 20Sept Prefix: ${file20Sept}`);
  console.log(`📁 Saved 209 Prefix: ${file209}`);
  console.log(`📁 Saved Direct VCF: ${fileDirect}`);
  console.log("==================================================");
}

run().catch(console.error);
