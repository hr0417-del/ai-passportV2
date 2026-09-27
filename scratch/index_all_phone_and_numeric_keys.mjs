import fs from 'fs';
import { certDBData } from './certificateDB.js';

const updatedDB = { ...certDBData };

// 1. Index all numeric shortcuts for existing records
Object.keys(certDBData).forEach(key => {
  const rec = certDBData[key];
  const digits = key.replace(/\D/g, ''); // e.g. 20260279
  const numOnly = digits.replace(/^2026/, ''); // e.g. 0279
  const numTrimmed = numOnly.replace(/^0+/, ''); // e.g. 279

  if (numOnly) updatedDB[numOnly] = rec; // "0279"
  if (numTrimmed) updatedDB[numTrimmed] = rec; // "279"
  if (digits) updatedDB[digits] = rec; // "20260279"
});

// 2. Parse VCF files to index phone numbers
const vcfFiles = [
  '209_Contacts.vcf',
  '20Sept_AI_Passport_Contacts.vcf',
  '20Sept_Live_Tab_Contacts.vcf',
  '20Sept_Verified_Sent_Contacts.vcf'
];

let vcfPhoneCount = 0;

vcfFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    const cards = content.split('END:VCARD');
    cards.forEach(card => {
      let name = '';
      let phone = '';
      const fnMatch = card.match(/FN:(.+)/i);
      const telMatch = card.match(/TEL.*:(.+)/i);

      if (fnMatch) name = fnMatch[1].trim();
      if (telMatch) phone = telMatch[1].replace(/\D/g, '');

      if (name && phone) {
        // Find existing record for name
        const matchRec = Object.values(updatedDB).find(r => r.name && r.name.toLowerCase() === name.toLowerCase());
        if (matchRec) {
          matchRec.phone = phone;
          updatedDB[phone] = matchRec; // Direct phone lookup
          if (phone.length > 10) updatedDB[phone.slice(-10)] = matchRec; // 10-digit phone lookup
          vcfPhoneCount++;
        }
      }
    });
  }
});

// Write to JSON & JS
const jsonStr = JSON.stringify(updatedDB, null, 2);
fs.writeFileSync('./scratch/certificateDB.json', jsonStr, 'utf8');
fs.writeFileSync('./scratch/certificateDB.js', `export const certDBData = ${jsonStr};\nexport default certDBData;\n`, 'utf8');

console.log(`Indexed ${Object.keys(updatedDB).length} total keys (including ${vcfPhoneCount} phone numbers & all numeric shortcuts)!`);
