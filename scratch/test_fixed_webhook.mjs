import https from 'https';

const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbzn5hwbjhjAaeBWMBjPvv5ZJsCxExVxo269GmEDHtsZrsEzFfX2mbjMzxR1-vcDGgg/exec';

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

async function testPost() {
  console.log('Sending test POST to verify active sheet write...');
  const testRegistration = {
    fullname: "Live Test Verification",
    email: "verification_test_" + Date.now() + "@aipassport.org",
    mobile: "9876543210",
    role: "School Teacher",
    use_case: "Verification Test",
    city: "New Delhi"
  };

  try {
    const res = await postJson(WEBHOOK_URL, testRegistration);
    console.log('Webhook Response Status:', res.status);
    console.log('Webhook Response Data:', res.data || res.body);
  } catch(e) {
    console.error('Error posting to webhook:', e.message);
  }
}

testPost();
