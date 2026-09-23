import fs from 'fs';

let mainJs = fs.readFileSync('c:\\Users\\HP\\Downloads\\AIPASS\\main.js', 'utf8');

// Add import at top if not present
if (!mainJs.includes("import certDBData from './scratch/certificateDB.json'")) {
  mainJs = "import certDBData from './scratch/certificateDB.json';\n" + mainJs;
}

// Update certificateDB definition in initCertificateVerifier
const oldDbSnippet = `const certificateDB = {
    "AIP-L1-2026-000245": {
      name: "NISHI TYAGI",
      level: "LEVEL 1 – AI EXPLORER",
      event: "AI Passport Live – The AI Revolution Begins",
      eventSub: "◆ The AI Revolution Begins ◆",
      type: "CERTIFICATE OF PARTICIPATION",
      date: "19 July 2026",
      signatory: "Hitesh Rathee",
      description: "This certificate is awarded in recognition of your active participation in Level 1 – AI Explorer, where you explored how a single AI prompt can be transformed into a complete learning experience using modern AI workflows."
    },
    "AIP-L1-2026-000108": {
      name: "RAHUL SHARMA",
      level: "LEVEL 1 – AI EXPLORER",
      event: "AI Passport Live – The AI Revolution Begins",
      eventSub: "◆ The AI Revolution Begins ◆",
      type: "CERTIFICATE OF PARTICIPATION",
      date: "19 July 2026",
      signatory: "Hitesh Rathee",
      description: "This certificate is awarded in recognition of your active participation in Level 1 – AI Explorer, where you explored how a single AI prompt can be transformed into a complete learning experience using modern AI workflows."
    },
    "AIP-L1-2026-000512": {
      name: "ANANYA VERMA",
      level: "LEVEL 1 – AI EXPLORER",
      event: "AI Passport Live – The AI Revolution Begins",
      eventSub: "◆ The AI Revolution Begins ◆",
      type: "CERTIFICATE OF PARTICIPATION",
      date: "19 July 2026",
      signatory: "Hitesh Rathee",
      description: "This certificate is awarded in recognition of your active participation in Level 1 – AI Explorer, where you explored how a single AI prompt can be transformed into a complete learning experience using modern AI workflows."
    }
  };`;

const newDbSnippet = `const certificateDB = {
    "AIP-L1-2026-000245": {
      name: "NISHI TYAGI",
      level: "LEVEL 1 – AI EXPLORER",
      event: "AI Passport Live – The AI Revolution Begins",
      eventSub: "◆ The AI Revolution Begins ◆",
      type: "CERTIFICATE OF PARTICIPATION",
      date: "19 July 2026",
      signatory: "Hitesh Rathee",
      description: "This certificate is awarded in recognition of your active participation in Level 1 – AI Explorer, where you explored how a single AI prompt can be transformed into a complete learning experience using modern AI workflows."
    },
    "AIP-L1-2026-000108": {
      name: "RAHUL SHARMA",
      level: "LEVEL 1 – AI EXPLORER",
      event: "AI Passport Live – The AI Revolution Begins",
      eventSub: "◆ The AI Revolution Begins ◆",
      type: "CERTIFICATE OF PARTICIPATION",
      date: "19 July 2026",
      signatory: "Hitesh Rathee",
      description: "This certificate is awarded in recognition of your active participation in Level 1 – AI Explorer, where you explored how a single AI prompt can be transformed into a complete learning experience using modern AI workflows."
    },
    "AIP-L1-2026-000512": {
      name: "ANANYA VERMA",
      level: "LEVEL 1 – AI EXPLORER",
      event: "AI Passport Live – The AI Revolution Begins",
      eventSub: "◆ The AI Revolution Begins ◆",
      type: "CERTIFICATE OF PARTICIPATION",
      date: "19 July 2026",
      signatory: "Hitesh Rathee",
      description: "This certificate is awarded in recognition of your active participation in Level 1 – AI Explorer, where you explored how a single AI prompt can be transformed into a complete learning experience using modern AI workflows."
    },
    ...(certDBData || {})
  };`;

if (mainJs.includes(oldDbSnippet)) {
  mainJs = mainJs.replace(oldDbSnippet, newDbSnippet);
}

// Add image display logic to record block
const oldRecordRender = `if (certDisplay) certDisplay.style.display = "block";`;
const newRecordRender = `if (certDisplay) certDisplay.style.display = "block";

      const imgContainer = document.getElementById('official-cert-image-container');
      const imgEl = document.getElementById('official-cert-image');
      const downloadBtn = document.getElementById('download-cert-btn');
      if (record && record.certImage && imgContainer && imgEl) {
        imgEl.src = record.certImage;
        if (downloadBtn) downloadBtn.href = record.certImage;
        imgContainer.style.display = 'block';
      } else if (imgContainer) {
        imgContainer.style.display = 'none';
      }`;

if (mainJs.includes(oldRecordRender)) {
  mainJs = mainJs.replace(oldRecordRender, newRecordRender);
}

fs.writeFileSync('c:\\Users\\HP\\Downloads\\AIPASS\\main.js', mainJs);
console.log("Updated main.js with certificate database and image viewer logic!");
