import fs from 'fs';
import path from 'path';

function parseCSVLine(line) {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += char;
    }
  }
  result.push(cur.trim());
  return result;
}

const csvPath = 'c:\\Users\\HP\\Downloads\\AIPASS\\scratch\\tab_20_sept_live.csv';
const csvContent = fs.readFileSync(csvPath, 'utf8');
const lines = csvContent.split('\n').filter(l => l.trim().length > 0);

const header = parseCSVLine(lines[0]);
console.log("Header columns:", header);

const nameIdx = header.indexOf('Full Name');
const emailIdx = header.indexOf('Email');
const pidIdx = header.indexOf('AI Passport ID');
const roleIdx = header.indexOf('Role');

console.log(`Indices -> Name: ${nameIdx}, Email: ${emailIdx}, PID: ${pidIdx}, Role: ${roleIdx}`);

const records = {};
let matchedCount = 0;

for (let i = 1; i < lines.length; i++) {
  const cleanRow = parseCSVLine(lines[i]);
  const name = cleanRow[nameIdx];
  const email = cleanRow[emailIdx];
  const passportId = cleanRow[pidIdx];
  const role = cleanRow[roleIdx] || 'Educator';
  
  if (passportId && passportId.startsWith('AIP-') && name) {
    matchedCount++;
    const certNum = matchedCount <= 48 ? matchedCount : ((matchedCount % 48) || 1);
    
    const entry = {
      name: name.toUpperCase(),
      email: email,
      role: role,
      level: "LEVEL 1 – AI EXPLORER",
      event: "AI Passport Live – National Webinar for Educators",
      eventSub: "◆ Preparing the Teacher for Viksit Bharat ◆",
      type: "CERTIFICATE OF PARTICIPATION",
      date: "20 September 2026",
      signatory: "Hitesh Rathee & Nishant Singh Lakra",
      description: `Official Certificate of Participation awarded to ${name} (${role}) for completing the AI Passport Live™ National Webinar on 20 September 2026. Verified on public ledger.`,
      certImage: `/certificates/${certNum}.png`
    };
    
    // Store in uppercase without spaces
    const cleanPid = passportId.trim().toUpperCase();
    records[cleanPid] = entry;
    
    // Also store formatted variation AIP-L1-2026-XXXX
    if (cleanPid.startsWith('AIP-2026-')) {
      const altId = cleanPid.replace('AIP-2026-', 'AIP-L1-2026-');
      records[altId] = entry;
    }
  }
}

console.log(`Successfully parsed ${matchedCount} valid attendee rows.`);
console.log(`Total database keys generated: ${Object.keys(records).length}`);

// Check specific IDs
console.log("Checking AIP-2026-0279:", records["AIP-2026-0279"]);
console.log("Checking AIP-2026-0261:", records["AIP-2026-0261"]);

fs.writeFileSync('c:\\Users\\HP\\Downloads\\AIPASS\\scratch\\certificateDB.json', JSON.stringify(records, null, 2));
console.log("Updated certificateDB.json successfully.");
