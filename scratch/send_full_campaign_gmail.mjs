import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';
import { certDBData } from './certificateDB.js';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'aipassportindia@gmail.com',
    pass: 'zxltrpkkpxushepy'
  }
});

// List of 49 target attendees with their emails & names
const targetList = [
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

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function runBatch() {
  console.log(`Starting Batch Certificate Email Dispatch for ${targetList.length} attendees via aipassportindia@gmail.com...\n`);
  
  let successCount = 0;
  let failCount = 0;
  const logResults = [];

  for (let i = 0; i < targetList.length; i++) {
    const item = targetList[i];
    const rec = certDBData[item.email] || certDBData[item.email.toLowerCase()] || Object.values(certDBData).find(r => r.name && r.name.toLowerCase() === item.name.toLowerCase());

    const passportId = rec ? (rec.certId || "AIP-2026-0279") : "AIP-2026-0279";
    const certImageRel = rec && rec.certImage ? rec.certImage.replace(/^\//, '') : 'certificates/34.png';
    const certPath = path.resolve('./public', certImageRel);

    const safeName = item.name.replace(/[^a-zA-Z0-9]/g, '_');
    const attachmentFileName = `AI_Passport_Certificate_${safeName}_${passportId}.png`;

    const htmlContent = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #ffffff; padding: 40px 24px; max-width: 620px; margin: 0 auto; border-radius: 12px; border: 1px solid rgba(0,162,255,0.2);">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #ffffff; font-size: 22px; margin: 0 0 6px; font-weight: 800;">
            AI PASSPORT™
          </h1>
          <p style="color: #dfcfad; font-size: 13px; margin: 0; letter-spacing: 0.1em; text-transform: uppercase;">
            Ekaakshar Education
          </p>
        </div>

        <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); padding: 24px; border-radius: 10px; margin-bottom: 24px; line-height: 1.6; font-size: 15px; color: #e2e8f0;">
          <p style="margin-top: 0;"><strong>Dear ${item.name},</strong></p>
          <p>Thank you for participating in the <strong>AI Passport Live™ National Webinar for Educators</strong> held on <strong>20 September 2026</strong>!</p>
          <p>We are pleased to present your official <strong>Certificate of Participation</strong> (Level 1 – AI Explorer).</p>
          <p style="background: rgba(223, 207, 173, 0.1); border: 1px solid rgba(223, 207, 173, 0.3); padding: 12px 16px; border-radius: 8px; color: #dfcfad; font-size: 14px;">
            📎 <strong>Your official certificate document is attached to this email as a high-resolution PNG image.</strong>
          </p>
          <p>Thank you for your commitment to transforming education and building with AI.</p>
        </div>

        <div style="text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 20px; color: #94a3b8; font-size: 13px; line-height: 1.5;">
          <p style="margin: 0 0 4px; font-weight: 700; color: #ffffff;">Team AI Passport™</p>
          <p style="margin: 0 0 8px; color: #dfcfad;">Ekaakshar Education</p>
          <p style="margin: 0;"><a href="https://aipassport.ekaakshareducation.com" style="color: #58c4ff; text-decoration: none;">aipassport.ekaakshareducation.com</a></p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: '"Team AI Passport™ — Ekaakshar Education" <aipassportindia@gmail.com>',
      to: item.email,
      subject: 'Official Certificate: AI Passport Live™ National Webinar for Educators',
      html: htmlContent,
      attachments: [
        {
          filename: attachmentFileName,
          path: certPath
        }
      ]
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      successCount++;
      console.log(`[${i+1}/${targetList.length}] SUCCESS ➔ ${item.name} <${item.email}> (ID: ${passportId}) | MessageID: ${info.messageId}`);
      logResults.push({ index: i+1, name: item.name, email: item.email, status: 'SUCCESS', messageId: info.messageId });
    } catch(err) {
      failCount++;
      console.error(`[${i+1}/${targetList.length}] FAILED ➔ ${item.name} <${item.email}> | Error: ${err.message}`);
      logResults.push({ index: i+1, name: item.name, email: item.email, status: 'FAILED', error: err.message });
    }

    // 1-second throttle delay between emails
    await sleep(1000);
  }

  console.log(`\n==================================================`);
  console.log(`CAMPAIGN COMPLETE!`);
  console.log(`Total Target Attendees: ${targetList.length}`);
  console.log(`Successfully Delivered: ${successCount}`);
  console.log(`Failed Dispatches: ${failCount}`);
  console.log(`==================================================\n`);

  fs.writeFileSync('./scratch/campaign_dispatch_log.json', JSON.stringify(logResults, null, 2), 'utf8');
}

runBatch();
