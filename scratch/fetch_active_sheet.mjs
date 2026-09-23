import https from 'https';
import fs from 'fs';

const SHEET_ID = '1WH3-GLtOS3pS3X4tUruX24SXGX9v9cLtskZQ92SVnto';
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`;

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

async function main() {
  console.log('Fetching active Google Sheet data via CSV export link...');
  try {
    const res = await fetchUrl(CSV_URL);
    console.log('Response Status:', res.status);
    if (res.status === 200 && res.body) {
      fs.writeFileSync('scratch/live_active_sheet.csv', res.body);
      const lines = res.body.split('\n').filter(l => l.trim().length > 0);
      console.log('✅ Successfully downloaded live Google Sheet data!');
      console.log(`Total Rows in Active Google Sheet: ${lines.length - 1}`);
      console.log('Header Row:', lines[0]);
      console.log('\nSample Recent Rows (Last 5):');
      lines.slice(-5).forEach((line, idx) => console.log(`${idx + 1}: ${line}`));
    } else {
      console.log('Could not fetch CSV directly (may require public link sharing permissions). Response preview:', res.body.substring(0, 300));
    }
  } catch(e) {
    console.error('Error fetching sheet:', e.message);
  }
}

main();
