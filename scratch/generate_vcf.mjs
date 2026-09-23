import fs from 'fs';
import path from 'path';

function formatPhone(raw) {
  if (!raw) return '';
  let str = raw.toString().trim();
  if (str.includes('E')) {
    const num = parseFloat(str);
    if (!isNaN(num)) str = Math.round(num).toString();
  }
  let cleaned = str.replace(/[^0-9]/g, '');
  if (cleaned.length === 10) {
    return '+91' + cleaned;
  } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return '+' + cleaned;
  } else if (cleaned.length > 5) {
    return '+' + cleaned;
  }
  return '';
}

// Parse '20 sept live' tab CSV
const sept20Csv = fs.readFileSync('scratch/tab_20_sept_live.csv', 'utf8');
const sept20Lines = sept20Csv.split('\n').filter(l => l.trim().length > 0);

const sept20Contacts = [];

for (let i = 1; i < sept20Lines.length; i++) {
  const parts = [];
  let inQuotes = false;
  let cur = '';
  for (let c of sept20Lines[i]) {
    if (c === '"') inQuotes = !inQuotes;
    else if (c === ',' && !inQuotes) { parts.push(cur); cur = ''; }
    else cur += c;
  }
  parts.push(cur);

  const name = (parts[1] || 'Educator').trim().replace(/["']/g, '');
  const email = (parts[2] || '').trim().toLowerCase().replace(/["']/g, '');
  const phone = formatPhone(parts[3]);
  const role = parts[4] || '';
  const org = parts[6] || '';
  const passportId = parts[7] || '';
  const city = parts[8] || '';

  if (name || email || phone) {
    sept20Contacts.push({ name, email, phone, role, org, passportId, city });
  }
}

function buildVcf(contacts) {
  let vcf = '';
  for (const c of contacts) {
    const prefixedName = `20Sept. ${c.name}`;
    vcf += `BEGIN:VCARD\r\n`;
    vcf += `VERSION:3.0\r\n`;
    vcf += `FN:${prefixedName}\r\n`;
    vcf += `N:;${prefixedName};;;\r\n`;
    if (c.phone) vcf += `TEL;TYPE=CELL,VOICE:${c.phone}\r\n`;
    if (c.email) vcf += `EMAIL;TYPE=INTERNET:${c.email}\r\n`;
    if (c.org) vcf += `ORG:${c.org}\r\n`;
    if (c.role) vcf += `TITLE:${c.role}\r\n`;
    let note = `AI Passport Live Registrant`;
    if (c.passportId) note += ` | Passport ID: ${c.passportId}`;
    if (c.city) note += ` | City: ${c.city}`;
    vcf += `NOTE:${note}\r\n`;
    vcf += `END:VCARD\r\n\r\n`;
  }
  return vcf;
}

// 1. Save Dedicated "20 sept live" Tab VCF
const liveTabVcf = buildVcf(sept20Contacts);
const liveTabFile = '20Sept_Live_Tab_Contacts.vcf';
fs.writeFileSync(path.resolve('c:/Users/HP/Downloads/AIPASS', liveTabFile), liveTabVcf, 'utf8');

console.log(`✅ Generated dedicated VCF for '20 sept live' tab (${sept20Contacts.length} contacts): ${liveTabFile}`);

// Sample preview of first contact card
console.log('\n--- Sample VCF Card Preview ---');
console.log(liveTabVcf.split('\r\n').slice(0, 10).join('\n'));
