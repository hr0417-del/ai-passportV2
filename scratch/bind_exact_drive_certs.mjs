import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { certDBData } from './certificateDB.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mapData = JSON.parse(fs.readFileSync(path.join(__dirname, 'drive_certs_map.json'), 'utf8'));

// Name substring / regex rules to map participant name -> drive filename
function findDriveFileForName(name) {
  const n = name.toLowerCase().trim();
  
  if (n.includes('gaurav')) return mapData['DR GAURAV.png'];
  if (n.includes('lavi')) return mapData['lavi.png'];
  if (n.includes('onila')) return mapData['onlila.png'];
  if (n.includes('dola')) return mapData['Dola.png'];
  if (n.includes('suman')) return mapData['SUMAN.png'];
  if (n.includes('ankit')) return mapData['Ankit Singh.png'];
  if (n.includes('neetu')) return mapData['NEETU.png'];
  if (n.includes('poonam')) return mapData['POONAM.png'];
  if (n.includes('praseetha')) return mapData['PRASEETHA.png'];
  if (n.includes('manisha sharma')) return mapData['Manisha Sharma.png'];
  if (n.includes('manisha')) return mapData['Manisha.png'] || mapData['Manisha Sharma.png'];
  if (n.includes('sona')) return mapData['SONA.png'];
  if (n.includes('rohit')) return mapData['Rohit.png'];
  if (n.includes('rashmi')) return mapData['RASHMI.png'];
  if (n.includes('harshit')) return mapData['HARSHIT.png'];
  if (n.includes('saranya')) return mapData['S SARANYA.png'];
  if (n.includes('reshmi')) return mapData['RESHMI K.png'];
  if (n.includes('ummul')) return mapData['UMMUL.png'];
  if (n.includes('roopali')) return mapData['ROOPALI.png'];
  if (n.includes('mehvish')) return mapData['MEHVISH.png'];
  if (n.includes('samia')) return mapData['SAMIA.png'];
  if (n.includes('deep')) return mapData['DEEP.png'];
  if (n.includes('gayathri')) return mapData['Gayathri.png'];
  if (n.includes('subramanian')) return mapData['S SUBRAMANIAN.png'];
  if (n.includes('moorthy')) return mapData['Moorthy A.png'];
  if (n.includes('pooja')) return mapData['Pooja.png'];
  if (n.includes('suruchi')) return mapData['Suruchi.png'];
  if (n.includes('sangeeta') || n.includes('sangeetha')) return mapData['Sangeetha.png'];
  if (n.includes('sandeep')) return mapData['Sandeep.png'];
  if (n.includes('meenu')) return mapData['Meenu.png'];
  if (n.includes('vijay')) return mapData['Vijay Kumar.png'];
  if (n.includes('chand')) return mapData['Chand.png'];
  if (n.includes('bibek')) return mapData['Bibek.png'];
  if (n.includes('jaya')) return mapData['K jaya.png'];
  if (n.includes('aiswarya')) return mapData['Aiswarya.png'];
  if (n.includes('vibhuti')) return mapData['Vibhuti.png'];
  if (n.includes('athira')) return mapData['Athira.png'];
  if (n.includes('imran')) return mapData['IMRAN AHMAD.png'];
  if (n.includes('samgeetha')) return mapData['SAMGEETHA.png'];
  if (n.includes('zenia')) return mapData['ZENIA.png'];
  if (n.includes('roshani')) return mapData['ROSHANI.png'];
  if (n.includes('manjunath')) return mapData['Manjunath.png'];
  if (n.includes('elayarasan')) return mapData['Elayarasan.png'];
  if (n.includes('rafia')) return mapData['Rafia.png'];
  if (n.includes('hema')) return mapData['HEMA.png'];

  return null;
}

const updatedDB = {};
let mappedCount = 0;
let totalEntries = 0;

for (const key in certDBData) {
  totalEntries++;
  const record = { ...certDBData[key] };
  const driveFile = findDriveFileForName(record.name);
  if (driveFile) {
    record.certImage = `/certificates/${driveFile}`;
    mappedCount++;
  }
  updatedDB[key] = record;
}

console.log(`Mapped ${mappedCount} of ${totalEntries} DB keys to Google Drive Certificate files!`);

const fileContent = `export const certDBData = ${JSON.stringify(updatedDB, null, 2)};\nexport default certDBData;\n`;
fs.writeFileSync(path.join(__dirname, 'certificateDB.js'), fileContent);
console.log('Successfully updated certificateDB.js with default and named exports!');
