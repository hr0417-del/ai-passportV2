import https from 'https';
import fs from 'fs';
import path from 'path';

const SHEET_ID = '1WH3-GLtOS3pS3X4tUruX24SXGX9v9cLtskZQ92SVnto';

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

function extractEmail(row) {
  for (const cell of row) {
    if (typeof cell === 'string' && cell.includes('@') && cell.includes('.')) {
      const match = cell.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (match) return match[0].toLowerCase();
    }
  }
  return null;
}

function extractMobile(row) {
  for (const cell of row) {
    if (typeof cell === 'string') {
      const digits = cell.replace(/\D/g, '');
      if (digits.length === 10 && /^[6789]/.test(digits)) return digits;
    }
  }
  return null;
}

async function runExhaustiveAudit() {
  console.log("=== EXHAUSTIVE MULTI-SOURCE ZERO-OMISSION AUDIT ===");

  const cutoff = new Date(2026, 8, 14, 0, 0, 0); // 14 Sept 2026 00:00:00

  // 1. Load exported file
  const desktopCsvPath = 'C:\\Users\\HP\\Desktop\\AI_Passport_Registrations_From_14Sept.csv';
  let exportedEmails = new Set();
  let exportedMobiles = new Set();

  if (fs.existsSync(desktopCsvPath)) {
    const exportedCsv = fs.readFileSync(desktopCsvPath, 'utf8');
    const expRows = parseCsv(exportedCsv);
    expRows.slice(1).forEach(r => {
      const e = extractEmail(r);
      const m = extractMobile(r);
      if (e) exportedEmails.add(e);
      if (m) exportedMobiles.add(m);
    });
  }

  console.log(`📥 Currently Exported File: ${exportedEmails.size} emails, ${exportedMobiles.size} mobiles.`);

  // 2. Fetch Tab "20 sept live"
  const liveUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent('20 sept live')}`;
  const liveRes = await fetchUrl(liveUrl);
  const liveRows = parseCsv(liveRes.body);

  // 3. Fetch Tab "Dashboard"
  const dashUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent('Dashboard')}`;
  const dashRes = await fetchUrl(dashUrl);
  const dashRows = parseCsv(dashRes.body);

  // 4. Fetch Tab "Sheet1"
  const sheet1Url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent('Sheet1')}`;
  const sheet1Res = await fetchUrl(sheet1Url);
  const sheet1Rows = parseCsv(sheet1Res.body);

  const missingFromExport = [];

  function auditSource(sourceName, rows) {
    let countPostCutoff = 0;
    rows.slice(1).forEach((r, idx) => {
      const tsStr = r[0];
      const dt = parseTimestamp(tsStr);
      const name = r[1]?.trim() || '';

      if (name.includes('EXECUTIVE DASHBOARD') || name.includes('FILTER BY') || name.includes('PARTICIPANT DIRECTORY') || name.includes('AI Passport ID')) {
        return;
      }

      if (!dt || dt >= cutoff) {
        countPostCutoff++;
        const email = extractEmail(r);
        const mobile = extractMobile(r);

        if (email || mobile) {
          const inExport = (email && exportedEmails.has(email)) || (mobile && exportedMobiles.has(mobile));
          if (!inExport) {
            missingFromExport.push({
              source: sourceName,
              rowNum: idx + 2,
              timestamp: tsStr,
              name: name,
              email: email || 'NO EMAIL',
              mobile: mobile || 'NO MOBILE',
              fullData: r
            });
          }
        }
      }
    });
    console.log(`Source "${sourceName}": ${countPostCutoff} post-cutoff rows evaluated.`);
  }

  auditSource('20 sept live', liveRows);
  auditSource('Dashboard', dashRows);
  auditSource('Sheet1', sheet1Rows);

  // Also check local CSV if exists
  const localLogPath = 'registrants_whatsapp_delivery_log.csv';
  if (fs.existsSync(localLogPath)) {
    const logCsv = fs.readFileSync(localLogPath, 'utf8');
    const logRows = parseCsv(logCsv);
    auditSource('registrants_whatsapp_delivery_log.csv', logRows);
  }

  console.log(`\n==================================================`);
  console.log(`🔍 AUDIT RESULT: ${missingFromExport.length} MISSING ENTRIES FOUND`);
  console.log(`==================================================`);

  if (missingFromExport.length === 0) {
    console.log(`🎉 VERIFIED: ZERO OMISSIONS! Every single registration from Sept 14th onwards across ALL sheets is included!`);
  } else {
    console.log(`⚠️ THE FOLLOWING ENTRIES WERE MISSING FROM THE EXPORT:`);
    console.table(missingFromExport);
  }
}

runExhaustiveAudit().catch(console.error);
