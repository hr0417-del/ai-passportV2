import https from 'https';

const NEW_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbyc6SJB1Qf0x_OjoGw6Qy6rz38aMXwotYtKERw9lPGeslwPdoGOUpURLHBNCZ_iZmB_xg/exec';

function postJson(url, data) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const req = https.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        console.log(`Following redirect to ${res.headers.location}...`);
        return postJson(res.headers.location, data).then(resolve).catch(reject);
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
    req.write(payload);
    req.end();
  });
}

async function testNewPost() {
  console.log('Sending test POST to NEW Web App URL...');
  const testReg = {
    fullname: "New Endpoint Verification Test",
    email: "new_endpoint_test_" + Date.now() + "@aipassport.org",
    mobile: "9998881112",
    role: "School Teacher",
    use_case: "New Endpoint Test",
    city: "New Delhi"
  };

  try {
    const res = await postJson(NEW_WEBHOOK_URL, testReg);
    console.log('✅ Response Status:', res.status);
    console.log('✅ Response Data:', res.data || res.body);
  } catch(e) {
    console.error('❌ Error posting to new webhook:', e.message);
  }
}

testNewPost();
