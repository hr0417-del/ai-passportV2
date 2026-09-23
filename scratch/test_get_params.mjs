import https from 'https';

const NEW_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbyc6SJB1Qf0x_OjoGw6Qy6rz38aMXwotYtKERw9lPGeslwPdoGOUpURLHBNCZ_iZmB_xg/exec';

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
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

async function testGetSubmit() {
  const query = `?action=register&fullname=TestParamSubmit&email=paramtest_${Date.now()}@aipassport.org&mobile=9876543210&role=School+Teacher&city=Delhi`;
  console.log('Testing GET parameters submission...');
  const res = await fetchUrl(NEW_WEBHOOK_URL + query);
  console.log('Response Status:', res.status);
  console.log('Response Data:', res.data || res.body);
}

testGetSubmit();
