import { certDBData } from './certificateDB.js';

const certificateDB = { ...certDBData };
const keys = Object.keys(certificateDB);

console.log("Total database keys:", keys.length);

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

    if (keyClean === qClean || (qClean.length >= 1 && keyClean.endsWith(qClean))) {
      return { certId: key, record };
    }

    if (record.name && record.name.toLowerCase().includes(q)) {
      return { certId: key, record };
    }

    if (record.email && record.email.toLowerCase().includes(q)) {
      return { certId: key, record };
    }

    if (qDigits && qDigits.length >= 1) {
      const keyDigits = key.replace(/\D/g, '');
      if (keyDigits.endsWith(qDigits) || keyDigits.replace(/^2026/, '').endsWith(qDigits)) {
        return { certId: key, record };
      }
    }
  }
  return null;
}

// Extract all numbers from keys
const numberTests = new Set();
keys.forEach(k => {
  const digits = k.replace(/\D/g, '');
  numberTests.add(digits);
  const without2026 = digits.replace(/^2026/, '');
  if (without2026) numberTests.add(without2026);
  const trimmedZeros = without2026.replace(/^0+/, '');
  if (trimmedZeros) numberTests.add(trimmedZeros);
});

console.log(`Testing ${numberTests.size} numeric variations...`);
let passed = 0;
let failed = 0;
const failedList = [];

numberTests.forEach(numStr => {
  const res = findCertificateRecord(numStr);
  if (res) {
    passed++;
  } else {
    failed++;
    failedList.push(numStr);
  }
});

console.log(`Numeric Search Test Results: Passed=${passed}, Failed=${failed}`);
if (failedList.length > 0) {
  console.log("Failed numbers:", failedList);
}
