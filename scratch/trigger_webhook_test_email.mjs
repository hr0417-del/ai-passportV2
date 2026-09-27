import https from 'https';

const webhookUrl = 'https://script.google.com/macros/s/AKfycbxbqCYYHT3fone_pcnbAnUG_U2wAbU3HlCtbM-JzQui7jB0pMOixrePbStmmJAag9yy/exec';

const payload = JSON.stringify({
  action: "register",
  fullname: "Educator / Tester",
  email: "hr0417@gmail.com",
  mobile: "9999988888",
  role: "School Teacher",
  organization: "Ekaakshar Education Test",
  source: "Test Verification Webhook"
});

function postData(urlStr, data) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const req = https.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return postData(res.headers.location, data).then(resolve).catch(reject);
      }
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(body));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

console.log("Triggering registration webhook for hr0417@gmail.com...");
postData(webhookUrl, payload)
  .then(res => console.log("✅ Webhook Response:", res))
  .catch(err => console.error("❌ Webhook Error:", err));
