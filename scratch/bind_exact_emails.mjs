import fs from 'fs';
import { certDBData } from './certificateDB.js';

const emailMap = [
  { email: "grvkmr095@gmail.com", name: "Dr Gaurav Kumar Singh" },
  { email: "lavi9014@gmail.com", name: "Lavi" },
  { email: "sumaan92@gmail.com", name: "Onila Mishra" },
  { email: "rpdola2402@gmail.com", name: "Dola Bhattacharya" },
  { email: "suman.keshav@ramjasrkp.com", name: "Suman Keshav" },
  { email: "ankitsinghsadha@gmail.com", name: "ANKIT SINGH SADHA" },
  { email: "neetumehndiratta81@gmail.com", name: "Neetu Mehndiratta" },
  { email: "pykawatra2013@gmail.com", name: "POONAM KAWATRA" },
  { email: "pm.praseetha5@gmail.com", name: "PRASEETHA P M" },
  { email: "abhilash.4451@gmail.com", name: "Manisha Sharma" },
  { email: "msacademyzkp@gmail.com", name: "Madam Sona Rawat" },
  { email: "rohitjatin854@gmail.com", name: "Rohit Gupta" },
  { email: "rash.2567@gmail.com", name: "Rashmi Rawal" },
  { email: "harshit1191@gmail.com", name: "Harshit Gupta" },
  { email: "saranyadevirajkumar@gmail.com", name: "S Saranya Devi" },
  { email: "reshmipny@gmail.com", name: "Reshmi K" },
  { email: "hairahussain08@gmail.com", name: "UMMUL HAIRA K A" },
  { email: "roopali195@gmail.com", name: "Roopali" },
  { email: "mehveshshaikh987@gmail.com", name: "Mehvish Rizwan Shaikh" },
  { email: "samia.razi@learn.apeejay.edu", name: "Samia Razi" },
  { email: "deepkumar86@gmail.com", name: "Deep Kumar" },
  { email: "gayathrisf21@gmail.com", name: "Gayathri Addagalla" },
  { email: "subramaniansankar87@gmail.com", name: "S SUBRAMANIAN" },
  { email: "moorthy.a@rosenberg.edu.in", name: "Moorthy A" },
  { email: "pooja.bhardwaj@learn.apeejay.edu", name: "Pooja Bhardwaj" },
  { email: "tanejasuruchi71@gmail.com", name: "Suruchi Taneja" },
  { email: "sangeeta.handa@learn.apeejay.edu", name: "Sangeeta Handa" },
  { email: "vsandeep1981@gmail.com", name: "Sandeep Kumar Verma" },
  { email: "meenu4hindi@gmail.com", name: "Meenu" },
  { email: "vijaymphilchem13@gmail.com", name: "VIJAYAKUMAR R" },
  { email: "chand.nanda@learn.apeejay.edu", name: "Chand Nanda" },
  { email: "bibekkbaranwal@gmail.com", name: "Bibek Kumar Barnwal" },
  { email: "kjayagk@gmail.com", name: "K .JAYA" },
  { email: "aiswaryaprakash2@gmail.com", name: "Aiswarya Prakash N" },
  { email: "vibhuti.katyal@learn.apeejay.edu", name: "Vibhuti Katyal" },
  { email: "athirakichu1992@gmail.com", name: "Athira k" },
  { email: "imransami09@gmail.com", name: "Imran Ahmad" },
  { email: "samgeethasivakumar@gmail.com", name: "Samgeetha Sivakumar" },
  { email: "zenia.dutta@learn.apeejay.edu", name: "zenia dutta" },
  { email: "nigamroshani24@gmail.com", name: "Roshani Nigam" },
  { email: "manumanu67776@gmail.com", name: "Manjunath y sandaraki" },
  { email: "elaiking216@gmail.com", name: "Elayarasan R" },
  { email: "meenu.sehgal2121@gmail.com", name: "Meenu Sehgal" },
  { email: "rafia.khatoon@learn.apeejay.edu", name: "Rafia Khatoon" },
  { email: "happeninhema@gmail.com", name: "Hema Sharma" }
];

const updatedDB = { ...certDBData };
let boundCount = 0;

emailMap.forEach(item => {
  const nameClean = item.name.toLowerCase().trim();

  // Find all matching keys for this person
  Object.keys(updatedDB).forEach(key => {
    const rec = updatedDB[key];
    if (rec.name && rec.name.toLowerCase().trim() === nameClean) {
      rec.email = item.email;
      updatedDB[item.email] = rec; // Index direct email key
      updatedDB[item.email.toLowerCase()] = rec;
      boundCount++;
    }
  });
});

// Write updated DB
const jsonStr = JSON.stringify(updatedDB, null, 2);
fs.writeFileSync('./scratch/certificateDB.json', jsonStr, 'utf8');
fs.writeFileSync('./scratch/certificateDB.js', `export const certDBData = ${jsonStr};\nexport default certDBData;\n`, 'utf8');

console.log(`Successfully bound ${emailMap.length} exact email IDs! Total DB keys: ${Object.keys(updatedDB).length}`);
