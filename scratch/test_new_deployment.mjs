import https from 'https';
import querystring from 'querystring';

const NEW_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbxbqCYYHT3fone_pcnbAnUG_U2wAbU3HlCtbM-JzQui7jB0pMOixrePbStmmJAag9yy/exec';

function postFormData(url, data) {
  return new Promise((resolve, reject) => {
    const postData = querystring.stringify(data);
    const req = https.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        console.log(`Following redirect to ${res.headers.location}...`);
        return postFormData(res.headers.location, data).then(resolve).catch(reject);
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
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function testNewDeployment() {
  console.log('Testing NEW Web App Deployment URL...');
  const testReg = {
    fullname: 'Test Educator 2Oct',
    email: 'test.educator.2oct@example.com',
    mobile: '9876543210',
    role: 'School Teacher',
    use_case: 'Lesson Planning',
    source: 'Deployment Test Script'
  };

  try {
    const response = await postFormData(NEW_WEBHOOK_URL, testReg);
    console.log('=== WEBHOOK RESPONSE ===');
    console.log(JSON.stringify(response, null, 2));
  } catch (err) {
    console.error('Error testing webhook:', err);
  }
}

testNewDeployment();
