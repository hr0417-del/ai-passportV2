import https from 'https';
import querystring from 'querystring';

const NEW_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbyc6SJB1Qf0x_OjoGw6Qy6rz38aMXwotYtKERw9lPGeslwPdoGOUpURLHBNCZ_iZmB_xg/exec';

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
        // For Google Apps Script 302 redirect, follow with GET or POST
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

async function testFormPost() {
  console.log('Sending Form UrlEncoded POST to NEW Web App URL...');
  const testReg = {
    fullname: "Form Post Test User",
    email: "formtest_" + Date.now() + "@aipassport.org",
    mobile: "9988776655",
    role: "School Teacher",
    use_case: "Form Post Test",
    city: "New Delhi"
  };

  try {
    const res = await postFormData(NEW_WEBHOOK_URL, testReg);
    console.log('Response Status:', res.status);
    console.log('Response Data:', res.data || res.body);
  } catch(e) {
    console.error('Error posting form data:', e.message);
  }
}

testFormPost();
