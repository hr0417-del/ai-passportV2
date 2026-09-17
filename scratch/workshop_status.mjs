import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { createClient } from '@supabase/supabase-js';

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
  const text = match.replace(/<[^>]+>/g, '');
  strings.push(text);
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

const headers = rows[0];
const dataRows = rows.slice(1);

const roleCounts = {};
const statusCounts = {};
const cityCounts = {};
let validEmails = 0;
let validMobiles = 0;

for (const r of dataRows) {
  const email = r[3] ? r[3].trim() : '';
  const mobile = r[4] ? r[4].trim() : '';
  const role = r[5] ? r[5].trim() : 'Unspecified';
  const city = r[8] ? r[8].trim() : 'Unspecified';
  const status = r[13] ? r[13].trim() : 'Registered';

  if (email && email.includes('@')) validEmails++;
  if (mobile && mobile.length >= 8) validMobiles++;

  roleCounts[role] = (roleCounts[role] || 0) + 1;
  statusCounts[status] = (statusCounts[status] || 0) + 1;
  if (city) cityCounts[city] = (cityCounts[city] || 0) + 1;
}

console.log('Total Rows (excluding header):', dataRows.length);
console.log('Valid Email Addresses:', validEmails);
console.log('Valid Mobile Numbers:', validMobiles);
console.log('\n--- Role Breakdown ---');
console.log(roleCounts);
console.log('\n--- Status Breakdown ---');
console.log(statusCounts);

// Top 10 Cities
const sortedCities = Object.entries(cityCounts).sort((a, b) => b[1] - a[1]).slice(0, 10);
console.log('\n--- Top 10 Cities ---');
console.log(Object.fromEntries(sortedCities));
