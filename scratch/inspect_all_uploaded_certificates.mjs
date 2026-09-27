import fs from 'fs';
import path from 'path';

const dirs = [
  'c:/Users/HP/Downloads/(Bulk 1) AI PASSPORT LIVE CERTIFICATE 20 SEPT 2026',
  './public/certificates',
  './FROM 82  AI PASSPORT ID',
  './new AI PASSPORT ID'
];

console.log("=== INSPECTING ALL UPLOADED CERTIFICATE DIRECTORIES ===");

dirs.forEach(d => {
  if (fs.existsSync(d)) {
    const files = fs.readdirSync(d).filter(f => f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.webp'));
    console.log(`\nDirectory: ${d}`);
    console.log(`- Total certificate images found: ${files.length}`);
    console.log(`- Sample filenames:`, files.slice(0, 10));
  } else {
    console.log(`\nDirectory NOT FOUND: ${d}`);
  }
});
