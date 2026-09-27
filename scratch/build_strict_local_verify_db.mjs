import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const bulkDir = 'C:\\Users\\HP\\Downloads\\(Bulk 1) AI PASSPORT LIVE CERTIFICATE 20 SEPT 2026 (1)';
const bulkFiles = fs.readdirSync(bulkDir);

console.log(`Found ${bulkFiles.length} files in local bulk directory.`);

// The 43 attendees mapping list with unique AI Passport IDs
const attendeeList = [
  { name: "Aiswarya Prakash N", id: "AIP-2026-0301", rawName: "Aiswarya.png", file: "aiswarya_png.png" },
  { name: "ANKIT SINGH SADHA", id: "AIP-2026-0272", rawName: "Ankit Singh.png", file: "ankit_singh_png.png" },
  { name: "Athira k", id: "AIP-2026-0259", rawName: "Athira.png", file: "athira_png.png" },
  { name: "Bibek Kumar Barnwal", id: "AIP-2026-0284", rawName: "Bibek.png", file: "bibek_png.png" },
  { name: "Chand Nanda", id: "AIP-2026-0660", rawName: "Chand.png", file: "chand_png.png" },
  { name: "Deep Kumar", id: "AIP-2026-0315", rawName: "DEEP.png", file: "deep_png.png" },
  { name: "Dola Bhattacharya", id: "AIP-2026-0402", rawName: "Dola.png", file: "dola_png.png" },
  { name: "Elayarasan R", id: "AIP-2026-0261", rawName: "Elayarasan.png", file: "elayarasan_png.png" },
  { name: "Gayathri Addagalla", id: "AIP-2026-0300", rawName: "Gayathri.png", file: "gayathri_png.png" },
  { name: "Harshit Gupta", id: "AIP-2026-0263", rawName: "HARSHIT.png", file: "harshit_png.png" },
  { name: "Hema Sharma", id: "AIP-2026-0267", rawName: "HEMA.png", file: "hema_png.png" },
  { name: "Imran Ahmad", id: "AIP-2026-0657", rawName: "IMRAN AHMAD.png", file: "imran_ahmad_png.png" },
  { name: "K .JAYA", id: "AIP-2026-0271", rawName: "K jaya.png", file: "k_jaya_png.png" },
  { name: "Lavi", id: "AIP-2026-0279", rawName: "lavi.png", file: "lavi_png.png" },
  { name: "Manisha Sharma", id: "AIP-2026-0404", rawName: "Manisha Sharma.png", file: "manisha_sharma_png.png" },
  { name: "Manisha", id: "AIP-2026-0407", rawName: "Manisha.png", file: "manisha_png.png" },
  { name: "Manjunath y sandaraki", id: "AIP-2026-0398", rawName: "Manjunath.png", file: "manjunath_png.png" },
  { name: "Meenu", id: "AIP-2026-0281", rawName: "Meenu.png", file: "meenu_png.png" },
  { name: "Mehvish Rizwan Shaikh", id: "AIP-2026-0322", rawName: "MEHVISH.png", file: "mehvish_png.png" },
  { name: "Moorthy A", id: "AIP-2026-0308", rawName: "Moorthy A.png", file: "moorthy_a_png.png" },
  { name: "Neetu Mehndiratta", id: "AIP-2026-0283", rawName: "NEETU.png", file: "neetu_png.png" },
  { name: "Onila Mishra", id: "AIP-2026-0666", rawName: "onlila.png", file: "onlila_png.png" },
  { name: "Pooja Bhardwaj", id: "AIP-2026-0665", rawName: "Pooja.png", file: "pooja_png.png" },
  { name: "POONAM KAWATRA", id: "AIP-2026-0650", rawName: "POONAM.png", file: "poonam_png.png" },
  { name: "PRASEETHA P M", id: "AIP-2026-0256", rawName: "PRASEETHA.png", file: "praseetha_png.png" },
  { name: "Rafia Khatoon", id: "AIP-2026-0656", rawName: "Rafia.png", file: "rafia_png.png" },
  { name: "Rashmi Rawal", id: "AIP-2026-0394", rawName: "RASHMI.png", file: "rashmi_png.png" },
  { name: "Reshmi K", id: "AIP-2026-0405", rawName: "RESHMI K.png", file: "reshmi_k_png.png" },
  { name: "Rohit Gupta", id: "AIP-2026-0266", rawName: "Rohit.png", file: "rohit_png.png" },
  { name: "Roopali", id: "AIP-2026-0269", rawName: "ROOPALI.png", file: "roopali_png.png" },
  { name: "Roshani Nigam", id: "AIP-2026-0311", rawName: "ROSHANI.png", file: "roshani_png.png" },
  { name: "S Saranya Devi", id: "AIP-2026-0362", rawName: "S SARANYA.png", file: "s_saranya_png.png" },
  { name: "S SUBRAMANIAN", id: "AIP-2026-0326", rawName: "S SUBRAMANIAN.png", file: "s_subramanian_png.png" },
  { name: "Samgeetha Sivakumar", id: "AIP-2026-0359", rawName: "SAMGEETHA.png", file: "samgeetha_png.png" },
  { name: "Samia Razi", id: "AIP-2026-0406", rawName: "SAMIA.png", file: "samia_png.png" },
  { name: "Sandeep Kumar Verma", id: "AIP-2026-0286", rawName: "Sandeep.png", file: "sandeep_png.png" },
  { name: "Sangeeta Handa", id: "AIP-2026-0662", rawName: "Sangeetha.png", file: "sangeetha_png.png" },
  { name: "Suman Keshav", id: "AIP-2026-0404", rawName: "SUMAN.png", file: "suman_png.png" },
  { name: "Suruchi Taneja", id: "AIP-2026-0285", rawName: "Suruchi.png", file: "suruchi_png.png" },
  { name: "UMMUL HAIRA K A", id: "AIP-2026-0397", rawName: "UMMUL.png", file: "ummul_png.png" },
  { name: "Vibhuti Katyal", id: "AIP-2026-0409", rawName: "Vibhuti.png", file: "vibhuti_png.png" },
  { name: "VIJAYAKUMAR R", id: "AIP-2026-0247", rawName: "Vijay Kumar.png", file: "vijay_kumar_png.png" },
  { name: "zenia dutta", id: "AIP-2026-0661", rawName: "ZENIA.png", file: "zenia_png.png" }
];

console.log(`Attendee mapping list length: ${attendeeList.length}`);

// Build strict lookup index database for verifier
const strictDB = {};

attendeeList.forEach(item => {
  const digits = item.id.replace(/\D/g, '').replace(/^2026/, '');
  const record = {
    name: item.name,
    certId: item.id,
    certImage: `/certificates/${item.file}`,
    event: "AI Passport Live – National Webinar for Educators",
    date: "20 September 2026"
  };

  // Bind exact keys
  strictDB[item.id] = record;
  strictDB[item.id.toLowerCase()] = record;
  strictDB[digits] = record;
  strictDB[item.name.toLowerCase()] = record;
});

console.log(`Generated strict database with ${Object.keys(strictDB).length} lookup keys.`);

const fileContent = `export const certDBData = ${JSON.stringify(strictDB, null, 2)};\nexport default certDBData;\n`;
fs.writeFileSync(path.join(__dirname, 'certificateDB.js'), fileContent);
console.log('Successfully updated certificateDB.js with 43 Bulk 1 Candidates ONLY!');
