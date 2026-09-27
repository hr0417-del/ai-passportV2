import fs from 'fs';
import { certDBData } from './certificateDB.js';

console.log("Loaded total records:", Object.keys(certDBData).length);

// Test lookups
const queries = [
  "AIP-2026-0279",
  "279",
  "Lavi",
  "Priti Sinha",
  "lavi9014@gmail.com",
  "AIP-2026-0261"
];

const certificateDB = {
  ...certDBData
};

function findCertificateRecord(query) {
  if (!query || !query.trim()) return null;
  const q = query.trim().toLowerCase();
  const qDigits = q.replace(/\D/g, '');
  const upperQ = q.toUpperCase();

  if (certificateDB[upperQ]) {
    return { certId: upperQ, record: certificateDB[upperQ] };
  }

  const entries = Object.entries(certificateDB);
  for (const [key, record] of entries) {
    const keyClean = key.toLowerCase().replace(/[^a-z0-9]/g, '');
    const qClean = q.replace(/[^a-z0-9]/g, '');

    if (keyClean === qClean || (qClean.length >= 3 && keyClean.endsWith(qClean))) {
      return { certId: key, record };
    }

    if (record.name && record.name.toLowerCase().includes(q)) {
      return { certId: key, record };
    }

    if (record.email && record.email.toLowerCase().includes(q)) {
      return { certId: key, record };
    }

    if (qDigits && qDigits.length >= 3) {
      const keyDigits = key.replace(/\D/g, '');
      if (keyDigits.endsWith(qDigits)) {
        return { certId: key, record };
      }
    }
  }
  return null;
}

queries.forEach(q => {
  const result = findCertificateRecord(q);
  if (result) {
    console.log(`[PASS] Query '${q}' => Found ID: ${result.certId}, Name: ${result.record.name}, Image: ${result.record.certImage}`);
  } else {
    console.log(`[FAIL] Query '${q}' => NOT FOUND`);
  }
});
