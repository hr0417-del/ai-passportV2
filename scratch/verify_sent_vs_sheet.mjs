import https from 'https';

const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbyc6SJB1Qf0x_OjoGw6Qy6rz38aMXwotYtKERw9lPGeslwPdoGOUpURLHBNCZ_iZmB_xg/exec';

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchJson(res.headers.location).then(resolve).catch(reject);
      }
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch(e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    }).on('error', reject);
  });
}

async function verifySent() {
  console.log('Fetching live Gmail Sent vs Sheet Verification Audit...');
  const result = await fetchJson(`${WEBHOOK_URL}?action=verifySent`);
  console.log('Response Status:', result.status);
  console.log(JSON.stringify(result.data || result.raw, null, 2));
}

verifySent();
