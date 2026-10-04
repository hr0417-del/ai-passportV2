import fs from 'fs';

const lines = fs.readFileSync('scratch/ocr_native_results.txt', 'utf8').split('\n').filter(Boolean);

const ocrRecords = [];

lines.forEach((line) => {
  const parts = line.split('||');
  if (parts.length < 2) return;
  const imgNum = parseInt(parts[0].trim());
  const fullText = parts[1].trim();

  // Extract Name after 'PRESENTED TO' and before 'For participating'
  let name = "";
  const nameMatch = fullText.match(/PRESENTED TO\s+([A-Za-z.\s]+?)\s+For participating/i);
  if (nameMatch) {
    name = nameMatch[1].trim();
  }

  // Extract Passport ID e.g. AIP-2026-0533 or MP-2026-0517
  let certId = "";
  const idMatch = fullText.match(/(?:AIP|MP)-2026-\d{4}/i);
  if (idMatch) {
    certId = idMatch[0].toUpperCase().replace(/^MP-/, 'AIP-');
  }

  ocrRecords.push({
    imgNum,
    imageFile: `2_oct_${imgNum}.png`,
    name,
    certId,
    rawText: fullText
  });
});

console.log("Total OCR records parsed:", ocrRecords.length);
console.log("\nSample Parsed OCR Records (1 to 20):");
ocrRecords.slice(0, 20).forEach(r => {
  console.log(`Image ${r.imgNum}.png -> Name: '${r.name}' | ID: '${r.certId}'`);
});

fs.writeFileSync('scratch/ocr_74_verified_records.json', JSON.stringify(ocrRecords, null, 2));
