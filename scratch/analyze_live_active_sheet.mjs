import fs from 'fs';

const csvContent = fs.readFileSync('scratch/live_active_sheet.csv', 'utf8');
const lines = csvContent.split('\n').filter(l => l.trim().length > 0);

const headers = lines[0].split(',');
console.log('Headers:', headers);

const rows = [];
let sept14Onwards = [];
const roles = {};

for (let i = 1; i < lines.length; i++) {
  // Simple CSV parser handling quotes
  const row = [];
  let inQuotes = false;
  let currentVal = '';
  for (let char of lines[i]) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      row.push(currentVal.trim());
      currentVal = '';
    } else {
      currentVal += char;
    }
  }
  row.push(currentVal.trim());

  const timestamp = row[0];
  const name = row[1];
  const email = row[2];
  const mobile = row[3];
  const role = row[4] || 'Unspecified';
  const passportId = row[7] || row[1] || '';

  rows.push({ timestamp, name, email, mobile, role, passportId });

  // Role stats
  roles[role] = (roles[role] || 0) + 1;

  // Check timestamp (Format: DD/MM/YYYY HH:mm:ss or similar)
  // Check if starts with 14/09/2026, 15/09/2026, 16/09/2026, 17/09/2026, 18/09/2026
  if (timestamp.startsWith('14/09/2026') || 
      timestamp.startsWith('15/09/2026') || 
      timestamp.startsWith('16/09/2026') || 
      timestamp.startsWith('17/09/2026') || 
      timestamp.startsWith('18/09/2026')) {
    sept14Onwards.push({ timestamp, name, email, mobile, role, passportId });
  }
}

console.log(`\n========================================`);
console.log(`TOTAL LIVE REGISTRATIONS IN SHEET: ${rows.length}`);
console.log(`REGISTRATIONS FROM 14 SEPT TO PRESENT: ${sept14Onwards.length}`);
console.log(`========================================\n`);

console.log('--- Role Breakdown Across All Live Registrations ---');
console.table(roles);

console.log('\n--- Sample Registrations from 14 Sept Onwards (Total: ' + sept14Onwards.length + ') ---');
console.table(sept14Onwards.slice(-15));
