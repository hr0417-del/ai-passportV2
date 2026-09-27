import fs from 'fs';
import { certDBData } from './certificateDB.js';

const list = [
  { name: "Dr Gaurav Kumar Singh", id: "AIP-2026-0287" },
  { name: "Lavi", id: "AIP-2026-0279" },
  { name: "Onila Mishra", id: "AIP-2026-0666" },
  { name: "Dola Bhattacharya", id: "AIP-2026-0402" },
  { name: "Suman Keshav", id: "AIP-2026-0404" },
  { name: "ANKIT SINGH SADHA", id: "AIP-2026-0272" },
  { name: "Neetu Mehndiratta", id: "AIP-2026-0283" },
  { name: "POONAM KAWATRA", id: "AIP-2026-0650" },
  { name: "PRASEETHA P M", id: "AIP-2026-0256" },
  { name: "Manisha Sharma", id: "AIP-2026-0404" },
  { name: "Madam Sona Rawat", id: "AIP-2026-0295" },
  { name: "Rohit Gupta", id: "AIP-2026-0266" },
  { name: "Rashmi Rawal", id: "AIP-2026-0394" },
  { name: "Harshit Gupta", id: "AIP-2026-0263" },
  { name: "S Saranya Devi", id: "AIP-2026-0362" },
  { name: "Reshmi K", id: "AIP-2026-0405" },
  { name: "UMMUL HAIRA K A", id: "AIP-2026-0397" },
  { name: "Roopali", id: "AIP-2026-0269" },
  { name: "Mehvish Rizwan Shaikh", id: "AIP-2026-0322" },
  { name: "Samia Razi", id: "AIP-2026-0406" },
  { name: "Deep Kumar", id: "AIP-2026-0315" },
  { name: "Suman Keshav", id: "AIP-2026-0404" },
  { name: "Gayathri Addagalla", id: "AIP-2026-0300" },
  { name: "Manisha Sharma", id: "AIP-2026-0407" },
  { name: "S SUBRAMANIAN", id: "AIP-2026-0326" },
  { name: "Moorthy A", id: "AIP-2026-0308" },
  { name: "Pooja Bhardwaj", id: "AIP-2026-0665" },
  { name: "Suruchi Taneja", id: "AIP-2026-0285" },
  { name: "Reshmi .K", id: "AIP-2026-0408" },
  { name: "Sangeeta Handa", id: "AIP-2026-0662" },
  { name: "Sandeep Kumar Verma", id: "AIP-2026-0286" },
  { name: "Meenu", id: "AIP-2026-0281" },
  { name: "VIJAYAKUMAR R", id: "AIP-2026-0247" },
  { name: "Chand Nanda", id: "AIP-2026-0660" },
  { name: "Bibek Kumar Barnwal", id: "AIP-2026-0284" },
  { name: "K .JAYA", id: "AIP-2026-0271" },
  { name: "Aiswarya Prakash N", id: "AIP-2026-0301" },
  { name: "Vibhuti Katyal", id: "AIP-2026-0409" },
  { name: "Athira k", id: "AIP-2026-0259" },
  { name: "Imran Ahmad", id: "AIP-2026-0657" },
  { name: "Samgeetha Sivakumar", id: "AIP-2026-0359" },
  { name: "zenia dutta", id: "AIP-2026-0661" },
  { name: "Roshani Nigam", id: "AIP-2026-0311" },
  { name: "Rashmi Rawal", id: "AIP-2026-0394" },
  { name: "Manjunath y sandaraki", id: "AIP-2026-0398" },
  { name: "Elayarasan R", id: "AIP-2026-0261" },
  { name: "Meenu Sehgal", id: "AIP-2026-0664" },
  { name: "Rafia Khatoon", id: "AIP-2026-0656" },
  { name: "Hema Sharma", id: "AIP-2026-0267" }
];

let foundCount = 0;
let missingCount = 0;
const missing = [];

list.forEach(item => {
  const rec = certDBData[item.id] || Object.values(certDBData).find(r => r.name && r.name.toLowerCase() === item.name.toLowerCase());
  if (rec) {
    foundCount++;
  } else {
    missingCount++;
    missing.push(item);
  }
});

console.log(`Audit Summary: ${foundCount} / ${list.length} present.`);
if (missing.length > 0) {
  console.log("Missing records:", missing);
}
