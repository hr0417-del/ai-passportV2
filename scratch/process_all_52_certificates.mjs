import fs from 'fs';
import path from 'path';
import https from 'https';

const BULK_DIR = 'C:\\Users\\HP\\Downloads\\(Bulk 1) AI PASSPORT LIVE CERTIFICATE 20 SEPT 2026 (1)';
const PUBLIC_CERT_DIR = 'c:\\Users\\HP\\Downloads\\AIPASS\\public\\certificates';

if (!fs.existsSync(PUBLIC_CERT_DIR)) {
  fs.mkdirSync(PUBLIC_CERT_DIR, { recursive: true });
}

const knownMappings = {
  "Aiswarya.png": { name: "Aiswarya Prakash N", certId: "AIP-2026-0301", email: "aiswaryaprakash2@gmail.com" },
  "Ankit Singh.png": { name: "ANKIT SINGH SADHA", certId: "AIP-2026-0272", email: "ankitsinghsadha@gmail.com" },
  "Athira.png": { name: "Athira k", certId: "AIP-2026-0259", email: "athirakichu1992@gmail.com" },
  "Bibek.png": { name: "Bibek Kumar Barnwal", certId: "AIP-2026-0284", email: "bibekkbaranwal@gmail.com" },
  "Chand.png": { name: "Chand Nanda", certId: "AIP-2026-0660", email: "chand.nanda@learn.apeejay.edu" },
  "DEEP.png": { name: "Deep Kumar", certId: "AIP-2026-0315", email: "deepkumar86@gmail.com" },
  "Dola.png": { name: "Dola Bhattacharya", certId: "AIP-2026-0402", email: "rpdola2402@gmail.com" },
  "DR GAURAV.png": { name: "Dr Gaurav Kumar Singh", certId: "AIP-2026-0287", email: "grvkmr095@gmail.com" },
  "Elayarasan.png": { name: "Elayarasan R", certId: "AIP-2026-0261", email: "elaiking216@gmail.com" },
  "Gayathri.png": { name: "Gayathri Addagalla", certId: "AIP-2026-0300", email: "gayathrisf21@gmail.com" },
  "HARSHIT.png": { name: "Harshit Gupta", certId: "AIP-2026-0263", email: "harshit1191@gmail.com" },
  "HEMA.png": { name: "Hema Sharma", certId: "AIP-2026-0267", email: "happeninhema@gmail.com" },
  "IMRAN AHMAD.png": { name: "Imran Ahmad", certId: "AIP-2026-0657", email: "imransami09@gmail.com" },
  "K jaya.png": { name: "K .JAYA", certId: "AIP-2026-0271", email: "kjayagk@gmail.com" },
  "lavi.png": { name: "Lavi", certId: "AIP-2026-0279", email: "lavi9014@gmail.com" },
  "Mahabubi.png": { name: "Mahabubi", certId: "AIP-2026-0672" },
  "MALATHI.png": { name: "Malathi", certId: "AIP-2026-0673" },
  "Manisha Sharma.png": { name: "Manisha Sharma", certId: "AIP-2026-0404", email: "abhilash.4451@gmail.com" },
  "Manisha.png": { name: "Manisha", certId: "AIP-2026-0407" },
  "Manjunath.png": { name: "Manjunath y sandaraki", certId: "AIP-2026-0398", email: "manumanu67776@gmail.com" },
  "MEENU SEHGAL.png": { name: "Meenu Sehgal", certId: "AIP-2026-0664", email: "meenu.sehgal@learn.apeejay.edu" },
  "Meenu.png": { name: "Meenu", certId: "AIP-2026-0281", email: "meenu4hindi@gmail.com" },
  "MEHVISH.png": { name: "Mehvish Rizwan Shaikh", certId: "AIP-2026-0322", email: "mehveshshaikh987@gmail.com" },
  "Moorthy A.png": { name: "Moorthy A", certId: "AIP-2026-0308", email: "moorthy.a@rosenberg.edu.in" },
  "NEETU.png": { name: "Neetu Mehndiratta", certId: "AIP-2026-0283", email: "neetumehndiratta81@gmail.com" },
  "onlila.png": { name: "Onila Mishra", certId: "AIP-2026-0666", email: "sumaan92@gmail.com" },
  "Pooja.png": { name: "Pooja Bhardwaj", certId: "AIP-2026-0665", email: "pooja.bhardwaj@learn.apeejay.edu" },
  "POONAM.png": { name: "POONAM KAWATRA", certId: "AIP-2026-0650", email: "pykawatra2013@gmail.com" },
  "PRASEETHA.png": { name: "PRASEETHA P M", certId: "AIP-2026-0256", email: "pm.praseetha5@gmail.com" },
  "Rafia.png": { name: "Rafia Khatoon", certId: "AIP-2026-0656", email: "rafia.khatoon@learn.apeejay.edu" },
  "RASHMI.png": { name: "Rashmi Rawal", certId: "AIP-2026-0394", email: "rash.2567@gmail.com" },
  "REENA.png": { name: "Reena", certId: "AIP-2026-0674" },
  "RESHMI K.png": { name: "Reshmi K", certId: "AIP-2026-0405", email: "reshmipny@gmail.com" },
  "Rohit.png": { name: "Rohit Gupta", certId: "AIP-2026-0266", email: "rohitjatin854@gmail.com" },
  "ROOPALI.png": { name: "Roopali", certId: "AIP-2026-0269", email: "roopali195@gmail.com" },
  "ROSHANI.png": { name: "Roshani Nigam", certId: "AIP-2026-0311", email: "nigamroshani24@gmail.com" },
  "S SARANYA.png": { name: "S Saranya Devi", certId: "AIP-2026-0362", email: "saranyadevirajkumar@gmail.com" },
  "S SUBRAMANIAN.png": { name: "S SUBRAMANIAN", certId: "AIP-2026-0326", email: "subramaniansankar87@gmail.com" },
  "SAMGEETHA.png": { name: "Samgeetha Sivakumar", certId: "AIP-2026-0359", email: "samgeethasivakumar@gmail.com" },
  "SAMIA.png": { name: "Samia Razi", certId: "AIP-2026-0406", email: "samia.razi@learn.apeejay.edu" },
  "Sandeep.png": { name: "Sandeep Kumar Verma", certId: "AIP-2026-0286", email: "vsandeep1981@gmail.com" },
  "Sangeetha.png": { name: "Sangeeta Handa", certId: "AIP-2026-0662", email: "sangeeta.handa@learn.apeejay.edu" },
  "SHRUTI.png": { name: "Shruti", certId: "AIP-2026-0675" },
  "SONA.png": { name: "Madam Sona Rawat", certId: "AIP-2026-0399", email: "msacademyzkp@gmail.com" },
  "SONAL.png": { name: "Sonal", certId: "AIP-2026-0676" },
  "SRIDEVI.png": { name: "Sridevi", certId: "AIP-2026-0677" },
  "SUMAN.png": { name: "Suman Keshav", certId: "AIP-2026-0404", email: "suman.keshav@ramjasrkp.com" },
  "Suruchi.png": { name: "Suruchi Taneja", certId: "AIP-2026-0285", email: "tanejasuruchi71@gmail.com" },
  "UMMUL.png": { name: "UMMUL HAIRA K A", certId: "AIP-2026-0397", email: "hairahussain08@gmail.com" },
  "Vibhuti.png": { name: "Vibhuti Katyal", certId: "AIP-2026-0409", email: "vibhuti.katyal@learn.apeejay.edu" },
  "Vijay Kumar.png": { name: "VIJAYAKUMAR R", certId: "AIP-2026-0247", email: "vijaymphilchem13@gmail.com" },
  "ZENIA.png": { name: "zenia dutta", certId: "AIP-2026-0661", email: "zenia.dutta@learn.apeejay.edu" }
};

async function run() {
  const files = fs.readdirSync(BULK_DIR).filter(f => f.endsWith('.png'));
  console.log(`Found ${files.length} certificate PNG files in Bulk directory.`);

  const certificateDB = {};

  let nextIdCounter = 680;

  for (const file of files) {
    const srcPath = path.join(BULK_DIR, file);
    const cleanFilename = file.replace(/[\s\(\)]+/g, '_').toLowerCase();
    const destPath = path.join(PUBLIC_CERT_DIR, cleanFilename);

    fs.copyFileSync(srcPath, destPath);

    const override = knownMappings[file] || {};
    const baseName = path.parse(file).name.trim();
    const name = override.name || baseName;
    const certId = override.certId || `AIP-2026-${("0000" + nextIdCounter++).slice(-4)}`;
    const email = override.email || null;
    const certImage = `/certificates/${cleanFilename}`;

    const record = {
      name,
      certId,
      certImage,
      event: "AI Passport Live – National Webinar for Educators",
      date: "20 September 2026"
    };
    if (email) record.email = email;

    // Extract numerical suffix e.g. "0301" from "AIP-2026-0301"
    const numMatch = certId.match(/(\d+)$/);
    const fullNum = numMatch ? numMatch[1] : null; // "0301"
    const unpaddedNum = fullNum ? parseInt(fullNum, 10).toString() : null; // "301"

    // Index all possible search query variants
    certificateDB[certId] = record;
    certificateDB[certId.toLowerCase()] = record;

    if (fullNum) {
      certificateDB[fullNum] = record; // "0301"
      certificateDB[`AIP-2026-${unpaddedNum}`] = record; // "AIP-2026-301"
      certificateDB[`aip-2026-${unpaddedNum}`] = record; // "aip-2026-301"
    }
    if (unpaddedNum) {
      certificateDB[unpaddedNum] = record; // "301"
    }

    certificateDB[name.toLowerCase()] = record;
    if (email) {
      certificateDB[email] = record;
      certificateDB[email.toLowerCase()] = record;
    }
  }

  console.log(`Processed ${files.length} certificates.`);
  console.log(`Total DB keys generated: ${Object.keys(certificateDB).length}`);

  const jsonStr = JSON.stringify(certificateDB, null, 2);
  fs.writeFileSync('./scratch/certificateDB.json', jsonStr, 'utf8');
  fs.writeFileSync('./scratch/certificateDB.js', `export const certDBData = ${jsonStr};\nexport default certDBData;\n`, 'utf8');
}

run().catch(console.error);
