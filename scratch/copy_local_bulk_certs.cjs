const fs = require('fs');
const path = require('path');

const srcDir = 'C:\\Users\\HP\\Downloads\\(Bulk 1) AI PASSPORT LIVE CERTIFICATE 20 SEPT 2026 (1)';
const destDir = path.join(__dirname, '..', 'public', 'certificates');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const files = fs.readdirSync(srcDir);
console.log(`Found ${files.length} original certificate files in local folder.`);

const mapData = {};

files.forEach((file, index) => {
  const srcPath = path.join(srcDir, file);
  const cleanTitle = file.trim();
  const safeFilename = cleanTitle.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_') + '.png';
  const destPath = path.join(destDir, safeFilename);

  fs.copyFileSync(srcPath, destPath);
  const stat = fs.statSync(destPath);
  console.log(`[${index + 1}/${files.length}] Copied ${cleanTitle} -> ${safeFilename} (${(stat.size / 1024 / 1024).toFixed(2)} MB)`);
  mapData[cleanTitle] = safeFilename;
});

fs.writeFileSync(path.join(__dirname, 'local_certs_map.json'), JSON.stringify(mapData, null, 2));
console.log('Successfully copied all original local certificates!');
