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

function excelToJsDate(serial) {
  if (!serial || isNaN(serial)) return null;
  const num = parseFloat(serial);
  if (num < 10000) return null; // Not a serial date
  const utc_days  = Math.floor(num - 25569);
  const utc_value = utc_days * 86400;                                
  const date_info = new Date(utc_value * 1000);

  const fractional_day = num - Math.floor(num) + 0.0000001;

  let total_seconds = Math.floor(86400 * fractional_day);

  const seconds = total_seconds % 60;

  total_seconds -= seconds;

  const hours = Math.floor(total_seconds / 3600);
  const minutes = Math.floor((total_seconds / 60) % 60);

  return new Date(Date.UTC(date_info.getFullYear(), date_info.getMonth(), date_info.getDate(), hours, minutes, seconds));
}

// 1. Analyze Excel Rows
const headers = rows[0];
let excelSept14Onwards = [];
let excelAllDates = [];

for (let i = 1; i < rows.length; i++) {
  const r = rows[i];
  if (!r || r.length === 0) continue;
  
  let dateObj = null;
  const rawTimestamp = r[0];
  
  if (!isNaN(rawTimestamp)) {
    dateObj = excelToJsDate(rawTimestamp);
  } else if (rawTimestamp) {
    dateObj = new Date(rawTimestamp);
  }
  
  if (dateObj && !isNaN(dateObj.getTime())) {
    excelAllDates.push({ row: i + 1, name: r[2], email: r[3], phone: r[4], date: dateObj.toISOString() });
    
    // Check if on or after Sept 14, 2026 (00:00:00 IST / UTC)
    // Sept 14 2026 00:00 IST = Sept 13 2026 18:30 UTC
    if (dateObj >= new Date('2026-09-13T18:30:00.000Z')) {
      excelSept14Onwards.push({ row: i + 1, name: r[2], email: r[3], phone: r[4], date: dateObj.toISOString() });
    }
  }
}

console.log('=== 1. EXCEL FILE STATS ===');
console.log('Total Rows in Excel:', rows.length - 1);
console.log('Total Parsed Dates:', excelAllDates.length);
console.log('Registrations from 14 Sept 2026 onwards in Excel:', excelSept14Onwards.length);
if (excelSept14Onwards.length > 0) {
  console.log('Excel Sept 14+ Records:');
  console.table(excelSept14Onwards);
}

// 2. Analyze WhatsApp Delivery Log CSV
const csvContent = fs.readFileSync('registrants_whatsapp_delivery_log.csv', 'utf8');
const csvLines = csvContent.split('\n').filter(l => l.trim().length > 0);
let csvSept14Onwards = [];

for (let i = 1; i < csvLines.length; i++) {
  const match = csvLines[i].match(/"([^"]*)"/g);
  if (match && match.length >= 6) {
    const timestampStr = match[0].replace(/"/g, '');
    const name = match[1].replace(/"/g, '');
    const email = match[2].replace(/"/g, '');
    const phone = match[3].replace(/"/g, '');
    const status = match[5].replace(/"/g, '');
    const d = new Date(timestampStr);
    if (!isNaN(d.getTime())) {
      if (d >= new Date('2026-09-13T18:30:00.000Z')) {
        csvSept14Onwards.push({ timestamp: timestampStr, name, email, phone, status });
      }
    }
  }
}

console.log('\n=== 2. WHATSAPP LOG STATS ===');
console.log('Registrations from 14 Sept 2026 onwards in WhatsApp Delivery Log:', csvSept14Onwards.length);

// 3. Analyze Supabase Profiles DB
const supabase = createClient('https://uxuaisvdmvkircymwvdl.supabase.co', 'sb_publishable_M6cxghtva7ZHqMLt2-RS1w_CfYeaMTF');
const { data: dbProfiles } = await supabase.from('profiles').select('*');

let dbSept14Onwards = [];
if (dbProfiles) {
  dbSept14Onwards = dbProfiles.filter(p => new Date(p.created_at) >= new Date('2026-09-13T18:30:00.000Z'));
}

console.log('\n=== 3. SUPABASE DB STATS ===');
console.log('Total Profiles in DB:', dbProfiles ? dbProfiles.length : 0);
console.log('Registrations from 14 Sept 2026 onwards in Supabase DB:', dbSept14Onwards.length);

// Also summarize latest dates present in Excel
excelAllDates.sort((a, b) => new Date(b.date) - new Date(a.date));
console.log('\n=== LATEST 5 REGISTRATIONS IN EXCEL ===');
console.table(excelAllDates.slice(0, 5));
