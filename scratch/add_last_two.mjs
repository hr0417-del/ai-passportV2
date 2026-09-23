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
          resolve({ status: res.statusCode, raw: body });
        }
      });
    }).on('error', reject);
  });
}

const remaining = [
  { fullname: "Heena", email: "heena527@gmail.com", mobile: "8431894987", role: "School Teacher", use_case: "AI Skills Development" },
  { fullname: "Shilpi Mahendru", email: "shilpimahendru@gmail.com", mobile: "9822200786", role: "School Teacher", use_case: "Lesson Planning" }
];

async function addRemaining() {
  for (const item of remaining) {
    const queryParams = new URLSearchParams({
      action: 'register',
      fullname: item.fullname,
      email: item.email,
      mobile: item.mobile,
      role: item.role,
      organization: item.use_case,
      source: 'Dashboard Sync Final',
      skipEmail: 'true'
    }).toString();

    const res = await fetchUrl(`${NEW_WEBHOOK_URL}?${queryParams}`);
    console.log(`Result for ${item.fullname}:`, res.data || res.raw || res.status);
    await new Promise(r => setTimeout(r, 500));
  }
}

addRemaining();
