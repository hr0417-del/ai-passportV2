import fs from 'fs';

const rows = JSON.parse(fs.readFileSync('scratch/dashboard_tab_data.json', 'utf8'));

console.log(`Total Rows in Dashboard Tab: ${rows.length}`);
rows.forEach((r, idx) => {
  console.log(`Row ${idx}:`, r);
});
