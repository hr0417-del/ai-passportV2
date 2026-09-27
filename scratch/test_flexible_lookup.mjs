import fs from 'fs';

const certDB = JSON.parse(fs.readFileSync('c:\\Users\\HP\\Downloads\\AIPASS\\scratch\\certificateDB.json', 'utf8'));

function findCertificate(query) {
  if (!query || !query.trim()) return null;
  const q = query.trim().toLowerCase();
  const qDigits = q.replace(/\D/g, '');

  // 1. Direct key match (e.g. AIP-2026-0279)
  const upperQ = q.toUpperCase();
  if (certDB[upperQ]) return certDB[upperQ];

  // 2. Search through all entries
  const entries = Object.entries(certDB);

  for (const [key, record] of entries) {
    const keyClean = key.toLowerCase().replace(/[^a-z0-9]/g, '');
    const qClean = q.replace(/[^a-z0-9]/g, '');
    
    // Key match normalized (e.g. AIP20260279)
    if (keyClean === qClean || (qClean.length >= 3 && keyClean.endsWith(qClean))) {
      return record;
    }

    // Name match (e.g. "Lavi", "Priti Sinha")
    if (record.name && record.name.toLowerCase().includes(q)) {
      return record;
    }

    // Email match (e.g. "lavi9014@gmail.com")
    if (record.email && record.email.toLowerCase().includes(q)) {
      return record;
    }

    // Mobile / ID digits match (e.g. "279", "0279")
    if (qDigits && qDigits.length >= 3) {
      const keyDigits = key.replace(/\D/g, '');
      if (keyDigits.endsWith(qDigits)) {
        return record;
      }
    }
  }

  return null;
}

// Test cases
console.log("Query 'AIP-2026-0279':", findCertificate("AIP-2026-0279")?.name);
console.log("Query 'lavi':", findCertificate("lavi")?.name);
console.log("Query 'lavi9014@gmail.com':", findCertificate("lavi9014@gmail.com")?.name);
console.log("Query '279':", findCertificate("279")?.name);
console.log("Query 'priti':", findCertificate("priti")?.name);
console.log("Query 'varsha':", findCertificate("varsha")?.name);
