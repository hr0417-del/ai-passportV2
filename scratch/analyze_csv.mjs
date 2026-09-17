import fs from 'fs';

const content = fs.readFileSync('registrants_whatsapp_delivery_log.csv', 'utf8');
const lines = content.split('\n').filter(l => l.trim().length > 0);

console.log('Total entries in WhatsApp log:', lines.length - 1);

const stats = { SUCCESS: 0, FAILED: 0, SKIPPED: 0 };
const registrantsMap = new Map();

for (let i = 1; i < lines.length; i++) {
  const match = lines[i].match(/"([^"]*)"/g);
  if (match && match.length >= 6) {
    const name = match[1].replace(/"/g, '');
    const email = match[2].replace(/"/g, '');
    const phone = match[3].replace(/"/g, '');
    const status = match[5].replace(/"/g, '');
    
    stats[status] = (stats[status] || 0) + 1;
    registrantsMap.set(email || phone, { name, email, phone, status });
  }
}

console.log('Delivery Log Status Breakdown:', stats);
console.log('Unique Registrants in Log:', registrantsMap.size);
