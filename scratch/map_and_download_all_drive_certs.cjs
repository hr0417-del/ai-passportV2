const https = require('https');
const fs = require('fs');
const path = require('path');

const certsMeta = JSON.parse(fs.readFileSync('scratch/certs_drive_titles.json', 'utf8'));

const targetDir = path.join(__dirname, '..', 'public', 'certificates');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

function downloadFile(fileId, targetPath) {
  return new Promise((resolve, reject) => {
    const url = `https://lh3.googleusercontent.com/d/${fileId}`;
    const handleStream = (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        https.get(res.headers.location, handleStream).on('error', reject);
      } else if (res.statusCode === 200) {
        const file = fs.createWriteStream(targetPath);
        res.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      } else {
        reject(new Error(`HTTP Status ${res.statusCode} for ${fileId}`));
      }
    };
    https.get(url, handleStream).on('error', reject);
  });
}

async function run() {
  console.log(`Starting download of ${certsMeta.length} certificate files from Google Drive...`);
  
  const mapData = {};

  for (let i = 0; i < certsMeta.length; i++) {
    const item = certsMeta[i];
    const cleanTitle = item.title.trim();
    // Create clean file basename, e.g. "ankit_singh.png" or "lavi.png"
    const safeFilename = cleanTitle.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_') + '.png';
    const destPath = path.join(targetDir, safeFilename);

    try {
      await downloadFile(item.id, destPath);
      const stat = fs.statSync(destPath);
      console.log(`[${i+1}/${certsMeta.length}] Downloaded ${cleanTitle} -> ${safeFilename} (${(stat.size/1024).toFixed(1)} KB)`);
      mapData[cleanTitle] = safeFilename;
    } catch (err) {
      console.error(`Failed to download ${cleanTitle} (${item.id}):`, err.message);
    }
  }

  fs.writeFileSync(path.join(__dirname, 'drive_certs_map.json'), JSON.stringify(mapData, null, 2));
  console.log('Finished downloading all certificates from Google Drive!');
}

run();
