import fs from 'fs';
import path from 'path';
import { certDBData } from './certificateDB.js';

const emailMap = [
  { email: "grvkmr095@gmail.com", name: "Dr Gaurav Kumar Singh", id: "AIP-2026-0287" },
  { email: "lavi9014@gmail.com", name: "Lavi", id: "AIP-2026-0279" },
  { email: "sumaan92@gmail.com", name: "Onila Mishra", id: "AIP-2026-0666" },
  { email: "rpdola2402@gmail.com", name: "Dola Bhattacharya", id: "AIP-2026-0402" },
  { email: "suman.keshav@ramjasrkp.com", name: "Suman Keshav", id: "AIP-2026-0404" },
  { email: "ankitsinghsadha@gmail.com", name: "ANKIT SINGH SADHA", id: "AIP-2026-0272" },
  { email: "neetumehndiratta81@gmail.com", name: "Neetu Mehndiratta", id: "AIP-2026-0283" },
  { email: "pykawatra2013@gmail.com", name: "POONAM KAWATRA", id: "AIP-2026-0650" },
  { email: "pm.praseetha5@gmail.com", name: "PRASEETHA P M", id: "AIP-2026-0256" },
  { email: "abhilash.4451@gmail.com", name: "Manisha Sharma", id: "AIP-2026-0404" },
  { email: "msacademyzkp@gmail.com", name: "Madam Sona Rawat", id: "AIP-2026-0295" },
  { email: "rohitjatin854@gmail.com", name: "Rohit Gupta", id: "AIP-2026-0266" },
  { email: "rash.2567@gmail.com", name: "Rashmi Rawal", id: "AIP-2026-0394" },
  { email: "harshit1191@gmail.com", name: "Harshit Gupta", id: "AIP-2026-0263" },
  { email: "saranyadevirajkumar@gmail.com", name: "S Saranya Devi", id: "AIP-2026-0362" },
  { email: "reshmipny@gmail.com", name: "Reshmi K", id: "AIP-2026-0405" },
  { email: "hairahussain08@gmail.com", name: "UMMUL HAIRA K A", id: "AIP-2026-0397" },
  { email: "roopali195@gmail.com", name: "Roopali", id: "AIP-2026-0269" },
  { email: "mehveshshaikh987@gmail.com", name: "Mehvish Rizwan Shaikh", id: "AIP-2026-0322" },
  { email: "samia.razi@learn.apeejay.edu", name: "Samia Razi", id: "AIP-2026-0406" },
  { email: "deepkumar86@gmail.com", name: "Deep Kumar", id: "AIP-2026-0315" },
  { email: "gayathrisf21@gmail.com", name: "Gayathri Addagalla", id: "AIP-2026-0300" },
  { email: "subramaniansankar87@gmail.com", name: "S SUBRAMANIAN", id: "AIP-2026-0326" },
  { email: "moorthy.a@rosenberg.edu.in", name: "Moorthy A", id: "AIP-2026-0308" },
  { email: "pooja.bhardwaj@learn.apeejay.edu", name: "Pooja Bhardwaj", id: "AIP-2026-0665" },
  { email: "tanejasuruchi71@gmail.com", name: "Suruchi Taneja", id: "AIP-2026-0285" },
  { email: "sangeeta.handa@learn.apeejay.edu", name: "Sangeeta Handa", id: "AIP-2026-0662" },
  { email: "vsandeep1981@gmail.com", name: "Sandeep Kumar Verma", id: "AIP-2026-0286" },
  { email: "meenu4hindi@gmail.com", name: "Meenu", id: "AIP-2026-0281" },
  { email: "vijaymphilchem13@gmail.com", name: "VIJAYAKUMAR R", id: "AIP-2026-0247" },
  { email: "chand.nanda@learn.apeejay.edu", name: "Chand Nanda", id: "AIP-2026-0660" },
  { email: "bibekkbaranwal@gmail.com", name: "Bibek Kumar Barnwal", id: "AIP-2026-0284" },
  { email: "kjayagk@gmail.com", name: "K .JAYA", id: "AIP-2026-0271" },
  { email: "aiswaryaprakash2@gmail.com", name: "Aiswarya Prakash N", id: "AIP-2026-0301" },
  { email: "vibhuti.katyal@learn.apeejay.edu", name: "Vibhuti Katyal", id: "AIP-2026-0409" },
  { email: "athirakichu1992@gmail.com", name: "Athira k", id: "AIP-2026-0259" },
  { email: "imransami09@gmail.com", name: "Imran Ahmad", id: "AIP-2026-0657" },
  { email: "samgeethasivakumar@gmail.com", name: "Samgeetha Sivakumar", id: "AIP-2026-0359" },
  { email: "zenia.dutta@learn.apeejay.edu", name: "zenia dutta", id: "AIP-2026-0661" },
  { email: "nigamroshani24@gmail.com", name: "Roshani Nigam", id: "AIP-2026-0311" },
  { email: "manumanu67776@gmail.com", name: "Manjunath y sandaraki", id: "AIP-2026-0398" },
  { email: "elaiking216@gmail.com", name: "Elayarasan R", id: "AIP-2026-0261" },
  { email: "meenu.sehgal2121@gmail.com", name: "Meenu Sehgal", id: "AIP-2026-0664" },
  { email: "rafia.khatoon@learn.apeejay.edu", name: "Rafia Khatoon", id: "AIP-2026-0656" },
  { email: "happeninhema@gmail.com", name: "Hema Sharma", id: "AIP-2026-0267" }
];

console.log("=== CERTIFICATE IMAGE MAPPING REPORT ===");
emailMap.forEach((item, idx) => {
  const rec = certDBData[item.id] || certDBData[item.email];
  const certImg = rec ? rec.certImage : 'MISSING';
  const imgExists = fs.existsSync(path.join('./public', certImg.replace(/^\//, '')));
  console.log(`${idx+1}. ${item.name} (${item.id}) ➔ Image: ${certImg} [File Exists: ${imgExists}]`);
});
