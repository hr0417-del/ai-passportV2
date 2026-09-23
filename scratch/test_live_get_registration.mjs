import https from 'https';

const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbxbqCYYHT3fone_pcnbAnUG_U2wAbU3HlCtbM-JzQui7jB0pMOixrePbStmmJAag9yy/exec';

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        console.log(`Following redirect to ${res.headers.location}...`);
        return fetchUrl(res.headers.location).then(resolve).catch(reject);
      }
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch(e) {
          resolve({ status: res.statusCode, body });
        }
      });
    }).on('error', reject);
  });
}

async function runTestRegistration() {
  const timestamp = Date.now();
  const testEmail = `test.educator.${timestamp}@example.com`;
  const testMobile = `98765${timestamp.toString().slice(-5)}`;
  
  const testUrl = `${WEBHOOK_URL}?action=register&fullname=${encodeURIComponent('Test Educator 2Oct')}&email=${encodeURIComponent(testEmail)}&mobile=${encodeURIComponent(testMobile)}&role=${encodeURIComponent('School Teacher')}&use_case=${encodeURIComponent('Lesson Planning')}&source=${encodeURIComponent('Live Test Script')}`;

  console.log(`Sending GET Test Registration to:\n${testUrl}\n`);

  try {
    const res = await fetchUrl(testUrl);
    console.log('=== WEBHOOK RESPONSE ===');
    console.log(JSON.stringify(res, null, 2));
  } catch(err) {
    console.error('Error running test registration:', err);
  }
}

runTestRegistration();
