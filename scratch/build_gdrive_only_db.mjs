import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { certDBData } from './certificateDB.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read map of valid drive certificates
const mapData = JSON.parse(fs.readFileSync(path.join(__dirname, 'drive_certs_map.json'), 'utf8'));

// List of all 45 valid downloaded Drive filename basenames
const validDriveFiles = new Set(Object.values(mapData));

console.log('Valid Google Drive Certificate Files:', Array.from(validDriveFiles));

const driveOnlyDB = {};
let validCount = 0;
let rejectedCount = 0;

for (const key in certDBData) {
  const record = certDBData[key];
  // Check if certImage is one of the valid downloaded drive files (ends with _png.png)
  const imageFilename = record.certImage ? record.certImage.split('/').pop() : '';
  
  if (validDriveFiles.has(imageFilename)) {
    driveOnlyDB[key] = record;
    validCount++;
  } else {
    rejectedCount++;
  }
}

console.log(`GDrive Strict Filter Result: Kept ${validCount} lookup keys corresponding ONLY to Google Drive files. Filtered out ${rejectedCount} non-GDrive keys.`);

const fileContent = `export const certDBData = ${JSON.stringify(driveOnlyDB, null, 2)};\nexport default certDBData;\n`;
fs.writeFileSync(path.join(__dirname, 'certificateDB.js'), fileContent);
console.log('Successfully updated certificateDB.js with STRICT GOOGLE DRIVE ONLY database!');
