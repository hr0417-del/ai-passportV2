import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { certDBData } from './certificateDB.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read map of valid local bulk 1 certificates
const localMap = JSON.parse(fs.readFileSync(path.join(__dirname, 'local_certs_map.json'), 'utf8'));

// Set of 43 valid file basenames
const validLocalFiles = new Set(Object.values(localMap));

console.log('Valid Local Bulk Certificate Files count:', validLocalFiles.size);

const strictDB = {};
let matchedKeys = 0;
let totalKeys = 0;

for (const key in certDBData) {
  totalKeys++;
  const record = { ...certDBData[key] };
  const imageFilename = record.certImage ? record.certImage.split('/').pop() : '';

  if (validLocalFiles.has(imageFilename)) {
    strictDB[key] = record;
    matchedKeys++;
  }
}

console.log(`Local Bulk 1 Filter Result: Kept ${matchedKeys} lookup keys matching the 43 local bulk certificate files. Filtered out ${totalKeys - matchedKeys} non-bulk keys.`);

const fileContent = `export const certDBData = ${JSON.stringify(strictDB, null, 2)};\nexport default certDBData;\n`;
fs.writeFileSync(path.join(__dirname, 'certificateDB.js'), fileContent);
console.log('Successfully updated certificateDB.js with Local Bulk 1 Certificates as SOLE SOURCE OF TRUTH!');
