import https from 'https';
import fs from 'fs';

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

async function inspectSept20Tab() {
  console.log('Testing export of tab: "20 sept live"...');
  
  // Test export with sheet name parameter
  const tabNames = ['20 sept live', '20 Sept Live', '20 Sept live', '20 sept Live'];
  
  for (const name of tabNames) {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(name)}`;
    const res = await fetchUrl(url);
    console.log(`Tab ["${name}"] Response Status: ${res.status}`);
    if (res.status === 200 && res.body && !res.body.includes('<!DOCTYPE html>')) {
      const lines = res.body.split('\n').filter(l => l.trim().length > 0);
      console.log(`✅ SUCCESS! Found tab "${name}" with ${lines.length} rows!`);
      console.log('Header Row:', lines[0]);
      console.log('\nLast 3 Rows:');
      lines.slice(-3).forEach((line, idx) => console.log(`${idx + 1}: ${line}`));
      fs.writeFileSync('scratch/tab_20_sept_live.csv', res.body);
      return;
    }
  }
}

inspectSept20Tab();
