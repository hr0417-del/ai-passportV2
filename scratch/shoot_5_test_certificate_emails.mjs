import https from 'https';

const webhookUrl = 'https://script.google.com/macros/s/AKfycbxbqCYYHT3fone_pcnbAnUG_U2wAbU3HlCtbM-JzQui7jB0pMOixrePbStmmJAag9yy/exec';

const testSamples = [
  { name: "Dr Gaurav Kumar Singh", certId: "AIP-2026-0287", certImg: "certificates/2.png" },
  { name: "Lavi", certId: "AIP-2026-0279", certImg: "certificates/34.png" },
  { name: "Onila Mishra", certId: "AIP-2026-0666", certImg: "certificates/4.png" },
  { name: "Bibek Kumar Barnwal", certId: "AIP-2026-0284", certImg: "certificates/34.png" },
  { name: "UMMUL HAIRA K A", certId: "AIP-2026-0397", certImg: "certificates/16.png" }
];

function sendPost(payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const url = new URL(webhookUrl);
    const req = https.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(body));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function run() {
  console.log("Shooting 5 test certificate emails to hr0417@gmail.com with action=sendCert...");
  for (let i = 0; i < testSamples.length; i++) {
    const item = testSamples[i];
    const payload = {
      action: "sendCert",
      type: "certificate",
      fullname: item.name,
      email: "hr0417@gmail.com",
      passportId: item.certId,
      certImage: item.certImg,
      role: "School Teacher",
      source: "20 Sept Webinar Certificate Campaign"
    };

    try {
      const res = await sendPost(payload);
      console.log(`[Dispatched ${i+1}/5] ${item.name} (${item.certId}) => Response:`, res.substring(0, 100));
    } catch(err) {
      console.error(`[Error ${i+1}/5] ${item.name}:`, err.message);
    }
  }
}

run();
