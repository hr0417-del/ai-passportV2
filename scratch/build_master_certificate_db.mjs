import fs from 'fs';
import path from 'path';

// Read 52 Sept 20 records
const sept20Records = JSON.parse(fs.readFileSync('scratch/sept20_51_records.json', 'utf8'));

// Read 74 Oct 2 records
const oct2Records = JSON.parse(fs.readFileSync('scratch/ocr_74_verified_records.json', 'utf8'));

const masterList = [];

// Process Sept 20 records
sept20Records.forEach((r, idx) => {
  masterList.push({
    id: `SEPT20_${idx + 1}`,
    name: r.name ? r.name.trim() : '',
    certId: r.certId ? r.certId.trim().toUpperCase() : '',
    certImage: r.certImage ? r.certImage.trim() : '',
    event: r.event || "AI Passport Live – National Webinar Series for Educators",
    date: r.date || "20 September 2026",
    email: r.email ? r.email.trim() : ''
  });
});

// Process Oct 2 records
oct2Records.forEach((r) => {
  masterList.push({
    id: `OCT2_${r.imgNum}`,
    name: r.name ? r.name.trim() : '',
    certId: r.certId ? r.certId.trim().toUpperCase() : '',
    certImage: `/certificates/${r.imageFile}`,
    event: "AI Passport Live – National Webinar Series for Educators",
    date: "02 October 2026",
    email: ''
  });
});

console.log(`Total Master Certificate Records: ${masterList.length}`);

// Now build certDBData dictionary for lookup compatibility
const certDBData = {};

masterList.forEach((rec) => {
  const certIdKey = rec.certId; // e.g. AIP-2026-0533
  const numKey = certIdKey.replace(/^AIP-2026-/, ''); // e.g. 0533
  const cleanNumKey = numKey.replace(/^0+/, '') || '0'; // e.g. 533

  // Store under full certId
  if (!certDBData[certIdKey]) {
    certDBData[certIdKey] = rec;
  } else if (Array.isArray(certDBData[certIdKey])) {
    certDBData[certIdKey].push(rec);
  } else {
    certDBData[certIdKey] = [certDBData[certIdKey], rec];
  }

  // Store under padded 4-digit key (e.g. "0533")
  if (numKey) {
    if (!certDBData[numKey]) {
      certDBData[numKey] = rec;
    } else if (Array.isArray(certDBData[numKey])) {
      certDBData[numKey].push(rec);
    } else {
      certDBData[numKey] = [certDBData[numKey], rec];
    }
  }

  // Store under unpadded number key (e.g. "533")
  if (cleanNumKey && cleanNumKey !== numKey) {
    if (!certDBData[cleanNumKey]) {
      certDBData[cleanNumKey] = rec;
    } else if (Array.isArray(certDBData[cleanNumKey])) {
      certDBData[cleanNumKey].push(rec);
    } else {
      certDBData[cleanNumKey] = [certDBData[cleanNumKey], rec];
    }
  }

  // Store under name key (e.g. "s badarimani")
  if (rec.name) {
    const nameKey = rec.name.toLowerCase().trim();
    if (!certDBData[nameKey]) {
      certDBData[nameKey] = rec;
    } else if (Array.isArray(certDBData[nameKey])) {
      certDBData[nameKey].push(rec);
    } else {
      certDBData[nameKey] = [certDBData[nameKey], rec];
    }
  }

  // Store under email key if available
  if (rec.email) {
    const emailKey = rec.email.toLowerCase().trim();
    certDBData[emailKey] = rec;
  }
});

// Format JS file content
const jsContent = `/* ==========================================================================
   AI PASSPORT™ — MASTER VERIFIED CERTIFICATE DATABASE
   Total Verified Certificates: ${masterList.length} (52 Sept 2026 + 74 Oct 2026)
   Strict Source of Truth: Physical Certificate PNG Files & OCR Verification
   ========================================================================== */

export const masterCertList = ${JSON.stringify(masterList, null, 2)};

export const certDBData = ${JSON.stringify(certDBData, null, 2)};

export default certDBData;
`;

fs.writeFileSync('scratch/certificateDB.js', jsContent);
console.log('Successfully generated scratch/certificateDB.js!');
