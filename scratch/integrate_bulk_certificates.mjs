import fs from 'fs';
import path from 'path';

const sourceDir = 'C:\\Users\\HP\\Downloads\\(Bulk 1) AI PASSPORT LIVE CERTIFICATE 20 SEPT 2026';
const targetDir = 'c:\\Users\\HP\\Downloads\\AIPASS\\public\\certificates';

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Copy PNG files to public/certificates
const files = fs.readdirSync(sourceDir).filter(f => f.endsWith('.png'));
console.log(`Found ${files.length} certificate files in bulk folder.`);

files.forEach(file => {
  const srcPath = path.join(sourceDir, file);
  const destPath = path.join(targetDir, file);
  fs.copyFileSync(srcPath, destPath);
});
console.log(`Copied ${files.length} certificates to ${targetDir}`);

// Read tab_20_sept_live.csv
const csvPath = 'c:\\Users\\HP\\Downloads\\AIPASS\\scratch\\tab_20_sept_live.csv';
const csvContent = fs.readFileSync(csvPath, 'utf8');
const lines = csvContent.split('\n').filter(l => l.trim().length > 0);

// Parse CSV header
const header = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
const nameIdx = header.indexOf('Full Name');
const emailIdx = header.indexOf('Email');
const pidIdx = header.indexOf('AI Passport ID');
const roleIdx = header.indexOf('Role');

const records = {};

for (let i = 1; i < lines.length; i++) {
  const row = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
  const cleanRow = row.map(cell => cell.replace(/^"|"$/g, '').trim());
  
  const name = cleanRow[nameIdx];
  const email = cleanRow[emailIdx];
  const passportId = cleanRow[pidIdx];
  const role = cleanRow[roleIdx] || 'Educator';
  
  if (passportId && name) {
    // Map standard format AIP-2026-0XXX
    const entry = {
      name: name.toUpperCase(),
      email: email,
      role: role,
      level: "LEVEL 1 – AI EXPLORER",
      event: "AI Passport Live – National Webinar for Educators",
      eventSub: "◆ Preparing the Teacher for Viksit Bharat ◆",
      type: "CERTIFICATE OF PARTICIPATION",
      date: "20 September 2026",
      signatory: "Hitesh Rathee & Nishant Singh Lakra",
      description: `Official Certificate of Participation awarded to ${name} (${role}) for completing the AI Passport Live™ National Webinar on 20 September 2026. Verified on public ledger.`,
      certImage: `/certificates/${i <= 48 ? i + '.png' : '1.png'}`
    };
    
    records[passportId] = entry;
    // Also support formatted variation AIP-L1-2026-XXXX
    const altId = passportId.replace('AIP-2026-', 'AIP-L1-2026-');
    records[altId] = entry;
  }
}

console.log(`Generated ${Object.keys(records).length} verification records.`);

// Write records to JSON file for reference
fs.writeFileSync('c:\\Users\\HP\\Downloads\\AIPASS\\scratch\\certificateDB.json', JSON.stringify(records, null, 2));
console.log('Saved certificateDB.json successfully.');
