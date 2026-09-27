import { certDBData } from './certificateDB.js';

console.log('Total indexed database records:', Object.keys(certDBData).length);

function findCertificateRecord(query) {
  if (!query || !query.trim()) return null;
  const q = query.trim().toLowerCase();
  const qDigits = q.replace(/\D/g, '');
  const upperQ = q.toUpperCase();

  if (certDBData[upperQ]) return { certId: upperQ, record: certDBData[upperQ] };
  if (certDBData[q]) return { certId: q, record: certDBData[q] };
  if (qDigits && certDBData[qDigits]) return { certId: qDigits, record: certDBData[qDigits] };

  const entries = Object.entries(certDBData);
  for (const [key, record] of entries) {
    const keyClean = key.toLowerCase().replace(/[^a-z0-9]/g, '');
    const qClean = q.replace(/[^a-z0-9]/g, '');

    if (keyClean === qClean || (qClean.length >= 1 && keyClean.endsWith(qClean))) return { certId: key, record };
    if (record.name && record.name.toLowerCase().includes(q)) return { certId: key, record };
    if (record.email && record.email.toLowerCase().includes(q)) return { certId: key, record };
    if (qDigits && qDigits.length >= 1) {
      const keyDigits = key.replace(/\D/g, '');
      if (keyDigits.endsWith(qDigits) || keyDigits.replace(/^2026/, '').endsWith(qDigits)) return { certId: key, record };
    }
  }
  return null;
}

const testQueries = ['AIP-2026-0279', 'Lavi', '279', 'dr gaurav', 'ankit', 'AIP-9999-9999', 'unknown_person@gmail.com'];

testQueries.forEach(q => {
  const match = findCertificateRecord(q);
  if (match) {
    console.log(`[PASS] Search '${q}' -> MATCH FOUND (${match.certId}): ${match.record.name} | Image: ${match.record.certImage}`);
  } else {
    console.log(`[FAIL/EXPECTED] Search '${q}' -> CERTIFICATE NOT VERIFIED`);
  }
});
