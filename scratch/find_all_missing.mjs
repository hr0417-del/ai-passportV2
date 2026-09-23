import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// 1. Load active Google Sheet records (live_active_sheet.csv)
const activeCsv = fs.readFileSync('scratch/live_active_sheet.csv', 'utf8');
const activeLines = activeCsv.split('\n').filter(l => l.trim().length > 0);

const activeEmails = new Set();
const activeMobiles = new Set();

for (let i = 1; i < activeLines.length; i++) {
  const parts = activeLines[i].split(',');
  const email = (parts[2] || parts[3] || '').trim().toLowerCase();
  const mobile = (parts[3] || parts[4] || '').trim();
  if (email && email.includes('@')) activeEmails.add(email);
  if (mobile && mobile.length >= 8) activeMobiles.add(mobile);
}

console.log('Active Google Sheet unique emails count:', activeEmails.size);
console.log('Active Google Sheet unique mobiles count:', activeMobiles.size);

// 2. Load local Excel file (AI Passport Registrations.xlsx)
const xlsxPath = path.resolve('AI Passport Registrations.xlsx');
const tempZip = path.resolve('scratch/temp_registrations.zip');
const tempDir = path.resolve('scratch/excel_temp');

if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
if (fs.existsSync(tempZip)) fs.unlinkSync(tempZip);

fs.copyFileSync(xlsxPath, tempZip);
fs.mkdirSync(tempDir, { recursive: true });

execSync(`powershell -Command "Expand-Archive -Path '${tempZip}' -DestinationPath '${tempDir}' -Force"`);

const sharedStringsXml = fs.existsSync(path.join(tempDir, 'xl/sharedStrings.xml')) 
  ? fs.readFileSync(path.join(tempDir, 'xl/sharedStrings.xml'), 'utf8') 
  : '';

const sheet1Xml = fs.readFileSync(path.join(tempDir, 'xl/worksheets/sheet1.xml'), 'utf8');

const strings = [];
const stringMatches = sharedStringsXml.match(/<t[^>]*>(.*?)<\/t>/gs) || [];
for (const match of stringMatches) {
  strings.push(match.replace(/<[^>]+>/g, ''));
}

const rows = [];
const rowMatches = sheet1Xml.match(/<row[^>]*>(.*?)<\/row>/gs) || [];

for (const rMatch of rowMatches) {
  const cellMatches = rMatch.match(/<c[^>]*>(.*?)<\/c>/gs) || [];
  const rowVals = [];
  for (const cMatch of cellMatches) {
    const isShared = cMatch.includes('t="s"');
    const valMatch = cMatch.match(/<v>(.*?)<\/v>/);
    let val = valMatch ? valMatch[1] : '';
    if (isShared && val !== '') {
      const idx = parseInt(val, 10);
      val = strings[idx] || val;
    }
    rowVals.push(val);
  }
  rows.push(rowVals);
}

fs.rmSync(tempDir, { recursive: true, force: true });
if (fs.existsSync(tempZip)) fs.unlinkSync(tempZip);

const missingFromExcel = [];

for (let i = 1; i < rows.length; i++) {
  const r = rows[i];
  if (!r || r.length === 0) continue;
  const name = (r[2] || '').trim();
  const email = (r[3] || '').trim().toLowerCase();
  const mobile = (r[4] || '').trim();
  const role = (r[5] || 'School Teacher').trim();
  const org = (r[6] || '').trim();
  const city = (r[8] || '').trim();

  if (email && email.includes('@') && !activeEmails.has(email)) {
    missingFromExcel.push({
      fullname: name,
      email: email,
      mobile: mobile,
      role: role,
      organization: org,
      city: city,
      source: 'Local Excel Restore'
    });
  }
}

console.log('\n==================================================');
console.log(`TOTAL MISSING REGISTRANTS IN EXCEL NOT YET IN GOOGLE SHEET: ${missingFromExcel.length}`);
console.log('==================================================\n');

if (missingFromExcel.length > 0) {
  console.log('Sample Missing Registrants to restore:');
  console.table(missingFromExcel.slice(0, 10));
}

// Save missing list to JSON for 1-click backfill
fs.writeFileSync('scratch/missing_registrants.json', JSON.stringify(missingFromExcel, null, 2));
console.log('Saved missing registrants list to scratch/missing_registrants.json');
