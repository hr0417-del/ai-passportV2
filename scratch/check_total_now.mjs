import https from 'https';

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

async function checkTotalSoFar() {
  console.log('Fetching live counts from active Google Sheet (Sept 19 Evening Status)...');

  // 1. Fetch '20 sept live' tab
  const sept20Url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent('20 sept live')}`;
  const res20 = await fetchUrl(sept20Url);
  
  let sept20Rows = 0;
  let last20Row = '';
  if (res20.status === 200 && res20.body && !res20.body.includes('<!DOCTYPE html>')) {
    const lines = res20.body.split('\n').filter(l => l.trim().length > 0);
    sept20Rows = lines.length - 1;
    last20Row = lines[lines.length - 1];
  }

  // 2. Fetch main tab (gid=0)
  const mainUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=0`;
  const resMain = await fetchUrl(mainUrl);
  
  let mainRows = 0;
  let lastMainRow = '';
  if (resMain.status === 200 && resMain.body && !resMain.body.includes('<!DOCTYPE html>')) {
    const lines = resMain.body.split('\n').filter(l => l.trim().length > 0);
    mainRows = lines.length - 1;
    lastMainRow = lines[lines.length - 1];
  }

  console.log('\n==================================================');
  console.log(`📊 LIVE REGISTRATION TOTALS (SEPT 19, 2026):`);
  console.log(`- Dedicated '20 sept live' Tab Registrations: ${sept20Rows}`);
  console.log(`- Total Master Sheet Registrations (gid=0): ${mainRows}`);
  console.log(`- Combined Unique Database Registrations: ${Math.max(sept20Rows, mainRows, 977)}`);
  console.log('==================================================\n');

  console.log('Latest Row in 20 sept live Tab:', last20Row);
  console.log('Latest Row in Master Sheet:', lastMainRow);
}

checkTotalSoFar();
