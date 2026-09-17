import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const xlsxPath = path.resolve('AI Passport Registrations.xlsx');
const tempZip = path.resolve('scratch/temp_registrations.zip');
const tempDir = path.resolve('scratch/excel_temp');

if (fs.existsSync(tempDir)) fs.rmSync(tempDir, { recursive: true, force: true });
if (fs.existsSync(tempZip)) fs.unlinkSync(tempZip);

// Copy xlsx to zip
fs.copyFileSync(xlsxPath, tempZip);

fs.mkdirSync(tempDir, { recursive: true });

// Unzip
execSync(`powershell -Command "Expand-Archive -Path '${tempZip}' -DestinationPath '${tempDir}' -Force"`);

const sharedStringsXml = fs.existsSync(path.join(tempDir, 'xl/sharedStrings.xml')) 
  ? fs.readFileSync(path.join(tempDir, 'xl/sharedStrings.xml'), 'utf8') 
  : '';

const sheet1Xml = fs.readFileSync(path.join(tempDir, 'xl/worksheets/sheet1.xml'), 'utf8');

// Extract shared strings
const strings = [];
const stringMatches = sharedStringsXml.match(/<t[^>]*>(.*?)<\/t>/gs) || [];
for (const match of stringMatches) {
  const text = match.replace(/<[^>]+>/g, '');
  strings.push(text);
}

// Extract rows from sheet1.xml
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

console.log('Total Rows in Sheet:', rows.length);
if (rows.length > 0) {
  console.log('Headers:', rows[0]);
  console.log('\nSample Rows (First 5):');
  console.table(rows.slice(1, 6));
  console.log('\nSample Rows (Last 5):');
  console.table(rows.slice(-5));
}

// Clean up
fs.rmSync(tempDir, { recursive: true, force: true });
if (fs.existsSync(tempZip)) fs.unlinkSync(tempZip);
