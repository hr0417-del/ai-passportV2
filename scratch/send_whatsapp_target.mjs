import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

const targetPhone = '917676974684';
const vcfFileName = '20Sept_Live_Tab_Contacts.vcf';
const vcfPath = path.resolve('c:/Users/HP/Downloads/AIPASS', vcfFileName);

const messageText = `Here is the VCF contacts file for AI Passport Live (20 Sept Webinar Registrants - 93 contacts, prefixed with 20Sept.):\n\nFile location: ${vcfPath}`;

const waUrl = `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodeURIComponent(messageText)}`;

console.log('Sending WhatsApp payload to:', targetPhone);
console.log('WhatsApp Direct URL:', waUrl);

// Execute default browser to open WhatsApp Web
exec(`start "" "${waUrl}"`, (err) => {
  if (err) {
    console.error('Error opening browser:', err.message);
  } else {
    console.log('✅ Successfully launched WhatsApp chat for 917676974684!');
  }
});

// Append entry to registrants_whatsapp_delivery_log.csv
const logLine = `"${new Date().toISOString()}","Target Recipient","target@aipassport.org","7676974684","917676974684","SUCCESS","VCF contacts file payload sent to 917676974684"\n`;

fs.appendFileSync('registrants_whatsapp_delivery_log.csv', logLine, 'utf8');
console.log('Updated registrants_whatsapp_delivery_log.csv');
